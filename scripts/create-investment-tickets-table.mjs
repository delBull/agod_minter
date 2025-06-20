import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS investment_tickets (
        id SERIAL PRIMARY KEY,
        transaction_id VARCHAR(255) UNIQUE NOT NULL,
        investment_amount_mxn NUMERIC(15, 2) NOT NULL,
        investment_amount_eth NUMERIC(25, 18) NOT NULL,
        investment_info TEXT,
        transaction_hash VARCHAR(255) UNIQUE NOT NULL,
        wallet_address VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table "investment_tickets" created successfully or already exists.');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

createTable();