import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });
import helper from '../helpers/errors.mjs';
import ns from './netsuite.mjs';
import gs from './gs.mjs';
import format from './format.mjs';
import moment from 'moment-timezone'; // Import moment-timezone

const doWork = async (event) => {
  const funcName = 'doWork';
  console.log(`Kicking off ${funcName}`);
  try {
    let rawNSSS = await ns.getSavedSearch(event.nsssID);
    let formattedNSSS = format.dereference(rawNSSS);

    // Get current date in Sydney timezone (Australia/Sydney)
    const currentDateInSydney = moment
      .tz('Australia/Sydney')
      .format('D/M/YYYY');

    // Add date_exported key to each object
    formattedNSSS = formattedNSSS.map((item) => {
      item.date_exported = currentDateInSydney;
      return item;
    });

    console.log(formattedNSSS);

    await gs.updateOrAppendSheetGoogleAPI(
      event.sheetTab,
      event.sheetID,
      formattedNSSS,
      event.prepend
    );
  } catch (error) {
    helper.handleError(funcName, error);
  }
};

export default { doWork };
