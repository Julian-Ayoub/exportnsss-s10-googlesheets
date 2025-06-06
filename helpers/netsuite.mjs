import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

// CODE / DISCUSSION FOUND HERE : https://www.reddit.com/r/Netsuite/comments/kurnyp/how_to_generate_netsuite_rest_api_signature/

// All sensitive data is stored in a related .env file.
// The use of oauth, crypto and axios is to deal with all request validation.
// Helper must be included in working file.

const instance = axios.create({
  baseURL: `https://${process.env.N_ACCOUNT_URL}.suitetalk.api.netsuite.com/services/rest/`,
  headers: { 'Content-Type': 'application/json', Prefer: 'transient' },
});

instance.interceptors.request.use((config) => {
  const auth = OAuth({
    consumer: {
      key: process.env.N_CONSUMER_KEY,
      secret: process.env.N_CONSUMER_SECRET,
    },
    realm: process.env.N_ACCOUNT_ID,
    signature_method: 'HMAC-SHA256',
    hash_function(baseString, key) {
      return crypto
        .createHmac('sha256', key)
        .update(baseString)
        .digest('base64');
    },
  });

  const { Authorization } = auth.toHeader(
    auth.authorize(
      {
        url: config.baseURL + config.url,
        method: config.method,
      },
      {
        key: process.env.N_TOKEN_ID,
        secret: process.env.N_TOKEN_SECRET,
      }
    )
  );

  config.headers.Authorization = Authorization;

  return config;
});

export default instance;
