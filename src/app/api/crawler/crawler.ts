import { discoverSitemaps } from "./sitemap-discovery";
import { extractContent } from "./content-extractor";
import { generateEmbeddings } from "./embedding-generator";
import { Logger } from "./utils/logger";

/**
 * Runs the complete crawling process:
 * 1. Discover sitemaps from robots.txt files
 * 2. Extract content from pages in the sitemaps
 * 3. Generate embeddings for the content
 */
export async function runCrawler(): Promise<void> {
  const logger = new Logger("crawler");
  
  try {
    logger.info("Starting crawling process");
    
    // Step 1: Discover sitemaps
    logger.info("Step 1: Discovering sitemaps from robots.txt");
    await discoverSitemaps();
    
    // Step 2: Extract content
    logger.info("Step 2: Extracting content from pages in sitemaps");
    await extractContent();
    
    // Step 3: Generate embeddings
    logger.info("Step 3: Generating embeddings for content");
    await generateEmbeddings();
    
    logger.info("Crawling process completed successfully");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error in crawling process: ${errorMessage}`, null, error);
    throw error;
  }
}

/**
 * Runs a specific step of the crawling process
 * @param step The step to run
 */
export async function runCrawlerStep(step: "sitemaps" | "content" | "embeddings" | "combined"): Promise<void> {
  const logger = new Logger("crawler");
  
  try {
    logger.info(`Running crawler step: ${step}`);
    
    switch (step) {
      case "sitemaps":
        await discoverSitemaps();
        break;
      case "content":
        await extractContent();
        break;
      case "embeddings":
        await generateEmbeddings();
        break;
      case "combined":
        // Run sitemaps discovery and content extraction in sequence
        logger.info("Running combined step: sitemaps discovery");
        await discoverSitemaps();
        
        logger.info("Running combined step: content extraction");
        await extractContent();
        break;
      default:
        throw new Error(`Unknown step: ${step}`);
    }
    
    logger.info(`Crawler step '${step}' completed successfully`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Error in crawler step '${step}': ${errorMessage}`, null, error);
    throw error;
  }
} 