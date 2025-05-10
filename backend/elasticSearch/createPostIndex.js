import client from '../elasticSearch/elasticsearchClient.js';

async function createIndex() {
  const index = 'posts';
  const exists = await client.indices.exists({ index });

  if (!exists) {
    await client.indices.create({
      index,
      body: {
        settings: {
          analysis: {
            analyzer: {
              standard_analyzer: {
                type: "standard", // Using standard analyzer
                filter: ["lowercase"]  // Apply lowercase filter
              }
            }
          }
        },
        mappings: {
          properties: {
            uid: { type: 'keyword' },
            text: { type: 'text', analyzer: 'standard_analyzer' }, // Use standard analyzer here
            isPrivate: { type: 'boolean' },
            createdAt: { type: 'date' },
            senderUsername: { type: 'text', analyzer: 'standard' },  // Apply standard analyzer here as well
            senderName: { type: 'text', analyzer: 'standard' }
          }
        }
      }
    });
    console.log('✅ Created "posts" index with standard analyzer');
  } else {
    console.log('ℹ️ Index already exists');
  }
}

export default createIndex;
