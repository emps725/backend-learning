import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //doesnt validate every field since we are only putting refresh token for now

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens.");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username alrdy exists", []);
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryTokens();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      mail: user?.email,
      subject: "Please verify your email",
      mailgenContent: emailVerificationMailgenContent(
        user.username,
        `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
      ),
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email sending fail:", error);
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user.");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully and verification email has been sent",
      ),
    );
});

export { registerUser };
