import { supabase } from "../../../lib/supabase";
import { Logger } from "./utils/logger";
import * as crypto from "crypto";

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

interface Sitemap {
  id: string;
  url: string;
}

/**
 * Fetches and parses an XML sitemap to extract URLs
 * @param url The URL of the sitemap
 * @returns Array of URLs found in the sitemap
 */
async function fetchAndParseSitemap(url: string): Promise<SitemapEntry[]> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ServiceNow-Ninja-Crawler/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap from ${url}: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    
    // Check if this is a sitemap index (contains multiple sitemaps)
    if (text.includes("<sitemapindex")) {
      const sitemapUrlRegex = /<loc>(.*?)<\/loc>/g;
      const sitemapUrls: string[] = [];
      let match;
      
      while ((match = sitemapUrlRegex.exec(text)) !== null) {
        if (match[1] && match[1].trim().length > 0) {
          sitemapUrls.push(match[1].trim());
        }
      }
      
      // Fetch and parse all sub-sitemaps
      const allEntries: SitemapEntry[] = [];
      for (const sitemapUrl of sitemapUrls) {
        const entries = await fetchAndParseSitemap(sitemapUrl);
        allEntries.push(...entries);
      }
      
      return allEntries;
    } else {
      // Regular sitemap with URLs
      const entries: SitemapEntry[] = [];
      const urlRegex = /<url>(.*?)<\/url>/gs;
      let urlMatch;
      
      while ((urlMatch = urlRegex.exec(text)) !== null) {
        const urlContent = urlMatch[1];
        const locMatch = /<loc>(.*?)<\/loc>/i.exec(urlContent);
        
        if (locMatch && locMatch[1]) {
          const entry: SitemapEntry = {
            url: locMatch[1].trim(),
          };
          
          // Extract optional fields
          const lastmodMatch = /<lastmod>(.*?)<\/lastmod>/i.exec(urlContent);
          if (lastmodMatch && lastmodMatch[1]) {
            entry.lastmod = lastmodMatch[1].trim();
          }
          
          const changefreqMatch = /<changefreq>(.*?)<\/changefreq>/i.exec(urlContent);
          if (changefreqMatch && changefreqMatch[1]) {
            entry.changefreq = changefreqMatch[1].trim();
          }
          
          const priorityMatch = /<priority>(.*?)<\/priority>/i.exec(urlContent);
          if (priorityMatch && priorityMatch[1]) {
            entry.priority = priorityMatch[1].trim();
          }
          
          entries.push(entry);
        }
      }
      
      return entries;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error parsing sitemap from ${url}: ${errorMessage}`);
  }
}

/**
 * Extracts content from a web page
 * @param url The URL of the page to extract content from
 * @returns Object containing title and content
 */
async function extractPageContent(url: string): Promise<{ title: string; content: string; contentHash: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ServiceNow-Ninja-Crawler/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page from ${url}: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract title
    const titleMatch = /<title>(.*?)<\/title>/i.exec(html);
    const title = titleMatch && titleMatch[1] ? titleMatch[1].trim() : "";
    
    // Extract main content (focusing on the most likely content areas)
    let content = "";
    
    // Try to extract from common content containers
    const mainContentRegex = /<(?:main|article|div\s+(?:[^>]*\s+)?(?:id|class)=["'](?:main|content|article|post|documentation|docs)["'][^>]*)>(.*?)<\/(?:main|article|div)>/is;
    const mainMatch = mainContentRegex.exec(html);
    
    if (mainMatch && mainMatch[1]) {
      content = mainMatch[1];
    } else {
      // Fallback: get the body
      const bodyRegex = /<body[^>]*>(.*?)<\/body>/is;
      const bodyMatch = bodyRegex.exec(html);
      content = bodyMatch && bodyMatch[1] ? bodyMatch[1] : html;
    }
    
    // Clean up HTML
    content = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ") // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")    // Remove styles
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")         // Remove navigation
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ") // Remove footer
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ") // Remove header
      .replace(/<[^>]+>/g, " ")                                          // Remove remaining tags
      .replace(/\s+/g, " ")                                              // Normalize whitespace
      .trim();
    
    // Generate a hash of the content for change detection
    const contentHash = crypto.createHash("sha256").update(content).digest("hex");
    
    return { title, content, contentHash };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error extracting content from ${url}: ${errorMessage}`);
  }
}

/**
 * Saves or updates a documentation page in the database
 * @param sitemapId The ID of the sitemap
 * @param url The URL of the page
 * @param title The title of the page
 * @param content The content of the page
 * @param contentHash The hash of the content
 * @returns The ID of the page
 */
