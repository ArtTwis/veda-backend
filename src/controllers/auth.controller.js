import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { errorMessages, successMessages } from "../constants/common.js";
import { isValidEmail } from "../utils/Validate.js";
import { UserAuth } from "../models/userAuth.model.js";
import { User } from "../models/user.model.js";

export const createAdminUser = async (req, res) => {
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
};
