import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client as any });
}

export const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

// Change this if you rename your Sheet tab
export const SHEET_NAME = 'Sheet1';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  source: string;
  type: 'Income' | 'Expense' | 'Investment';
}
