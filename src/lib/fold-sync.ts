import { fetchTransactions, FoldTransaction } from './fold-client';
import { getValidToken } from './fold-token-store';
import { getSheets, SPREADSHEET_ID, SHEET_NAME, Transaction } from './google-sheets';

function mapFoldTransaction(ft: FoldTransaction): string[] {
  // txn_date can be ISO string or YYYY-MM-DD; normalize to YYYY-MM-DD
  const date = ft.txn_date ? ft.txn_date.slice(0, 10) : (ft.txn_timestamp ?? '').slice(0, 10);
  const isIncoming = ft.type === 'INCOMING';
  const amount = isIncoming ? Math.abs(ft.amount) : -Math.abs(ft.amount);
  const category = (typeof ft.category === 'string' ? ft.category : null) || 'Uncategorized';
  const description = ft.narration || (typeof ft.merchant === 'string' ? ft.merchant : '') || '';
  const bankName = ft.financial_information_provider?.name ?? ft.account_id;
  const source = `Fold:${bankName}`;
  const type = isIncoming ? 'Income' : 'Expense';
  return [date, String(amount), category, description, source, type];
}

async function getExistingTransactionKeys(): Promise<Set<string>> {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:F1000`,
  });
  const rows = res.data.values ?? [];
  const keys = new Set<string>();
  for (const row of rows) {
    if (!row[0] || !row[1]) continue;
    // Key: date|amount|description
    keys.add(`${row[0]}|${row[1]}|${row[3] ?? ''}`);
  }
  return keys;
}

export async function syncFoldTransactions(): Promise<{ added: number; total: number }> {
  const { token, uuid } = await getValidToken();

  // Fetch all Fold transactions with pagination
  const allFoldTxns: FoldTransaction[] = [];
  let cursor: string | undefined;
  let pages = 0;
  const MAX_PAGES = 20; // Safety limit

  do {
    const page = await fetchTransactions(uuid, token, cursor);
    allFoldTxns.push(...page.transactions);
    cursor = page.after ?? undefined;
    pages++;
  } while (cursor && pages < MAX_PAGES);

  if (allFoldTxns.length === 0) {
    return { added: 0, total: 0 };
  }

  // Get existing transaction keys for dedup
  const existingKeys = await getExistingTransactionKeys();

  // Map and filter out duplicates
  const newRows: string[][] = [];
  for (const ft of allFoldTxns) {
    const row = mapFoldTransaction(ft);
    const key = `${row[0]}|${row[1]}|${row[3]}`;
    if (!existingKeys.has(key)) {
      newRows.push(row);
      existingKeys.add(key); // Prevent dupes within the same batch
    }
  }

  if (newRows.length > 0) {
    const sheets = await getSheets();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: newRows },
    });
  }

  return { added: newRows.length, total: allFoldTxns.length };
}
