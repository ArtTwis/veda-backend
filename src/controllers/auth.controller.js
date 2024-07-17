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
import { generateVedaUserId } from "../utils/Utils.js";

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
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingField));
    }

    // Check for yearOfBirth
    if (!yearOfBirth) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingField));
    }

    // Check for vaid email address..
    if (!isValidEmail(email)) {
      return res.status(400).json(new ApiError(400, errorMessages.validEmail));
    }

    // Check if provided email isAlready exist..
    const existedUser = await UserAuth.findOne({
      $or: [{ email }],
    });

    if (existedUser) {
      return res
        .status(409)
        .json(new ApiError(409, errorMessages.emailAlreadyExist));
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
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.internalServerError));
    }

    const generateUserId = await generateVedaUserId();

    if (!generateUserId) {
      return res
        .status(417)
        .json(new ApiError(417, errorMessages.generatingUserId));
    }

    UserResponse = await User.create({
      _id: generateUserId,
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
      userAuthId: UserResponse._id,
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
          .json(new ApiError(404, errorMessages.validEmail));
      }
    }

    const userAuthentication = await UserAuth.findOne({ $or: [{ email }] });

    if (!userAuthentication) {
      return res
        .status(404)
        .json(new ApiError(404, errorMessages.userDoesNotExist));
    }

    const isPasswordValid =
      await userAuthentication.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json(new ApiError(401, errorMessages.invalidCredential));
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
    return res.status(417).json(new ApiError(417, error));
  }
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

    const userAuthentication = await UserAuth.findById(decodedToken._id).select(
      "-password"
    );

    if (!userAuthentication) {
      return res
        .status(401)
        .json(new ApiError(401, errorMessages.invalidRefreshToken));
    }

    if (incomingRefreshToken !== userAuthentication.refreshToken) {
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
        .json(new ApiError(500, errorMessages.generatingNewToken));
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

    const userAuth = await UserAuth.findById(req.user?._id);

    if (!userAuth) {
      return res
        .status(401)
        .json(new ApiError(401, errorMessages.invalidAccessToken));
    }

    const isPasswordCorrect = await userAuth.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.invalidOldPassword));
    }

    userAuth.password = newPassword;

    await userAuth.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, successMessages.passwordChanged));
  } catch (error) {
    return res.status(401).json(new ApiError(401, error));
  }
});
