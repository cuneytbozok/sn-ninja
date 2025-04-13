import { supabase } from "../../../lib/supabase";
import { Logger } from "./utils/logger";

interface RobotsTxtSource {
  id: string;
  url: string;
  site_name: string;
}

/**
 * Fetches and parses a robots.txt file to extract sitemap URLs
 * @param url The URL of the robots.txt file
 * @returns Array of sitemap URLs found in the robots.txt file
 */
async function fetchAndParseSitemaps(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ServiceNow-Ninja-Crawler/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch robots.txt from ${url}: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    const sitemapRegex = /Sitemap:\s*(.+)/gi;
    const sitemaps: string[] = [];
    let match;

    while ((match = sitemapRegex.exec(text)) !== null) {
      if (match[1] && match[1].trim().length > 0) {
        sitemaps.push(match[1].trim());
      }
    }

    return sitemaps;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error parsing robots.txt from ${url}: ${errorMessage}`);
  }
}

/**
 * Saves discovered sitemaps to the database
 * @param robotsTxtId The ID of the robots.txt source
 * @param sitemapUrls Array of sitemap URLs to save
 */
async function saveSitemaps(robotsTxtId: string, sitemapUrls: string[]): Promise<void> {
  for (const url of sitemapUrls) {
    // Check if the sitemap already exists
    const { data: existingSitemap } = await supabase
      .from("sitemaps")
      .select("id")
      .eq("url", url)
      .single();

    if (!existingSitemap) {
      // Insert the new sitemap
      const { error } = await supabase.from("sitemaps").insert({
        robots_txt_source_id: robotsTxtId,
        url,
      });

      if (error) {
        throw new Error(`Failed to save sitemap ${url}: ${error.message}`);
      }
    }
  }
}

/**
 * Updates the last_crawled_at timestamp for a robots.txt source
 * @param robotsTxtId The ID of the robots.txt source
 */
async function updateRobotsTxtCrawlTimestamp(robotsTxtId: string): Promise<void> {
  const { error } = await supabase
    .from("robots_txt_sources")
    .update({ last_crawled_at: new Date().toISOString() })
    .eq("id", robotsTxtId);

  if (error) {
    throw new Error(`Failed to update robots.txt crawl timestamp: ${error.message}`);
  }
}

/**
 * Discovers sitemaps from robots.txt sources and saves them to the database
 */
export async function discoverSitemaps(): Promise<void> {
  const logger = new Logger("sitemap-discovery");

  try {
    // Get all enabled robots.txt sources
    const { data: robotsTxtSources, error } = await supabase
      .from("robots_txt_sources")
      .select("id, url, site_name")
      .eq("enabled", true);

    if (error) {
      throw new Error(`Failed to fetch robots.txt sources: ${error.message}`);
    }

    if (!robotsTxtSources || robotsTxtSources.length === 0) {
      logger.info("No robots.txt sources found");
      return;
    }

    // Apply limit if MAX_SITEMAPS_TO_PROCESS is set
    const maxSitemaps = process.env.MAX_SITEMAPS_TO_PROCESS ? 
      parseInt(process.env.MAX_SITEMAPS_TO_PROCESS, 10) : 
      robotsTxtSources.length;
    
    const sourcesToProcess = robotsTxtSources.slice(0, maxSitemaps);
    
    logger.info(`Found ${robotsTxtSources.length} robots.txt sources, processing ${sourcesToProcess.length}`);

    // Process each robots.txt source
    for (const source of sourcesToProcess) {
      try {
        logger.info(`Processing robots.txt from ${source.site_name} (${source.url})`);
        
        // Fetch and parse sitemaps
        const sitemapUrls = await fetchAndParseSitemaps(source.url);
        
        logger.info(`Found ${sitemapUrls.length} sitemaps in ${source.site_name}`);
        
        // Save sitemaps to the database
        await saveSitemaps(source.id, sitemapUrls);
        
        // Update the last_crawled_at timestamp
        await updateRobotsTxtCrawlTimestamp(source.id);
        
        logger.info(`Successfully processed robots.txt for ${source.site_name}`);
      } catch (error: unknown) {
        logger.error(`Error processing robots.txt from ${source.site_name}`, source.id, error);
      }
    }

    logger.info("Sitemap discovery completed successfully");
  } catch (error: unknown) {
    logger.error("Error in sitemap discovery process", null, error);
    throw error;
  }
} 