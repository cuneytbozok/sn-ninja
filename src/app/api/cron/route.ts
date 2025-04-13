import { NextResponse } from "next/server";
import { runCrawler, runCrawlerStep } from "../crawler/crawler";
import { Logger } from "../crawler/utils/logger";

// Validate secret key from Vercel Cron
function validateCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  
  const cronSecret = authHeader.substring(7);
  return cronSecret === process.env.CRON_SECRET;
}

/**
 * GET /api/cron
 * Endpoint for Vercel Cron to trigger scheduled crawls
 */
export async function GET(request: Request) {
  // Validate cron secret
  if (!validateCronSecret(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Invalid or missing cron secret." },
      { status: 401 }
    );
  }
  
  const logger = new Logger("cron-job");
  
  try {
    // Get the step from query parameters
    const { searchParams } = new URL(request.url);
    const step = searchParams.get("step");
    
    if (step) {
      // Run a specific step
      if (!["sitemaps", "content", "embeddings", "combined"].includes(step)) {
        return NextResponse.json(
          { error: `Invalid step: ${step}. Valid steps are: sitemaps, content, embeddings, combined` },
          { status: 400 }
        );
      }
      
      logger.info(`Cron job: Starting crawler step: ${step}`);
      await runCrawlerStep(step as "sitemaps" | "content" | "embeddings" | "combined");
      return NextResponse.json({ success: true, message: `Cron job: Crawler step '${step}' completed successfully` });
    } else {
      // Run the complete crawler
      logger.info("Cron job: Starting full crawler process");
      await runCrawler();
      return NextResponse.json({ success: true, message: "Cron job: Crawler process completed successfully" });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error in cron job", null, error);
    return NextResponse.json(
      { error: `Failed to run crawler: ${errorMessage}` },
      { status: 500 }
    );
  }
} 