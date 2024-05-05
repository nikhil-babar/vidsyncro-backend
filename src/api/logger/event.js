import log from "../../utils/log.js";
import { success } from "../../utils/response.js";

export async function handler(event, context) {
  console.log("Event: ", log(event));
  console.log("Context: ", log(context));

  return success(
    {
      message: "Hello user",
    },
    200
  );
}
