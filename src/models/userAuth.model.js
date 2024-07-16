import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { SALT } from "../constants/common.js";

const UserAuthSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "User email must required!!"],
      unique: [true, "User email must be unique!!"],
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "User password must required!!"],
    },
    refreshToken: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

UserAuthSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, SALT);
  }
  next();
});

UserAuthSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.hash);
};

UserAuthSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

UserAuthSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const UserAuth = mongoose.model("UserAuth", UserAuthSchema);
