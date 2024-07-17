import { validationResult } from "express-validator";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  DEFAULT_PATIENT_PASSWORD,
  errorMessages,
  successMessages,
} from "../constants/common.js";
import { isValidEmail } from "../utils/Validate.js";
import { generateVedaUserId } from "../utils/Utils.js";
import { UserAuth } from "../models/userAuth.model.js";

export const createPatient = asyncHandler(async (req, res) => {
  try {
    const validateResult = validationResult(req).array();

    if (validateResult.length > 0) {
      return res
        .status(422)
        .json(new ApiError(422, validateResult || errorMessages.invalidInput));
    }

    const {
      email,
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
      password: DEFAULT_PATIENT_PASSWORD,
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
      userType: "PATIENT",
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
    console.log("error :>", error);
    return res.status(417).json(new ApiError(417, error));
  }
});

export const getAllPatients = asyncHandler(async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $match: { userType: "PATIENT" },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          userType: 1,
          name: 1,
          mobileNumber: 1,
          yearOfBirth: 1,
          gender: 1,
          email: 1,
          bloodGroup: 1,
        },
      },
      {
        $lookup: {
          from: "Appointment",
          localField: "_id",
          foreignField: "patientId",
          as: "Appointments",
        },
      },
    ]);

    if (!users) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.internalServerError));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, users, successMessages.patientsFetched));
  } catch (error) {
    console.log("error :>", error);
    return res.status(417).json(new ApiError(417, error));
  }
});
