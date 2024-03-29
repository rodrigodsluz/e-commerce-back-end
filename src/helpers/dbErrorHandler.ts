/**
 * Get unique error field name
 */
const uniqueMessage = (error: { message: string }) => {
  let output;
  try {
    const fieldName = error.message.substring(
      error.message.lastIndexOf('.$') + 2,
      error.message.lastIndexOf('_1'),
    );
    output = `${
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    } already exists`;
  } catch (ex) {
    output = 'Unique field already exists';
  }

  return output;
};

/**
 * Get the erroror message from error object
 */
export default {
  errorHandler(error: { message: string; code: any; errorors: any }) {
    let message = '';

    if (error.code) {
      switch (error.code) {
        case 11000:
        case 11001:
          message = uniqueMessage(error);
          break;
        default:
          message = 'Something went wrong';
      }
    } else {
      for (const errorName in error.errorors) {
        if (error.errorors[errorName].message)
          message = error.errorors[errorName].message;
      }
    }

    return message;
  },
};
