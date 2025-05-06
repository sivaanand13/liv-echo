import client from './elasticsearchClient.js';

async function createIndex() {
  const index = 'posts';
  const exists = await client.indices.exists({ index });

  if (!exists) {
    await client.indices.create({
      index,
      body: {
        mappings: {
          properties: {
            uid: { type: 'keyword' },
            text: { type: 'text' },
            isPrivate: { type: 'boolean' },
            createdAt: { type: 'date' }
          }
        }
      }
    });
    console.log('Index created.');
  } else {
    console.log('Index already exists.');
  }
}

createIndex().catch(console.error);