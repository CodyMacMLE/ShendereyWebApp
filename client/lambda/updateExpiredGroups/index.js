import { Client } from 'pg';

export const handler = async () => {
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 5432,
  });

  try {
    await client.connect();
    const result = await client.query(`
      UPDATE groups
      SET active = false
      WHERE endDate < NOW() AND active = true;
    `);
    console.log(`Updated ${result.rowCount} expired groups.`);
  } catch (error) {
    console.error('Error updating expired groups:', error);
    throw error;
  } finally {
    await client.end();
  }
};