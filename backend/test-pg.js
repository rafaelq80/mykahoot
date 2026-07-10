// test-pg.js
import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_cjSa3ouPkF4Z@ep-young-fire-atwxfasw-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
});

client.connect()
  .then(() => {
    console.log('Conectou!');
    return client.end();
  })
  .catch((err) => {
    console.error('Erro:', err);
  });