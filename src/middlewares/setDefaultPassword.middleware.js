import { DEFAULT_PASSWORD } from "../constants/common.js";

export const setDefaultPassword = (req, res, next) => {
  req.body.password = DEFAULT_PASSWORD;
  next();
};
