import { supabase } from "../../../lib/supabase";
import { index } from "../../../lib/pinecone";
import { Logger } from "./utils/logger";

interface DocumentationPage {
  id: string;
  url: string;
  title: string;
  content: string;
  content_hash: string;
}

// Use llama-text-embed-v2 model as configured in Pinecone
const EMBEDDING_MODEL = "llama-text-embed-v2";
// Maximum characters per chunk based on model limits
const CHUNK_SIZE = 1500; // Adjusted based on llama model token limit
const CHUNK_OVERLAP = 200; // Overlap between chunks

/**
 * Splits a document into chunks for embedding
 * @param page The documentation page to split
 * @returns Array of chunks with text and metadata
 */
function splitDocumentIntoChunks(page: DocumentationPage): { text: string; metadata: any }[] {
  const fullText = `# ${page.title}\n\n${page.content}`;
  const chunks: { text: string; metadata: any }[] = [];

  if (fullText.length <= CHUNK_SIZE) {
    // Document is small enough to fit in a single chunk
    chunks.push({
      text: fullText,
      metadata: {
        pageId: page.id,
        url: page.url,
        title: page.title,
        chunk: 1,
        totalChunks: 1,
      },
    });
  } else {
    // Split the document into overlapping chunks
    let position = 0;
    let chunkCount = 0;

    while (position < fullText.length) {
      const end = Math.min(position + CHUNK_SIZE, fullText.length);
      chunkCount++;

      chunks.push({
        text: fullText.substring(position, end),
        metadata: {
          pageId: page.id,
          url: page.url,
          title: page.title,
          chunk: chunkCount,
          totalChunks: Math.ceil(fullText.length / (CHUNK_SIZE - CHUNK_OVERLAP)),
        },
      });

      // Move position forward, accounting for overlap
      position += CHUNK_SIZE - CHUNK_OVERLAP;

      // Ensure we don't get stuck in a loop for very small chunks
      if (position >= fullText.length) break;
    }

    // Update totalChunks in metadata now that we know the final count
    chunks.forEach(chunk => {
      chunk.metadata.totalChunks = chunkCount;
    });
  }

  return chunks;
}

/**
 * Stores text content directly in Pinecone index
 * @param pageId The ID of the documentation page
 * @param vectorId The ID of the vector
 * @param text The text to embed
 * @param metadata The metadata for the vector
 */
