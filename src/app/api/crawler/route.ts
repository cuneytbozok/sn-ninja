import { NextResponse } from "next/server";
import { runCrawler, runCrawlerStep } from "./crawler";
import { Logger } from "./utils/logger";

// API key validation middleware
function validateApiKey(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  
  const apiKey = authHeader.substring(7);
  return apiKey === process.env.CRAWLER_API_KEY;
}

/**
 * POST /api/crawler
 * Runs the crawler or a specific step
 */
export async function POST(request: Request) {
  // Validate API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: "Unauthorized. Invalid or missing API key." },
      { status: 401 }
    );
  }
  
  const logger = new Logger("crawler-api");
  
  try {
    // Parse request body
    const body = await request.json();
    const { step } = body;
    
    if (step) {
      // Run a specific step
      if (!["sitemaps", "content", "embeddings", "combined"].includes(step)) {
        return NextResponse.json(
          { error: `Invalid step: ${step}. Valid steps are: sitemaps, content, embeddings, combined` },
          { status: 400 }
        );
      }
      
      logger.info(`Starting crawler step: ${step}`);
      await runCrawlerStep(step as "sitemaps" | "content" | "embeddings" | "combined");
      return NextResponse.json({ success: true, message: `Crawler step '${step}' completed successfully` });
    } else {
      // Run the complete crawler
      logger.info("Starting full crawler process");
      await runCrawler();
      return NextResponse.json({ success: true, message: "Crawler process completed successfully" });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error in crawler API", null, error);
    return NextResponse.json(
      { error: `Failed to run crawler: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/crawler
 * Returns the status of the crawler
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    message: "Crawler is ready to accept commands. Use POST to trigger the crawler.",
    availableSteps: ["sitemaps", "content", "embeddings", "combined"]
  });
} 