export const DB_NAME = "veda";

export const SALT = 10;

export const cookiesOptions = {
  httpOnly: true, //  Using the HttpOnly flag when generating a cookie helps mitigate the risk of client side script accessing the protected cookie (if the browser supports it)
  secure: true, //  The purpose of the secure attribute is to prevent cookies from being observed by unauthorized parties due to the transmission of the cookie in clear text. To accomplish this goal, browsers which support the secure attribute will only send cookies with the secure attribute when the request is going to an HTTPS page. Said in another way, the browser will not send a cookie with the secure attribute set over an unencrypted HTTP request. By setting the secure attribute, the browser will prevent the transmission of a cookie over an unencrypted channel.
};

export const errorMessages = {
  invalidInput: "Unprocessable Entity! try again..,",
  missingField: "Required fields are missing! try again..",
  validEmail: "Please provide valid email address!",
  emailAlreadyExist: "User with email already exist!",
  internalServerError:
    "The server encountered an internal error or misconfiguration and was unable to complete your request.",
  userDoesNotExist: "User does not exist! Please check email address..",
  invalidCredential: "Invalid user credentials! try again..",
  unauthorizedRequest: "Unauthorized request!",
  invalidRefreshToken: "Invalid refresh token!",
  invalidAccessToken: "Invalid access token!",
  expiredRefreshToken: "Refreshed token is expired or used!",
  generatingNewToken:
    "The server encountered an internal error while generating new tokens! try again..",
};

export const successMessages = {
  adminCreatedSuccessfully: "Admin user has been successfully created..",
  userLoggedIn: "User loggedIn successfully..",
  tokenRegenerated: "Tokens reGenerated successfully..",
  userLogout: "User logout successfully..",
};
