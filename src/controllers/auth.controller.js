import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  errorMessages,
  successMessages,
  cookiesOptions,
} from "../constants/common.js";
import { isValidEmail } from "../utils/Validate.js";
import { UserAuth } from "../models/userAuth.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

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
      throw new ApiError(500, null, error, error);
    }
  }
);

export const createAdminUser = asyncHandler(async (req, res) => {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new ApiError(422, null, errorMessages.invalidInput, result.array());
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

    // Check required fields..
    if (
      [
        email,
        password,
        name,
        mobileNumber,
        gender,
        addressLine1,
        addressCity,
        addressState,
      ].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(
        400,
        null,
        errorMessages.missingField,
        errorMessages.missingField
      );
    }

    // Check for yearOfBirth
    if (!yearOfBirth) {
      throw new ApiError(
        400,
        null,
        errorMessages.missingField,
        errorMessages.missingField
      );
    }

    // Check for vaid email address..
    if (!isValidEmail(email)) {
      throw new ApiError(
        400,
        null,
        errorMessages.validEmail,
        errorMessages.validEmail
      );
    }

    // Check if provided email isAlready exist..
    const existedUser = await UserAuth.findOne({
      $or: [{ email }],
    });

    if (existedUser) {
      throw new ApiError(
        409,
        null,
        errorMessages.emailAlreadyExist,
        errorMessages.emailAlreadyExist
      );
    }

    // Create Admin user...
    let UserResponse = await UserAuth.create({
      email,
      password,
    });

    const createdUserAuth = await UserAuth.findById(UserResponse._id).select(
      "-password -refreshToken"
    );

    if (!createdUserAuth) {
      throw new ApiError(
        500,
        null,
        errorMessages.internalServerError,
        errorMessages.internalServerError
      );
    }

    UserResponse = await User.create({
      _id: UserResponse._id,
      userType: "ADMIN",
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
    });

    const createdUser = await User.findById(UserResponse._id).select();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          createdUser,
          successMessages.adminCreatedSuccessfully
        )
      );
  } catch (error) {
    throw new ApiError(417, null, error, error);
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email) {
      if (!isValidEmail(email)) {
        throw new ApiError(
          404,
          null,
          errorMessages.validEmail,
          errorMessages.validEmail
        );
      }
    }

    const userAuthentication = await UserAuth.findOne({ $or: [{ email }] });

    if (!userAuthentication) {
      throw (
        (new ApiError(404, null),
        errorMessages.userDoesNotExist,
        errorMessages.userDoesNotExist)
      );
    }

    const isPasswordValid =
      await userAuthentication.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(
        401,
        null,
        errorMessages.invalidCredential,
        errorMessages.invalidCredential
      );
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      userAuthentication._id
    );

    const loggedInUser = await User.findById(userAuthentication._id).select();

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookiesOptions)
      .cookie("refreshToken", refreshToken, cookiesOptions)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          successMessages.userLoggedIn
        )
      );
  } catch (error) {
    throw new ApiError(417, null, error, error);
  }
});

export const reGenerateAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(
      401,
      null,
      errorMessages.unauthorizedRequest,
      errorMessages.unauthorizedRequest
    );
  }

  try {
    const decodedToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const userAuthentication = await UserAuth.findById(decodedToken._id).select(
      "-password"
    );

    if (!userAuthentication) {
      throw new ApiError(
        401,
        null,
        errorMessages.invalidRefreshToken,
        errorMessages.invalidRefreshToken
      );
    }

    if (incomingRefreshToken !== userAuthentication.refreshToken) {
      throw new ApiError(
        401,
        null,
        errorMessages.expiredRefreshToken,
        errorMessages.expiredRefreshToken
      );
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      userAuthentication._id
    );

    if (!accessToken && !refreshToken) {
      throw new ApiError(
        500,
        null,
        errorMessages.generatingNewToken,
        errorMessages.generatingNewToken
      );
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
    throw new ApiError(
      401,
      null,
      error?.message || errorMessages.invalidRefreshToken,
      error
    );
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
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
    .json(new ApiResponse(200, null, successMessages.userLogout));
});

export const changePassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword && !newPassword) {
      throw new ApiError(
        422,
        null,
        errorMessages.missingField,
        errorMessages.missingField
      );
    }

    const userAuth = await UserAuth.findById(req.user?._id);

    if (!userAuth) {
      throw new ApiError(
        401,
        null,
        errorMessages.invalidAccessToken,
        errorMessages.invalidAccessToken
      );
    }

    const isPasswordCorrect = await userAuth.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(
        400,
        null,
        errorMessages.invalidOldPassword,
        errorMessages.invalidOldPassword
      );
    }

    userAuth.password = newPassword;

    await userAuth.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, successMessages.passwordChanged));
  } catch (error) {
    throw new ApiError(401, null, error, errorMessages.updatingPassword);
  }
});
