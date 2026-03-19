import { NextResponse } from 'next/server';
import { getSheets, SPREADSHEET_ID } from '@/lib/google-sheets';
import { fetchMFNav, fetchStockPrice, InvestmentHolding } from '@/lib/investments';

const INVESTMENTS_SHEET = 'Investments';

export async function GET() {
  try {
    const sheets = await getSheets();

    let rows: string[][] = [];
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${INVESTMENTS_SHEET}!A2:E500`,
      });
      rows = (res.data.values ?? []) as string[][];
    } catch (err: any) {
      // Sheet tab might not exist yet
      if (err.message?.includes('Unable to parse range')) {
        return NextResponse.json({ holdings: [], totalInvested: 0, totalCurrentValue: 0, totalGainLoss: 0 });
      }
      throw err;
    }

    const holdings: InvestmentHolding[] = [];

    const promises = rows
      .filter((row) => row[0] && row[2] && row[3])
      .map(async (row, i) => {
        const type = row[0] as 'MF' | 'Stock';
        const name = row[1] ?? '';
        const code = row[2];
        const units = parseFloat(row[3]) || 0;
        const avgBuyPrice = parseFloat(row[4]) || 0;

        let livePrice = avgBuyPrice;
        try {
          if (type === 'MF') {
            const nav = await fetchMFNav(code);
            livePrice = nav.nav;
          } else {
            const stock = await fetchStockPrice(code);
            livePrice = stock.price;
          }
        } catch {
          // Fall back to avg buy price if API fails
        }

        const currentValue = units * livePrice;
        const invested = units * avgBuyPrice;
        const gainLoss = currentValue - invested;
        const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

        return {
          id: String(i + 2),
          type,
          name,
          schemeCodeOrTicker: code,
          units,
          avgBuyPrice,
          livePrice,
          currentValue,
          invested,
          gainLoss,
          gainLossPercent,
        } satisfies InvestmentHolding;
      });

    const results = await Promise.all(promises);
    holdings.push(...results);

    const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
    const totalCurrentValue = holdings.reduce((s, h) => s + h.currentValue, 0);
    const totalGainLoss = totalCurrentValue - totalInvested;

    return NextResponse.json({ holdings, totalInvested, totalCurrentValue, totalGainLoss });
  } catch (err: any) {
    console.error('[GET /api/investments]', err);
    return NextResponse.json({ error: 'Failed to load investments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, name, schemeCodeOrTicker, units, avgBuyPrice } = body;

    if (!type || !schemeCodeOrTicker || !units) {
      return NextResponse.json({ error: 'type, schemeCodeOrTicker, and units are required' }, { status: 400 });
    }

    const sheets = await getSheets();

    // Ensure the Investments sheet tab exists
    try {
      await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${INVESTMENTS_SHEET}!A1`,
      });
    } catch {
      // Create the sheet tab and add headers
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{ addSheet: { properties: { title: INVESTMENTS_SHEET } } }],
        },
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${INVESTMENTS_SHEET}!A1:E1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Type', 'Name', 'SchemeCode/Ticker', 'Units', 'AvgBuyPrice']],
        },
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${INVESTMENTS_SHEET}!A:E`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[type, name ?? '', schemeCodeOrTicker, String(units), String(avgBuyPrice ?? 0)]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[POST /api/investments]', err);
    return NextResponse.json({ error: 'Failed to save investment' }, { status: 500 });
  }
}
