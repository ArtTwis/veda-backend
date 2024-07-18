import randomstring from "randomstring";
import { USER_ID_LENGTH } from "../constants/common.js";
import { User } from "../models/user.model.js";

export const generateVedaUserId = async () => {
  try {
    let generatedUserId =
      "veda" +
      randomstring.generate({
        length: USER_ID_LENGTH,
        charset: "numeric",
      });

    while (true) {
      let user = await User.findOne({ hospitalId: generatedUserId });

      if (user) {
        generatedUserId =
          "veda" +
          randomstring.generate({
            length: USER_ID_LENGTH,
            charset: "numeric",
          });
      } else {
        break;
      }
    }

    return generatedUserId;
  } catch (error) {
    console.log(error);
    return false;
  }
};
