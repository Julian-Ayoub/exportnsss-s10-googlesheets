import app from './controllers/app.mjs';
import aws from './controllers/aws.mjs';
import helper from './helpers/errors.mjs';

// async function main(event) {
export const handler = async (event, context) => {
  const funcName = 'handler';
  global.errors = [];
  global.nsss = 'n/a';
  global.sheet = 'n/a';
  global.sheetTab = 'n/a';
  global.sheetID = 'n/a';
  global.logStreamLink = 'n/a'; // Remove for local testing

  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    global.logStreamLink = helper.generateCloudWatchLink(context);
    global.nsss = event.nsss;
    global.sheet = event.sheet;
    global.sheetTab = event.sheetTab;
    global.sheetID = event.sheetID;

    await app.doWork(event);
  } catch (error) {
    helper.handleError(funcName, error);
  } finally {
    console.log('Finally, checking for errors...');

    if (global.errors.length) {
      console.log('Errors detected...');
      await aws.reportErrors();
    } else {
      console.log('No errors detected...');
    }

    console.log('Process finalised...');
  }
};
