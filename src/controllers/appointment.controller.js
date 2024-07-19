import { validationResult } from "express-validator";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { errorMessages } from "../constants/errorMessage.js";
import ApiError from "../utils/ApiError.js";
import { successMessages } from "../constants/successMessage.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Service } from "../models/service.model.js";
import { User } from "../models/user.model.js";
import { Appointment } from "../models/appointment.model.js";

export const createAppointment = asyncHandler(async (req, res) => {
  try {
    const validateResult = validationResult(req).array();

    if (validateResult.length > 0) {
      return res
        .status(422)
        .json(new ApiError(422, validateResult || errorMessages.invalidInput));
    }

    let {
      appointmentDateTime,
      patientId,
      hospitalId,
      serviceId,
      paymentStatus,
    } = req.body;

    if (!(patientId && serviceId && paymentStatus && hospitalId)) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingField));
    }

    if (!appointmentDateTime) {
      appointmentDateTime = Date.now();
    }

    const ServiceResponse = await Service.findById(serviceId).select("_id");

    if (!ServiceResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.invalidFieldValues));
    }

    const UserResponse = await User.findOne({
      _id: patientId,
      hospitalId: hospitalId,
    }).select("_id");

    if (!UserResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.invalidFieldValues));
    }

    const AppointmentResponse = await Appointment.create({
      appointmentDateTime,
      patientId,
      hospitalId,
      serviceId,
      paymentStatus,
    });

    if (!AppointmentResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.failedToCreateAppointment));
    }

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          appointmentDateTime: Date.now(),
          patientId,
          hospitalId,
          serviceId,
          paymentStatus,
        },
        successMessages.newAppointmentCreated
      )
    );
  } catch (error) {
    console.log("error :>>", error);
    return res
      .status(417)
      .json(new ApiError(417, errorMessages.internalServerError));
  }
});
