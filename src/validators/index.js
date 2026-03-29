import { body } from "express-validator";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be lower case")
      .length({ min: 3 })
      .withMessage("Username must be atleast 3 characters long"),
    body("password").trim().notEmpty.withMessage("Password is required"),
    body("fullname").optional().trim(),
  ];
};

export { userRegisterValidator };
