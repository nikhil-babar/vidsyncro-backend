import { error } from "./response.js";

export const parse = (payload, parser, callback) => {
  const parsed = parser.safeParse(payload);

  if (!parsed.success) {
    callback(
      undefined,
      error(
        {
          message: parsed.error,
        },
        422
      )
    );

    throw new Error("invalid-parameters");
  }

  return parsed.data;
};
