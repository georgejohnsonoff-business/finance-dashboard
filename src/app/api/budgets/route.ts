import { NextResponse } from 'next/server';
import { getSheets, SPREADSHEET_ID } from '@/lib/google-sheets';

const BUDGET_SHEET = 'Budgets';

interface Budget {
  category: string;
  monthlyBudget: number;
}

export async function GET() {
  try {
    const sheets = await getSheets();
    let rows: string[][] = [];
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${BUDGET_SHEET}!A2:B20`,
      });
      rows = (res.data.values ?? []) as string[][];
    } catch {
      return NextResponse.json({ budgets: [] });
    }

    const budgets: Budget[] = rows
      .filter((r) => r[0] && r[1])
      .map((r) => ({ category: r[0], monthlyBudget: parseFloat(r[1]) || 0 }));

    return NextResponse.json({ budgets });
  } catch (err: any) {
    console.error('[GET /api/budgets]', err);
    return NextResponse.json({ error: 'Failed to load budgets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { budgets } = (await req.json()) as { budgets: Budget[] };
    if (!Array.isArray(budgets)) {
      return NextResponse.json({ error: 'budgets array required' }, { status: 400 });
    }

    const sheets = await getSheets();

    // Ensure sheet exists
    try {
      await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${BUDGET_SHEET}!A1`,
      });
    } catch {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: BUDGET_SHEET } } }],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${BUDGET_SHEET}!A1:B1`,
        valueInputOption: 'RAW',
        requestBody: { values: [['Category', 'MonthlyBudget']] },
      });
    }

    // Clear existing data and write new
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${BUDGET_SHEET}!A2:B20`,
    });

    if (budgets.length > 0) {
      const rows = budgets.map((b) => [b.category, String(b.monthlyBudget)]);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${BUDGET_SHEET}!A2:B${rows.length + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: rows },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[POST /api/budgets]', err);
    return NextResponse.json({ error: 'Failed to save budgets' }, { status: 500 });
  }
}
