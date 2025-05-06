import { Client } from '@elastic/elasticsearch';
import dotenv from "dotenv";
dotenv.config();
//const client = new Client({ node: 'http://localhost:9200' });
const client = new Client({
    node: process.env.ELASTICSEARCH_CLOUD_ID,  // Your cluster URL
    auth: {
      apiKey: process.env.ELASTICSEARCH_API_KEY,  // The API key generated from the Elastic UI
    },
    ssl: {
      rejectUnauthorized: false,  // Allow self-signed certificates if applicable
    },
});

export default client;