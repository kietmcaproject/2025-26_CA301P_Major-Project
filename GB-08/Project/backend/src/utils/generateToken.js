import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  //console.log(process.env.JWT_SECRET)
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
