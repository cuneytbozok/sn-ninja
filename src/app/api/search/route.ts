import { NextRequest, NextResponse } from 'next/server';
import { pinecone, index } from '../../../lib/pinecone';
import { supabase } from '../../../lib/supabase';

// Default number of results to return
const DEFAULT_TOP_K = 5;
// Use the same model as configured in Pinecone
const EMBEDDING_MODEL = "llama-text-embed-v2";

// Define types for Pinecone results
interface SearchRecordHit {
  _id: string;
  _score: number;
  fields?: {
    title?: string;
    url?: string;
    text?: string;
    [key: string]: any;
  };
}

interface SearchRecordResponse {
  result?: {
    hits?: SearchRecordHit[];
  };
  usage?: {
    readUnits: number;
    embedTotalTokens: number;
  };
}

/**
 * Performs a semantic search using Pinecone's integrated embedding
 * @param query The search query
 * @param topK Number of results to return
 * @returns Search results with metadata
 */
async function semanticSearch(query: string, topK: number = DEFAULT_TOP_K) {
  try {
    console.log(`Searching with query: "${query}" (topK: ${topK})`);
    
    // Method 1: Using index-level searchRecords API (latest Pinecone SDK)
    try {
      // @ts-ignore - Some TypeScript definitions might be missing for searchRecords
      const response = await index.searchRecords({
        query: {
          topK,
          inputs: { text: query }
        }
      }) as SearchRecordResponse;
      
      console.log(`Search successful with ${response.result?.hits?.length || 0} results`);
      
      // Format the results
      const matches = (response.result?.hits || []).map(hit => ({
        id: hit._id,
        score: hit._score,
        title: hit.fields?.title || 'Untitled',
        url: hit.fields?.url || '#',
        snippet: createSnippet(hit.fields?.text || ''),
      }));
      
      return matches;
    } catch (searchError) {
      console.warn('searchRecords API failed, trying alternative approach:', searchError);
      
      // Method 2: Using traditional vector search with filter fallback
      // Use text matching as a fallback since we can't use proper vector search
      const filter = {
        $or: [
          { title: { $containsAny: query.toLowerCase().split(/\s+/) } },
          { text: { $containsAny: query.toLowerCase().split(/\s+/) } }
        ]
      };
      
      // We'll use a dummy vector but rely primarily on the filter
      // This isn't semantically meaningful but can work as a fallback
      const dummyVector = Array(1024).fill(0);
      
      const queryResponse = await index.query({
        topK,
        includeMetadata: true,
        filter: filter,
        vector: dummyVector
      });
      
      console.log(`Fallback search found ${queryResponse.matches.length} results`);
      
      // Extract and format the results
      const matches = queryResponse.matches.map(match => ({
        id: match.id,
        score: match.score,
        title: match.metadata?.title || 'Untitled',
        url: match.metadata?.url || '#',
        snippet: createSnippet(match.metadata?.text as string || ''),
      }));
      
      return matches;
    }
  } catch (error) {
    console.error('Semantic search error:', error);
    throw new Error('Failed to perform semantic search');
  }
}

/**
 * Creates a snippet from the text content
 * @param text The full text content
 * @returns A snippet of text (first 200 chars)
 */
function createSnippet(text: string): string {
  if (!text) return '';
  
  // Remove markdown formatting
  const cleanText = text.replace(/#{1,6}\s+/g, '').replace(/\*\*/g, '');
  
  // Get the first 200 characters, trim to the last complete word
  const snippet = cleanText.substring(0, 200).trim();
  return snippet.length < cleanText.length ? `${snippet}...` : snippet;
}

/**
 * Generates an answer based on the search results
 * @param query The user's query
 * @param results The search results
 * @returns An AI-generated answer based on the results
 */
async function generateAnswer(query: string, results: any[]): Promise<string> {
  if (!results.length) {
    return "I couldn't find any relevant information for your query. Please try rephrasing or ask a different question.";
  }

  try {
    // In a real implementation, this would call an OpenAI or other LLM API
    // Format the context from search results
    const context = results
      .map(result => `Title: ${result.title}\nURL: ${result.url}\nContent: ${result.snippet}`)
      .join('\n\n')
      .substring(0, 4000); // Limit context size
    
    console.log("Search context generated from results:", context.substring(0, 200) + "...");
    
    // For now, return a mock response
    return "ServiceNow is a cloud computing platform that automates IT business management workflows. It includes products for IT service, operations, and business management. The core of ServiceNow's platform is IT service management (ITSM), which helps organizations to consolidate and automate service relationships across the enterprise.\n\nServiceNow was founded in 2004 by Fred Luddy, who previously served as CTO at Peregrine Systems and Remedy Corporation. The company initially focused on IT service management but has since expanded into other areas like IT operations management, IT business management, customer service management, HR service delivery, and security operations.\n\nServiceNow's platform is built on a single data model and uses a common service data platform. This allows for seamless integration between different modules and applications. The platform includes features such as workflow automation, AI and machine learning capabilities, virtual agents, performance analytics, and a mobile experience.\n\nMany large enterprises use ServiceNow to manage their IT services and business workflows. The platform is highly customizable and can be tailored to meet specific organizational needs. ServiceNow also offers a developer program that allows developers to build custom applications on the Now Platform.";
  } catch (error) {
    console.error('Answer generation error:', error);
    throw new Error('Failed to generate answer');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, isLucky = false, topK = DEFAULT_TOP_K } = await request.json();
    
    // Log the query (optional - for debugging)
    console.log(`Search query received: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
    console.log(`Is Lucky mode: ${isLucky}`);
    
    // Perform semantic search
    const results = await semanticSearch(query, topK);
    
    // Generate answer for all queries
    const answer = await generateAnswer(query, results);
    
    return NextResponse.json({ 
      answer, 
      results: isLucky ? [] : results,
      // Include a shortened version of the query for reference
      queryPreview: query.length > 50 ? `${query.substring(0, 50)}...` : query 
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to process search query' },
      { status: 500 }
    );
  }
} 