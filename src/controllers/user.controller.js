import { validationResult } from "express-validator";
import { UserAuth } from "../models/userAuth.model.js";
import { User } from "../models/user.model.js";
import { Doctor } from "../models/doctor.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { errorMessages } from "../constants/errorMessage.js";
import { successMessages } from "../constants/successMessage.js";
import { isValidEmail } from "../utils/Validate.js";
import { generateVedaUserId } from "../utils/Utils.js";
import { UserTypeEnum } from "../constants/common.js";

export const createUser = asyncHandler(async (req, res) => {
  try {
    const validateResult = validationResult(req).array();

    if (validateResult.length > 0) {
      return res
        .status(422)
        .json(new ApiError(422, validateResult || errorMessages.invalidInput));
    }

    let userType = req.params.userType.trim();

    if (!userType) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingParameter));
    }

    userType = userType.toUpperCase();

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
      department,
      degrees,
      totalExperience,
      experiences,
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

    if (userType === "DOCTOR") {
      const DoctorResponse = await Doctor.create({
        department,
        degrees,
        totalExperience,
        experiences,
        userId: UserResponse._id,
        hospitalId: generatedUserId,
      });

      if (!DoctorResponse) {
        return res
          .status(500)
          .json(new ApiError(500, errorMessages.internalServerError));
      }
    }

    return res
      .status(201)
      .json(new ApiResponse(201, UserResponse, successMessages.newUserCreated));
  } catch (error) {
    console.log("error :>>", error);
    return res.status(417).json(new ApiError(417, error));
  }
});

export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    let { userType } = req.params;

    if (!userType) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingParameter));
    }

    userType = userType.toUpperCase();

    const users = await User.aggregate([
      {
        $match: { userType, isActive: 1 },
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

    if (users.length === 0) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.userNotFound));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, users, successMessages.recordsRetrieved));
  } catch (error) {
    return res
      .status(417)
      .json(new ApiError(417, errorMessages.internalServerError));
  }
});

export const getUserDetails = asyncHandler(async (req, res) => {
  try {
    let { userType, userId } = req.params;

    if (!(userType && userId)) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingParameter));
    }

    userType = userType.toUpperCase();

    let finalResponse = null;

    if (userType === UserTypeEnum.patient) {
      const UserResponse = await User.aggregate([
        {
          $match: {
            hospitalId: userId,
            userType: UserTypeEnum.patient,
            isActive: 1,
          },
        },
        {
          $project: {
            userAuthId: 0,
          },
        },
        {
          $lookup: {
            from: "appointments",
            localField: "_id",
            foreignField: "patientId",
            as: "appointments",
            pipeline: [
              {
                $lookup: {
                  from: "services",
                  localField: "serviceId",
                  foreignField: "_id",
                  as: "service",
                  pipeline: [
                    {
                      $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "doctor",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ]);

      if (UserResponse.length === 0) {
        return res
          .status(500)
          .json(new ApiError(500, errorMessages.userNotFound));
      }

      finalResponse = UserResponse;
    }

    if (userType === UserTypeEnum.doctor) {
      const UserResponse = await User.aggregate([
        {
          $match: {
            hospitalId: userId,
            userType: UserTypeEnum.doctor,
            isActive: 1,
          },
        },
        {
          $project: {
            userAuthId: 0,
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "userId",
            as: "experienceInfo",
          },
        },
        {
          $lookup: {
            from: "services",
            localField: "_id",
            foreignField: "userId",
            as: "services",
          },
        },
        {
          $lookup: {
            from: "appointments",
            localField: "_id",
            foreignField: "doctorId",
            as: "appointments",
            pipeline: [
              {
                $lookup: {
                  from: "services",
                  localField: "serviceId",
                  foreignField: "_id",
                  as: "service",
                  pipeline: [
                    {
                      $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "doctor",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ]);

      if (UserResponse.length === 0) {
        return res
          .status(500)
          .json(new ApiError(500, errorMessages.userNotFound));
      }

      finalResponse = UserResponse;
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, finalResponse, successMessages.recordsRetrieved)
      );
  } catch (error) {
    return res
      .status(417)
      .json(new ApiError(417, errorMessages.internalServerError));
  }
});

export const disableUser = asyncHandler(async (req, res) => {
  try {
    let { userType, userId } = req.params;

    if (!(userType && userId)) {
      return res
        .status(422)
        .json(new ApiError(417, errorMessages.missingParameter));
    }

    userType = userType.toUpperCase();

    const UserResponse = await User.findOneAndUpdate(
      { hospitalId: userId, userType: userType },
      {
        $set: { isActive: 0 },
      },
      { new: true }
    ).select("_id");

    if (UserResponse.length === 0) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.userNotFound));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, UserResponse, successMessages.userAccountDisabled)
      );
  } catch (error) {
    return res
      .status(417)
      .json(new ApiError(417, errorMessages.internalServerError));
  }
});

export const enableUser = asyncHandler(async (req, res) => {
  try {
    let { userType, userId } = req.params;

    if (!(userType && userId)) {
      return res
        .status(422)
        .json(new ApiError(417, errorMessages.missingParameter));
    }

    userType = userType.toUpperCase();

    const UserResponse = await User.findOneAndUpdate(
      { hospitalId: userId, userType: userType },
      {
        $set: { isActive: 1 },
      },
      { new: true }
    ).select("_id");

    if (UserResponse.length === 0) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.userNotFound));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, UserResponse, successMessages.userAccountEnabled)
      );
  } catch (error) {
    return res
      .status(417)
      .json(new ApiError(417, errorMessages.internalServerError));
  }
});

export const updateUserInfo = asyncHandler(async (req, res) => {
  try {
    let { userType, userId } = req.params;

    if (!(userType && userId)) {
      return res
        .status(422)
        .json(new ApiError(417, errorMessages.missingParameter));
    }

    userType = userType.toUpperCase();

    let updatingFields = {};

    Object.keys(req.body).forEach((field) => {
      updatingFields[field] = req.body[field];
    });

    const UserResponse = await User.findOneAndUpdate(
      { hospitalId: userId, userType: userType },
      {
        $set: updatingFields,
      },
      { new: true }
    );

    if (UserResponse.length === 0) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.userNotFound));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, UserResponse, successMessages.updatedUserProfile)
      );
  } catch (error) {
    console.log("error :>", error);
    return res
      .status(417)
      .json(new ApiError(417, errorMessages.internalServerError));
  }
});
