import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      investmentAmountMXN,
      investmentAmountETH,
      investmentInfo,
      transactionHash,
      walletAddress
    } = body;

    if (!investmentAmountMXN || !investmentAmountETH || !investmentInfo || !transactionHash || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transactionId = uuidv4();

    await sql`
      INSERT INTO investment_tickets (
        transaction_id,
        investment_amount_mxn,
        investment_amount_eth,
        investment_info,
        transaction_hash,
        wallet_address
      ) VALUES (
        ${transactionId},
        ${investmentAmountMXN},
        ${investmentAmountETH},
        ${investmentInfo},
        ${transactionHash},
        ${walletAddress}
      );
    `;

    const newTicket = {
      transactionId,
      investmentAmountMXN,
      investmentAmountETH,
      investmentInfo,
      transactionHash,
      walletAddress,
    };

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Error creating investment ticket:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}