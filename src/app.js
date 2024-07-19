import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";

const app = express();

/*==============
==Middlewares==
==============*/

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    allowedHeaders: "",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));

// express.urlencoded is used to encode url, extended property is used to encode url in depth or nested level
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

// middleware to secure Express apps by setting HTTP response headers.
app.use(helmet());

// middleware for HTTP request logger.
app.use(morgan("combined"));

app.use(express.static("public"));

app.use(cookieParser());

/*==============
=====Routes=====
==============*/

import userAuthRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import serviceRouter from "./routes/service.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";

app.use(`/api/${process.env.VEDA_API_VERSION}/auth`, userAuthRouter);
app.use(`/api/${process.env.VEDA_API_VERSION}/route`, userRouter);
app.use(`/api/${process.env.VEDA_API_VERSION}/route`, serviceRouter);
app.use(`/api/${process.env.VEDA_API_VERSION}/route`, appointmentRouter);

//  Handle invalid request
app.use(notFoundMiddleware);

export default app;
