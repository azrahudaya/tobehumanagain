import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter: nodemailer.Transporter | null = null;

if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export const sendOtpEmail = async ({ email, code, purpose }: { email: string; code: string; purpose: "signup" | "login" }) => {
  const subject = purpose === "signup" ? "Kode OTP Sign Up - To Be Human Again" : "Kode OTP Login - To Be Human Again";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
      <h2 style="color: #594449;">To Be Human Again</h2>
      <p>Kode OTP kamu:</p>
      <p style="font-size: 30px; letter-spacing: 6px; font-weight: 700; color: #2f3b75;">${code}</p>
      <p>Kode berlaku selama 10 menit dan hanya untuk 1 sesi.</p>
    </div>
  `;

  if (!transporter) {
    console.log(`[DEV OTP] ${email} (${purpose}): ${code}`);
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject,
    html,
  });
};
