const extractErrMsg = (error) => {
  let errMsg = '';
  if (error.response && error.response.data) {
    if (
      error.response.data['o:errorDetails'] &&
      error.response.data['o:errorDetails'][0]
    ) {
      errMsg = error.response.data['o:errorDetails'][0].detail;
    } else if (error.response.data.error && error.response.data.error.message) {
      try {
        // Attempting to convert the response to a JSON
        const testIfJson = JSON.parse(error.response.data.error.message);

        if (typeof testIfJson === 'object' && testIfJson.message) {
          // E.g. Invalid search ID
          errMsg = testIfJson.message;
        } else {
          // Catch all (this should never happen though)
          errMsg = error.response.data.error.message;
        }
      } catch (errorToIgnore) {
        // E.g. Invalid login credentials (e.g. bad keys), or invalid URL
        errMsg = error.response.data.error.message;
      }
    } else if (error.response.data.message) {
      errMsg = error.response.data.message;
    } else {
      errMsg = error.message;
    }
  } else {
    if (error && error.message) {
      // E.g. Invalid JSON objects to return data
      errMsg = error.message;
    } else if (error?.code) {
      errMsg = error.code;
    } else {
      // E.g. Manually created error messages thrown or returned
      errMsg = error;
    }
  }

  return errMsg;
};

const generateCloudWatchLink = (context) => {
  const replaceMap = {
    '/': '$252F',
    '[': '$255B',
    $: '$2524',
    ']': '$255D',
  };

  const multipleReplace = (text, adict) =>
    text.replace(
      new RegExp(Object.keys(adict).join('|'), 'g'),
      (match) => adict[match]
    );

  const logGroupName = encodeURIComponent(
    `/aws/lambda/${context.functionName}`
  );
  const logStreamName = multipleReplace(context.logStreamName, replaceMap);

  return `https://${process.env.AWS_EMAIL_REGION}.console.aws.amazon.com/cloudwatch/home?#logsV2:log-groups/log-group/${logGroupName}/log-events/${logStreamName}`;
};

/**
 * Calculates the area of a rectangle.
 * @param {string} funcName - The name of the function that caused the error.
 * @param {string/object} error - Contains the error string / object.
 * @param {boolean} failFunction - if passed in as true, the lambda function will fail, setting off an alert email to backend.
 */
const handleError = (funcName, error, failFunction = false) => {
  const errMsg = extractErrMsg(error);
  console.log('Error:', errMsg);

  global.errors.push({
    func: funcName,
    nsss: global.nsss,
    sheet: global.sheet,
    sheetTab: global.sheetTab,
    sheetID: global.sheetID,
    logStreamLink: global.logStreamLink,
    message: errMsg,
  });

  if (failFunction) {
    console.log('DEBUG:');
    console.log(
      'Non-emailable error has occured. Failing function and logging errors...'
    );
    console.log('Global Errors:');
    console.log(global.errors);
    throw new Error('Forcing failure.');
  }
};

export default { handleError, generateCloudWatchLink };
