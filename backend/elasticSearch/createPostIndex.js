// createPostIndex.js
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
              edge_ngram_analyzer: {
                type: "custom",
                tokenizer: "edge_ngram_tokenizer",
                filter: ["lowercase"]
              }
            },
            tokenizer: {
              edge_ngram_tokenizer: {
                type: "edge_ngram",
                min_gram: 1,
                max_gram: 20,
                token_chars: ["letter", "digit"]
              }
            }
          }
        },
        mappings: {
          properties: {
            uid: { type: 'keyword' },
            text: { type: 'text', analyzer: 'edge_ngram_analyzer' },
            isPrivate: { type: 'boolean' },
            createdAt: { type: 'date' },
            senderUsername: { type: 'text' },
            senderName: { type: 'text' }
          }
        }
      }
    });
    console.log('✅ Created "posts" index with edge_ngram analyzer');
  } else {
    console.log('ℹ️ Index already exists');
  }
}


export default createIndex;