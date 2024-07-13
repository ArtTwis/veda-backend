import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
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

app.use(express.static("public"));

app.use(cookieParser());

//  Handle invalid request
app.use((err, req, res) => {
  res.status(404).json(
    new ApiError(
      404,
      {
        success: false,
        message:
          "Uh-oh! It seems you've wandered off course. Let's steer you back to safety",
      },
      "Uh-oh! It seems you've wandered off course. Let's steer you back to safety",
      err
    )
  );
});

export default app;
