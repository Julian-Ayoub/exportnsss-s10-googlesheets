import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });
import helper from '../helpers/errors.mjs';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from '../libs/sesClient.mjs';

/**
 * Emails subscribed users which PO records failed processing, and why
 * @param {*} entity
 */
const reportErrors = async (entity) => {
  const funcName = 'reportErrors';

  try {
    let errorString = ``;
    for (let i = 0; i < global.errors.length; i++) {
      const error = global.errors[i];
      errorString += `\Sheet: ${error.sheet}
NSSS: ${error.nsss}
Error: ${error.message}
Sheet Tab: ${error.sheetTab}
Sheet ID: ${error.sheetID}
LogStream Link: \'${error.logStreamLink}\'
\n`;
    }
      global.errors.push({
        nsss: global.nsss,
        sheet: global.sheet,
        sheetTab: global.sheetTab,
        sheetID: global.sheetID,
        logStreamLink: global.logStreamLink,
        message: errMsg,
      });

    let body = `Hello,

There was an error whilst trying to run ${process.env.LAMBDA}:

${errorString.trim()}

Thank you,
Devs@Life`;

    const sendEmailCommand = createSendEmailCommand(entity, body);

    try {
      return await sesClient.send(sendEmailCommand);
    } catch (error) {
      helper.handleError(funcName, error, true);
    }
  } catch (error) {
    helper.handleError(funcName, error, true);
  }
};

const createSendEmailCommand = (entity, body) => {
  const funcName = 'createSendEmailCommand';

  try {
    return new SendEmailCommand({
      Destination: {
        /* required */
        CcAddresses: process.env.AWS_EMAIL_CC?.split(','),
        ToAddresses: process.env.AWS_EMAIL_TO.split(','),
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Text: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: `Errors - Odin - ${entity} - View Loader`,
        },
      },
      Source: process.env.AWS_EMAIL_FROM,
    });
  } catch (error) {
    helper.handleError(funcName, error, true);
  }
};

export default { reportErrors };
