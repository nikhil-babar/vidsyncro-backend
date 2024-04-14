export function error(error, statusCode = 500) {
  return {
    body: JSON.stringify({
      message: error.message,
      stack: error.stack,
    }),
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
}

export function success(data, statusCode = 200) {
  return {
    body: JSON.stringify({
      ...data,
    }),
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
}
