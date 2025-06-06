import helper from '../helpers/errors.mjs';
import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

const sheets = google.sheets('v4');

const updateOrAppendSheetGoogleAPI = async (
  tabName,
  sheetID,
  csvData,
  prepend = false
) => {
  const funcName = 'updateOrAppendSheetGoogleAPI';

  console.log(`Starting Function ${funcName}... `);

  try {
    const auth = new google.auth.JWT({
      email: process.env.GS_EMAIL,
      key: process.env.GS_KEY.replace(/\\n/g, '\n'), // Handle newlines in keys
      scopes: [`${process.env.G_SCOPES}`],
    });

    const range = `${tabName}`;

    // If prepend is false, clear existing data
    if (!prepend) {
      console.log(`${tabName}: Clearing existing data...`);
      await sheets.spreadsheets.values.clear({
        auth,
        spreadsheetId: sheetID,
        range,
      });
      console.log(`${tabName}: Sheet cleared.`);
    }

    // Step 2: **Generate Headers and Data**
    console.log(`${tabName}: Writing new data...`);

    // Automatically derive headers from the first JSON object
    const headers = Object.keys(csvData[0]);

    // Convert JSON objects to a 2D array
    const values = [
      headers, // First row: Headers
      ...csvData.map(
        (row) => headers.map((header) => row[header] || '') // Fill in values based on the headers
      ), // Convert objects to arrays based on headers
    ];

    if (prepend) {
      // If prepend is true, insert the data at the top of the sheet
      console.log(`${tabName}: Prepending data to the top of the sheet...`);
      await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId: sheetID,
        range: `${tabName}!A1`, //  Starts inserting from A1
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
    } else {
      // If prepend is false, replace the existing data starting at A1
      await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId: sheetID,
        range: `${tabName}!A1`, //  Starts inserting from A1
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });
    }

    console.log(`${tabName}: Sheet updated successfully.`);
  } catch (error) {
    helper.handleError(funcName, error);
  }
};

export default { updateOrAppendSheetGoogleAPI };
