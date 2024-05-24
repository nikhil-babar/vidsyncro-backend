function formatCookies(cookies) {
  return Object.entries(cookies).map(([key, value]) => {
    // Set default values if they are not specified
    const path = value.path ? value.path : "/";
    const maxAge = value.maxAge ? value.maxAge : 86400; // 1 day in seconds

    let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(
      value.value
    )}`;

    cookieString += `; Path=${path}`;
    cookieString += `; Max-Age=${maxAge}`;
    cookieString += `; HttpOnly`;

    return cookieString;
  });
}

export function success(data, statusCode = 200, cookies = null) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.FRONTEND_END,
    "Access-Control-Allow-Credentials": "true",
  };

  if (cookies) {
    headers["Set-Cookie"] = formatCookies(cookies).join(",");
    console.log(headers["Set-Cookie"]);
  }

  return {
    body: JSON.stringify({
      ...data,
    }),
    statusCode,
    headers,
  };
}

export function error(error, statusCode = 500) {
  return {
    body: JSON.stringify({
      message: error.message,
      stack: error.stack,
    }),
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": process.env.FRONTEND_END,
      "Access-Control-Allow-Credentials": "true",
    },
  };
}
