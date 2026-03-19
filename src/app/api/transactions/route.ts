import { NextResponse } from 'next/server';
import { getSheets, SPREADSHEET_ID, SHEET_NAME, Transaction } from '@/lib/google-sheets';

// GET /api/transactions — read all rows from Google Sheet
export async function GET() {
  try {
    const sheets = await getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A2:F1000`,
    });

    const rows = res.data.values ?? [];
    const transactions: Transaction[] = rows
      .filter((row) => row[0] && row[1]) // skip empty rows
      .map((row, i) => ({
        id: String(i + 2),
        date: row[0] ?? '',
        amount: parseFloat(row[1]) || 0,
        category: row[2] ?? 'Uncategorized',
        description: row[3] ?? '',
        source: row[4] ?? '',
        type: (row[5] as Transaction['type']) ?? 'Expense',
      }));

    return NextResponse.json({ transactions });
  } catch (err) {
    console.error('[GET /api/transactions]', err);
    return NextResponse.json({ error: 'Failed to load transactions' }, { status: 500 });
  }
}

// POST /api/transactions — append a new row to the sheet
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, amount, category, description, source, type } = body;

    if (!date || amount === undefined || !category) {
      return NextResponse.json({ error: 'Missing required fields: date, amount, category' }, { status: 400 });
    }

    const sheets = await getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[date, amount, category, description ?? '', source ?? '', type ?? 'Expense']],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/transactions]', err);
    return NextResponse.json({ error: 'Failed to save transaction' }, { status: 500 });
  }
}
