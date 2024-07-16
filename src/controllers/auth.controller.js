import { validationResult } from "express-validator";
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

const generateAccessAndRefreshToken = async (userAuthenticationId) => {
  try {
    const user = await UserAuth.findById(userAuthenticationId);

    const accessToken = await user.generateAccessToken();

    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      null,
      errorMessages.internalServerError,
      errorMessages.internalServerError
    );
  }
};

export const createAdminUser = async (req, res) => {
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
};

export const loginUser = async (req, res) => {
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
};
