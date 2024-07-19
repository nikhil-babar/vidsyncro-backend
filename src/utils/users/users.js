import User from "../../models/User.js";

export const isEmailAvailable = async (email) => {
  try {
    const exists = await User.exists({ email: email });
    return !exists;
  } catch (error) {
    console.log(
      `Error while checking availabiltiy of email: ${email} => ${error.message}`
    );
    throw error;
  }
};

export const verifyAccount = async (account_id) => {
  try {
    const account = await User.findByIdAndUpdate(account_id, {
      verified: true,
    });

    if (account.verified) {
      throw new Error("link-already-used");
    }

    return account._doc;
  } catch (error) {
    console.log(
      `Error while verifying the account with id: ${account_id} => ${error.message}`
    );
    throw error;
  }
};

export const createAccount = async (username, email, password) => {
  try {
    const account = new User({
      username,
      password,
      email,
    });

    await account.save();

    return account._doc;
  } catch (error) {
    console.log(
      `Error while creating account for params: ${{
        username,
        email,
        password,
      }} => ${error.message}`
    );
    throw error;
  }
};
