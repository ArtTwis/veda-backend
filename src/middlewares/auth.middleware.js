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
      return res
        .status(401)
        .json(new ApiError(401, errorMessages.unauthorizedRequest));
    }

    const decodedTokenInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const userAuth = await UserAuth.findById(decodedTokenInfo?._id).select(
      "-password -refreshToken"
    );

    if (!userAuth) {
      // TODO: discuss about FE...
      return res
        .status(401)
        .json(new ApiError(401, errorMessages.invalidAccessToken));
    }

    req.user = userAuth;

    next();
  } catch (error) {
    return res.status(401).json(new ApiError(401, error));
  }
});
