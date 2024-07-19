import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { errorMessages } from "../constants/errorMessage.js";
import ApiError from "../utils/ApiError.js";
import { Service } from "../models/service.model.js";
import { successMessages } from "../constants/successMessage.js";
import ApiResponse from "../utils/ApiResponse.js";

export const createDoctorService = asyncHandler(async (req, res) => {
  try {
    const validateResult = validationResult(req).array();

    if (validateResult.length > 0) {
      return res
        .status(422)
        .json(new ApiError(422, validateResult || errorMessages.invalidInput));
    }

    const { name, fees, description, userId, hospitalId } = req.body;

    if (!(name && fees && description && userId && hospitalId)) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingField));
    }

    const ServiceResponse = await Service.create({
      name,
      fees,
      description,
      userId,
      hospitalId,
    });

    if (!ServiceResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.failedToCreateService));
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, ServiceResponse, successMessages.newServiceCreated)
      );
  } catch (error) {
    console.log("error :>>", error);
    return res
      .status(417)
      .json(new ApiError(417, errorMessages.internalServerError));
  }
});

export const getDoctorServices = asyncHandler(async (req, res) => {
  try {
    let { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingParameter));
    }

    const ServiceResponse = await Service.find({ hospitalId: userId });

    if (!ServiceResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.failedToRetrievedRecords));
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, ServiceResponse, successMessages.recordsRetrieved)
      );
  } catch (error) {
    console.log("error :>>", error);
    return res
      .status(417)
      .json(new ApiError(417, errorMessages.internalServerError));
  }
});
