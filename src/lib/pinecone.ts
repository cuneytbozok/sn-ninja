import { Pinecone } from '@pinecone-database/pinecone';

const pineconeApiKey = process.env.PINECONE_API_KEY || '';
const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT || '';
const pineconeIndex = process.env.PINECONE_INDEX || '';

// Initialize the Pinecone client
const pinecone = new Pinecone({
  apiKey: pineconeApiKey,
  environment: pineconeEnvironment,
});

// Get the Pinecone index
export const index = pinecone.index(pineconeIndex);

export { pinecone }; 