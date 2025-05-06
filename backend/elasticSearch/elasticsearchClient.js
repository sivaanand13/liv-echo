import { Client } from '@opensearch-project/opensearch';
import dotenv from "dotenv";
dotenv.config();
//const client = new Client({ node: 'http://localhost:9200' });
const client = new Client({
    node: process.env.ELASTICSEARCH_CLOUD_ID,  // Your cluster URL
    auth: {
      username: process.env.ELASTIC_USERNAME,
      password: process.env.ELASTIC_PASSWORD
    }
});

export default client;