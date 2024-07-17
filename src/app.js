import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import ApiError from "./utils/ApiError.js";

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

app.use(`/api/${process.env.VEDA_API_VERSION}/auth`, userAuthRouter);

//  Handle invalid request
app.use((err, req, res) => {
  return res.status(404).json(
    new ApiError(
      404,
      {
        success: false,
        message:
          "\nUh-oh! It seems you've wandered off course. Let's steer you back to safety",
      },
      "\nUh-oh! It seems you've wandered off course. Let's steer you back to safety",
      err
    )
  );
});

export default app;
