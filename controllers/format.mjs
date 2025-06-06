import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });
import helper from '../helpers/errors.mjs';

const dereference = (input) => {
  try {
    input.forEach((row) => {
      for (let key in row) {
        let value = row[key];
        if (Array.isArray(value)) {
          if (value.length > 0 && 'text' in value[0]) {
            // Replace with 'text' from the first element if array is not empty
            row[key] = value[0].text;
          } else if (value.length === 0) {
            // Replace with null if array is empty
            row[key] = null;
          }
        }
      }
    });

    return input;
  } catch (error) {
    helper.handleError(funcName, error);
  }
};

export default { dereference };
