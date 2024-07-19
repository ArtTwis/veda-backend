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

    let { appointmentDateTime, patientId, doctorId, serviceId, paymentStatus } =
      req.body;

    if (!(patientId && serviceId && paymentStatus && doctorId)) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingField));
    }

    if (!appointmentDateTime || appointmentDateTime === "") {
      appointmentDateTime = Date.now();
    }

    const ServiceResponse = await Service.findById(serviceId).select("_id");

    if (!ServiceResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.invalidFieldValues));
    }

    const PatientUserResponse = await User.findOne({
      _id: patientId,
    }).select("_id");

    if (!PatientUserResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.invalidFieldValues));
    }

    const DoctorUserResponse = await User.findOne({
      _id: doctorId,
    }).select("_id");

    if (!DoctorUserResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.invalidFieldValues));
    }

    const AppointmentResponse = await Appointment.create({
      appointmentDateTime,
      patientId,
      doctorId,
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
          doctorId,
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

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  try {
    const validateResult = validationResult(req).array();

    if (validateResult.length > 0) {
      return res
        .status(422)
        .json(new ApiError(422, validateResult || errorMessages.invalidInput));
    }

    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingField));
    }

    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingField));
    }

    const AppointmentResponse = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: { paymentStatus } },
      { new: true }
    );

    if (!AppointmentResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.failedToUpdateAppointment));
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, AppointmentResponse, successMessages.recordUpdated)
      );
  } catch (error) {
    console.log("error :>>", error);
    return res
      .status(417)
      .json(new ApiError(417, errorMessages.internalServerError));
  }
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  try {
    const validateResult = validationResult(req).array();

    if (validateResult.length > 0) {
      return res
        .status(422)
        .json(new ApiError(422, validateResult || errorMessages.invalidInput));
    }

    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingParameter));
    }

    const { appointmentStatus } = req.body;

    if (!appointmentStatus) {
      return res
        .status(400)
        .json(new ApiError(400, errorMessages.missingField));
    }

    const AppointmentResponse = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: { appointmentStatus } },
      { new: true }
    );

    if (!AppointmentResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.failedToUpdateAppointment));
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, AppointmentResponse, successMessages.recordUpdated)
      );
  } catch (error) {
    console.log("error :>>", error);
    return res
      .status(417)
      .json(new ApiError(417, errorMessages.internalServerError));
  }
});

export const getAllAppointments = asyncHandler(async (req, res) => {
  try {
    const AppointmentResponse = await Appointment.aggregate([
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
      {
        $lookup: {
          from: "users",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
    ]);

    if (!AppointmentResponse) {
      return res
        .status(500)
        .json(new ApiError(500, errorMessages.failedToRetrievedRecords));
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          AppointmentResponse,
          successMessages.recordsRetrieved
        )
      );
  } catch (error) {
    console.log("error :>>", error);
    return res
      .status(417)
      .json(new ApiError(417, errorMessages.internalServerError));
  }
});
