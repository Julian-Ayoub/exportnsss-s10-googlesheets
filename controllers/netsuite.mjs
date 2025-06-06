import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });
import helper from '../helpers/errors.mjs';
import ns from '../helpers/netsuite.mjs';

const getSavedSearch = async (searchID) => {
  const funcName = 'getSavedSearch';
  console.log('Kicking off getSavedSearch...');
  let nsData = []; // initialise empty array to return this if GET fails
  try {
    const config = {
      baseURL: `https://${process.env.N_ACCOUNT_URL}.restlets.api.netsuite.com`,
    };

    nsData = await ns.get(
      `/app/site/hosting/restlet.nl?script=${process.env.N_SEARCHEXTRACTOR}&deploy=1&searchId=${searchID}`, // substring removes leading '+' from phone number
      config // as netsuite throws error if included
    );
    nsData = nsData.data;
    // console.dir(nsData, {depth: null})
    return nsData;
  } catch (error) {
    helper.handleError(funcName, error);
    nsData = []; // reinitialise to empty array incase data was corrupted
  }
  return nsData; // return either empty array or data
};

export default { getSavedSearch };
