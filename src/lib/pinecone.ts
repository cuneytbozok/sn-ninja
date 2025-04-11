import { Pinecone } from '@pinecone-database/pinecone';

const pineconeApiKey = process.env.PINECONE_API_KEY || '';
// The environment is now managed through the Pinecone serverless architecture
// const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT || '';
const pineconeIndex = process.env.PINECONE_INDEX || '';

// Initialize the Pinecone client - newer SDK doesn't use environment
const pinecone = new Pinecone({
  apiKey: pineconeApiKey,
});

// Get the Pinecone index
export const index = pinecone.index(pineconeIndex);

export { pinecone }; 