async function saveDocumentationPage(
  sitemapId: string,
  url: string,
  title: string,
  content: string,
  contentHash: string
): Promise<string> {
  // Check if the page already exists
  const { data: existingPage } = await supabase
    .from("documentation_pages")
    .select("id, content_hash")
    .eq("url", url)
    .single();
  
  const now = new Date().toISOString();
  
  if (existingPage) {
    // Only update if the content has changed
    if (existingPage.content_hash !== contentHash) {
      const { error } = await supabase
        .from("documentation_pages")
        .update({
          title,
          content,
          content_hash: contentHash,
          last_crawled_at: now,
          updated_at: now,
        })
        .eq("id", existingPage.id);
      
      if (error) {
        throw new Error(`Failed to update page ${url}: ${error.message}`);
      }
      
      return existingPage.id;
    } else {
      // Just update the last_crawled_at timestamp
      const { error } = await supabase
        .from("documentation_pages")
        .update({
          last_crawled_at: now,
        })
        .eq("id", existingPage.id);
      
      if (error) {
        throw new Error(`Failed to update crawl timestamp for page ${url}: ${error.message}`);
      }
      
      return existingPage.id;
    }
  } else {
    // Insert a new page
    const { data, error } = await supabase
      .from("documentation_pages")
      .insert({
        sitemap_id: sitemapId,
        url,
        title,
        content,
        content_hash: contentHash,
        last_crawled_at: now,
      })
      .select("id")
      .single();
    
    if (error) {
      throw new Error(`Failed to save page ${url}: ${error.message}`);
    }
    
    return data.id;
  }
}

/**
 * Updates the last_crawled_at timestamp for a sitemap
 * @param sitemapId The ID of the sitemap
 */
async function updateSitemapCrawlTimestamp(sitemapId: string): Promise<void> {
  const { error } = await supabase
    .from("sitemaps")
    .update({ last_crawled_at: new Date().toISOString() })
    .eq("id", sitemapId);

  if (error) {
    throw new Error(`Failed to update sitemap crawl timestamp: ${error.message}`);
  }
}

/**
 * Extracts content from all pages in all sitemaps
 */
export async function extractContent(): Promise<void> {
  const logger = new Logger("content-extractor");
  const processingDelay = 3000; // 3 seconds delay between requests
  
  try {
    // Get all sitemaps
    const { data: sitemaps, error } = await supabase
      .from("sitemaps")
      .select("id, url");
    
    if (error) {
      throw new Error(`Failed to fetch sitemaps: ${error.message}`);
    }
    
    if (!sitemaps || sitemaps.length === 0) {
      logger.info("No sitemaps found");
      return;
    }
    
    logger.info(`Found ${sitemaps.length} sitemaps to process`);
    
    // Process each sitemap
    for (const sitemap of sitemaps) {
      try {
        logger.info(`Processing sitemap ${sitemap.url}`);
        
        // Fetch and parse sitemap
        const entries = await fetchAndParseSitemap(sitemap.url);
        
        // Apply limit if MAX_PAGES_PER_SITEMAP is set
        const maxPages = process.env.MAX_PAGES_PER_SITEMAP ? 
          parseInt(process.env.MAX_PAGES_PER_SITEMAP, 10) : 
          entries.length;
          
        const entriesToProcess = entries.slice(0, maxPages);
        
        logger.info(`Found ${entries.length} URLs in sitemap ${sitemap.url}, processing ${entriesToProcess.length}`);
        
        // Process each URL
        let processedCount = 0;
        
        for (const entry of entriesToProcess) {
          try {
            // Add delay to respect rate limits
            if (processedCount > 0) {
              await new Promise(resolve => setTimeout(resolve, processingDelay));
            }
            
            logger.info(`Processing page ${entry.url}`, sitemap.id);
            
            // Extract content
            const { title, content, contentHash } = await extractPageContent(entry.url);
            
            // Save to database
            await saveDocumentationPage(sitemap.id, entry.url, title, content, contentHash);
            
            logger.info(`Successfully processed page ${entry.url}`, sitemap.id);
            processedCount++;
          } catch (error: unknown) {
            logger.error(`Error processing page ${entry.url}`, sitemap.id, error);
          }
        }
        
        // Update the last_crawled_at timestamp
        await updateSitemapCrawlTimestamp(sitemap.id);
        
        logger.info(`Successfully processed sitemap ${sitemap.url}`);
      } catch (error: unknown) {
        logger.error(`Error processing sitemap ${sitemap.url}`, sitemap.id, error);
      }
    }
    
    logger.info("Content extraction completed successfully");
  } catch (error: unknown) {
    logger.error("Error in content extraction process", null, error);
    throw error;
  }
} 