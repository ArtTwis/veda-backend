import jwt from "jsonwebtoken";
import { errorMessages } from "../constants/common.js";
import { UserAuth } from "../models/userAuth.model.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const verifyJwtToken = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(
        401,
        null,
        errorMessages.unauthorizedRequest,
        errorMessages.unauthorizedRequest
      );
    }

    const decodedTokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await UserAuth.findById(decodedTokenInfo?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      // TODO: discuss about FE...
      throw new ApiError(
        401,
        null,
        errorMessages.invalidAccessToken,
        errorMessages.invalidAccessToken
      );
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, null, error, error);
  }
});