async function storeContentInPinecone(
  pageId: string,
  vectorId: string,
  text: string,
  metadata: any
): Promise<void> {
  try {
    // Using the modern Records API approach for integrated embeddings
    const namespace = "servicenow-docs";
    
    // Use the namespace API to access the upsertRecords method
    await index.namespace(namespace).upsertRecords([
      {
        _id: vectorId,
        text: text,              // Field that will be embedded based on index configuration
        pageId: metadata.pageId,
        title: metadata.title,
        url: metadata.url,
        input_type: "passage"    // Indicates this is a passage for embedding models
      }
    ]);

    // Record the reference in our database
    const { error } = await supabase.from("page_embeddings").upsert(
      {
        page_id: pageId,
        vector_id: vectorId,
        embedding_model: EMBEDDING_MODEL,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "vector_id" }
    );

    if (error) {
      throw new Error(`Failed to record embedding reference in database: ${error.message}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error storing content in Pinecone: ${errorMessage}`);
  }
}

/**
 * Deletes existing embeddings for a page from Pinecone
 * @param pageId The ID of the documentation page
 */
async function deleteExistingEmbeddings(pageId: string): Promise<void> {
  try {
    // Get existing embedding records from the database
    const { data: existingEmbeddings, error } = await supabase
      .from("page_embeddings")
      .select("vector_id")
      .eq("page_id", pageId);

    if (error) {
      throw new Error(`Failed to fetch existing embeddings: ${error.message}`);
    }

    if (existingEmbeddings && existingEmbeddings.length > 0) {
      // Delete from Pinecone
      const vectorIds = existingEmbeddings.map(e => e.vector_id);
      const namespace = "documentation";
      
      // Delete vectors one by one
      for (const vectorId of vectorIds) {
        await index.namespace(namespace).deleteOne(vectorId);
      }

      // Delete from our database
      const { error: deleteError } = await supabase
        .from("page_embeddings")
        .delete()
        .eq("page_id", pageId);

      if (deleteError) {
        throw new Error(`Failed to delete embedding records: ${deleteError.message}`);
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error deleting existing embeddings: ${errorMessage}`);
  }
}

/**
 * Checks if embeddings exist and are up to date for a page
 * @param pageId The ID of the documentation page
 * @param contentHash The hash of the page's content
 * @returns Boolean indicating if embeddings are up to date
 */
async function areEmbeddingsUpToDate(pageId: string, contentHash: string): Promise<boolean> {
  try {
    // Get the page from database to check the content hash
    const { data: page, error } = await supabase
      .from("documentation_pages")
      .select("content_hash")
      .eq("id", pageId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch page: ${error.message}`);
    }

    if (!page) {
      return false;
    }

    // Check if the page's content has changed
    if (page.content_hash !== contentHash) {
      return false;
    }

    // Check if embeddings exist for this page
    const { data: embeddings, error: embedError } = await supabase
      .from("page_embeddings")
      .select("id")
      .eq("page_id", pageId);

    if (embedError) {
      throw new Error(`Failed to fetch embeddings: ${embedError.message}`);
    }

    // If we have at least one embedding, they're up to date
    return embeddings && embeddings.length > 0;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Error checking embeddings: ${errorMessage}`);
  }
}

/**
 * Generates embeddings for all pages and stores them in Pinecone
 */
export async function generateEmbeddings(): Promise<void> {
  const logger = new Logger("embedding-generator");
  const processingDelay = 500; // 500ms delay between requests to avoid overwhelming Pinecone

  try {
    // Get all pages that need embeddings
    const { data: pages, error } = await supabase
      .from("documentation_pages")
      .select("id, url, title, content, content_hash")
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch pages: ${error.message}`);
    }

    if (!pages || pages.length === 0) {
      logger.info("No pages found for embedding generation");
      return;
    }

    // Apply limit if MAX_PAGES_FOR_EMBEDDINGS is set
    const maxPages = process.env.MAX_PAGES_FOR_EMBEDDINGS ? 
      parseInt(process.env.MAX_PAGES_FOR_EMBEDDINGS, 10) : 
      pages.length;
      
    const pagesToProcess = pages.slice(0, maxPages);
    
    logger.info(`Found ${pages.length} pages to check for embedding generation, processing up to ${pagesToProcess.length}`);

    let processedCount = 0;
    let updatedCount = 0;

    // Process each page
    for (const page of pagesToProcess) {
      try {
        // Check if embeddings are already up to date
        const upToDate = await areEmbeddingsUpToDate(page.id, page.content_hash);

        if (upToDate) {
          logger.info(`Embeddings already up to date for page ${page.url}`, page.id);
          processedCount++;
          continue;
        }

        // Delete existing embeddings - crucial for preventing duplicates when content is updated
        await deleteExistingEmbeddings(page.id);

        // Split document into chunks
        const chunks = splitDocumentIntoChunks(page);
        logger.info(`Processing page ${page.url} with ${chunks.length} chunks`, page.id);

        // Process each chunk and store in Pinecone
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];

          // Add delay to respect rate limits (except for first request)
          if (i > 0 || processedCount > 0) {
            await new Promise(resolve => setTimeout(resolve, processingDelay));
          }

          // Create a unique vector ID
          const vectorId = `${page.id}_chunk${i + 1}`;

          // Store content in Pinecone (will handle embedding generation)
          await storeContentInPinecone(page.id, vectorId, chunk.text, chunk.metadata);

          logger.info(`Processed chunk ${i + 1}/${chunks.length} of ${page.url}`, page.id);
        }

        updatedCount++;
        processedCount++;
        logger.info(`Successfully processed content for page ${page.url}`, page.id);
      } catch (error: unknown) {
        logger.error(`Error processing content for page ${page.url}`, page.id, error);
      }
    }

    logger.info(`Embedding generation completed. Processed ${processedCount} pages, updated ${updatedCount} pages.`);
  } catch (error: unknown) {
    logger.error("Error in embedding generation process", null, error);
    throw error;
  }
} 