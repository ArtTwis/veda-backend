import mongoose from "mongoose";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { UserAuth } from "../models/userAuth.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generateVedaUserId } from "../utils/Utils.js";
import { isValidEmail } from "../utils/Validate.js";
import { cookiesOptions, DEFAULT_PASSWORD } from "../constants/common.js";
import { errorMessages } from "../constants/errorMessage.js";
import { successMessages } from "../constants/successMessage.js";

const generateAccessAndRefreshToken = asyncHandler(
  async (userAuthenticationId) => {
    try {
      const userAuth = await UserAuth.findById(userAuthenticationId);

      const accessToken = await userAuth.generateAccessToken();

      const refreshToken = await userAuth.generateRefreshToken();

      userAuth.refreshToken = refreshToken;

      await userAuth.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
    } catch (error) {
      return res.status(500).json(new ApiError(500, error));
    }
  }
);

export const createAdminUser = asyncHandler(async (req, res) => {
  try {
    const validateResult = validationResult(req).array();

    if (validateResult.length > 0) {
      return res
        .status(422)
        .json(new ApiError(422, validateResult || errorMessages.invalidInput));
    }

    const userType = req.params.userType.trim();

    if (!userType) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingParameter));
    }

    const {
      email,
      password,
      name,
      guardianName,
      mobileNumber,
      guardianMobileNumber,
      yearOfBirth,
      dateOfBirth,
      gender,
      addressLine1,
      addressCity,
      addressState,
      uniqueIdType,
      uniqueIdValue,
      bloodGroup,
    } = req.body;

    if (
      [email, password, name, mobileNumber, gender].some(
        (field) => field === "" || field === undefined
      )
    ) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingField));
    }

    if (!yearOfBirth) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingField));
    }

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.invalidEmail));
    }

    const existedUser = await UserAuth.findOne({
      $or: [{ email }],
    });

    if (existedUser) {
      return res
        .status(409)
        .json(new ApiError(409, errorMessages.emailAlreadyExist));
    }

    let UserAuthResponse = await UserAuth.create({
      email,
      password,
    });

    if (!UserAuthResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.internalServerError));
    }

    const generatedUserId = await generateVedaUserId();

    if (!generatedUserId) {
      return res
        .status(417)
        .json(new ApiError(417, errorMessages.failedToGenerateUserId));
    }

    const UserResponse = await User.create({
      userType: userType,
      name,
      guardianName,
      mobileNumber,
      guardianMobileNumber,
      yearOfBirth,
      dateOfBirth,
      gender,
      email,
      addressLine1,
      addressCity,
      addressState,
      uniqueIdType,
      uniqueIdValue,
      bloodGroup,
      userAuthId: UserAuthResponse._id,
      hospitalId: generatedUserId,
    });

    if (!UserResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.internalServerError));
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, UserResponse, successMessages.newAdminCreated)
      );
  } catch (error) {
    console.log("error :>>", error);
    return res.status(417).json(new ApiError(417, error));
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  try {
    const validateResult = validationResult(req).array();

    if (validateResult.length > 0) {
      return res
        .status(422)
        .json(new ApiError(422, validateResult || errorMessages.invalidInput));
    }

    const { email, password } = req.body;

    if (email) {
      if (!isValidEmail(email)) {
        return res
          .status(404)
          .json(new ApiError(404, errorMessages.invalidEmail));
      }
    }

    const UserAuthResponse = await UserAuth.findOne({ $or: [{ email }] });

    if (!UserAuthResponse) {
      return res
        .status(404)
        .json(new ApiError(404, errorMessages.userDoesNotExist));
    }

    const isPasswordValid = await UserAuthResponse.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json(new ApiError(401, errorMessages.invalidCredential));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      UserAuthResponse._id
    );

    if (!(accessToken && refreshToken)) {
      return res
        .status(401)
        .json(new ApiError(401, errorMessages.failedToGenerateNewTokens));
    }

    const UserResponse = await User.findOne({
      userAuthId: UserAuthResponse._id,
    }).select();

    if (!UserResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.internalServerError));
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookiesOptions)
      .cookie("refreshToken", refreshToken, cookiesOptions)
      .json(
        new ApiResponse(
          200,
          {
            user: UserResponse,
            accessToken,
            refreshToken,
          },
          successMessages.userLoggedIn
        )
      );
  } catch (error) {
    return res.status(417).json(new ApiError(417, error));
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  await UserAuth.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from the document..
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookiesOptions)
    .clearCookie("refreshToken", cookiesOptions)
    .json(new ApiResponse(200, null, successMessages.loggedOutSuccess));
});

export const reGenerateAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json(new ApiError(401, errorMessages.unauthorizedRequest));
  }

  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const UserAuthResponse = await UserAuth.findById(decodedToken._id).select(
      "-password"
    );

    if (!(UserAuthResponse && UserAuthResponse.refreshToken)) {
      return res
        .status(401)
        .json(new ApiError(401, errorMessages.invalidRefreshToken));
    }

    if (incomingRefreshToken !== UserAuthResponse.refreshToken) {
      return res
        .status(401)
        .json(new ApiError(401, errorMessages.expiredRefreshToken));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      userAuthentication._id
    );

    if (!accessToken && !refreshToken) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.failedToGenerateNewTokens));
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookiesOptions)
      .cookie("refreshToken", refreshToken, cookiesOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          successMessages.tokenRegenerated
        )
      );
  } catch (error) {
    return res
      .status(401)
      .json(
        new ApiError(401, error?.message || errorMessages.invalidRefreshToken)
      );
  }
});

export const changePassword = asyncHandler(async (req, res) => {
  try {
    const validateResult = validationResult(req).array();

    if (validateResult.length > 0) {
      return res
        .status(422)
        .json(new ApiError(422, validateResult || errorMessages.invalidInput));
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword && !newPassword) {
      return res
        .status(422)
        .json(new ApiError(422, errorMessages.missingField));
    }

    const UserAuthResponse = await UserAuth.findById(req.user?._id);

    if (!UserAuthResponse) {
      return res
        .status(401)
        .json(new ApiError(401, errorMessages.unauthorizedRequest));
    }

    const isPasswordCorrect =
      await UserAuthResponse.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.invalidOldPassword));
    }

    UserAuthResponse.password = newPassword;

    await UserAuthResponse.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, successMessages.passwordChanged));
  } catch (error) {
    return res.status(401).json(new ApiError(401, error));
  }
});
