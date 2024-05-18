function formatCookies(cookies) {
  // Create an array of cookies strings
  return Object.entries(cookies).map(([key, value]) => {
    let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(
      value.value
    )}`;

    if (value.maxAge) {
      cookieString += `; Max-Age=${value.maxAge}`;
    }

    if (value.expires) {
      cookieString += `; Expires=${new Date(value.expires).toUTCString()}`;
    }

    if (value.path) {
      cookieString += `; Path=${value.path}`;
    }

    if (value.domain) {
      cookieString += `; Domain=${value.domain}`;
    }

    if (value.secure) {
      cookieString += `; Secure`;
    }

    if (value.httpOnly) {
      cookieString += `; HttpOnly`;
    }

    if (value.sameSite) {
      cookieString += `; SameSite=${value.sameSite}`;
    }

    return cookieString;
  });
}

export function success(data, statusCode = 200, cookies = null) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.FRONTEND_END,
    "Access-Control-Allow-Credentials": true,
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
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
}
