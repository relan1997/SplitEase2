import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "harshalrelan99@gmail.com",
    pass: "icdojjyjfeijqjud", // Use Gmail App Password
  },
});

export default transporter;
