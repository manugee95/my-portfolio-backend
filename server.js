const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://my-portfolio-lac-pi-48.vercel.app"]
  })
);
app.use(express.json());

const PORT = process.env.PORT || 8000;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: "astutehcc.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Appointment Booking Endpoint
app.post("/api/contact-me", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      captchaToken,
    } = req.body;

    // Validate reCAPTCHA token
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET,
          response: captchaToken,
        },
      }
    );

    if (!recaptchaResponse.data.success || recaptchaResponse.data.score < 0.5) {
      return res.status(400).json({ error: "reCAPTCHA verification failed" });
    }

    // Email Content
    const mailOptions = {
      from: `"My Portfolio Website" <${EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: "New Contact Information",
      html: `
        <div style="text-align: left;">
          <p>You have a new message from your portfolio website. Here are the details: </p>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Date:</b> ${message}</p>
        </div>
      `,
    };

    // Send Email
    await transporter.sendMail(mailOptions);

    console.log("email sent:", {
      name,
      email,
      phone,
      message,
    });

    res.status(200).json({
      message: "Email sent to admin.",
    });
  } catch (error) {
    console.error("Error getting in touch:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
