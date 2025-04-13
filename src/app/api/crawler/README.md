# ServiceNow Documentation Crawler

This module provides a complete documentation crawling system for ServiceNow-related documentation. The crawler discovers sitemaps from robots.txt files, extracts content from pages, and generates embeddings to store in Pinecone for use in semantic search and retrieval.

## Architecture

The crawler consists of several components:

1. **Sitemap Discovery** (`sitemap-discovery.ts`) - Extracts sitemap URLs from robots.txt files
2. **Content Extractor** (`content-extractor.ts`) - Parses sitemaps and extracts content from pages
3. **Embedding Generator** (`embedding-generator.ts`) - Generates embeddings for extracted content and stores them in Pinecone
4. **Main Crawler** (`crawler.ts`) - Orchestrates the entire crawling process
5. **API Routes** - Provides endpoints to trigger and control the crawler
   - `/api/crawler` - Direct API endpoint
   - `/api/cron` - Endpoint for Vercel Cron to trigger scheduled crawls

## Database Schema

The crawler uses the following tables in Supabase:

1. `robots_txt_sources` - Stores URLs of robots.txt files to crawl
2. `sitemaps` - Stores sitemap URLs discovered from robots.txt files
3. `documentation_pages` - Stores extracted content from pages
4. `page_embeddings` - Stores references to embeddings in Pinecone
5. `crawler_logs` - Stores logs from the crawler

## Configuration

Set the following environment variables:

- `OPENAI_API_KEY` - OpenAI API key for generating embeddings
- `CRAWLER_API_KEY` - API key for the crawler API endpoint
- `CRON_SECRET` - Secret for the cron job endpoint

## Usage

### API Endpoints

#### GET /api/crawler

Returns the status of the crawler and available steps.

#### POST /api/crawler

Runs the crawler or a specific step.

**Request Headers:**
```
Authorization: Bearer <CRAWLER_API_KEY>
```

**Request Body (Full Crawl):**
```json
{}
```

**Request Body (Specific Step):**
```json
{
  "step": "sitemaps" | "content" | "embeddings"
}
```

#### GET /api/cron

Endpoint for Vercel Cron to trigger scheduled crawls.

**Request Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

**Query Parameters:**
- `step` - Optional, specifies a specific step to run: "sitemaps", "content", or "embeddings"

### Vercel Cron Configuration

To set up scheduled crawls in Vercel, add the following configuration to your `vercel.json` file:

```json
{
  "crons": [
    {
      "path": "/api/cron?step=sitemaps",
      "schedule": "0 0 * * 0"  // Run every Sunday at midnight
    },
    {
      "path": "/api/cron?step=content",
      "schedule": "0 2 * * 0"  // Run every Sunday at 2:00 AM
    },
    {
      "path": "/api/cron?step=embeddings",
      "schedule": "0 4 * * 0"  // Run every Sunday at 4:00 AM
    }
  ]
}
```

## Crawler Behavior

### Rate Limiting

- The crawler respects websites by implementing rate limits:
  - 3-second delay between page requests in content extraction
  - 1-second delay between embedding API calls

### Change Detection

- Content hashing is used to detect actual changes in page content
- Embeddings are only regenerated when content changes

### Error Handling

- Robust error handling throughout the process
- Detailed logging to the `crawler_logs` table

## Development

To extend or modify the crawler:

1. Add new functionality to the appropriate module
2. Update the database schema if necessary
3. Update the main crawler and API routes as needed 