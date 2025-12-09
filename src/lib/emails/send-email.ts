import { validateWithPretty } from '@/lib/helpers';
import { createServerFn } from '@tanstack/react-start';
import nodemailer from 'nodemailer';
import { z } from 'zod';

// Email validation schema
const sendEmailInputSchema = z.object({
  to: z.email(),
  subject: z.string(),
  html: z.string(),
  text: z.string().optional(),
});

// Check required environment variables
const requiredEnvVars = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD'] as const;

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Create and configure the transporter
const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || '465');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Server function to send email
export const sendEmail = createServerFn({ method: 'POST' })
  .inputValidator((data) => validateWithPretty(sendEmailInputSchema, data))
  .handler(async ({ data }) => {
    try {
      const transporter = createTransporter();

      // Verify transporter configuration
      await transporter.verify();

      // Prepare email options
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error: any) {
      throw new Error(
        error instanceof Error
          ? `Failed to send email: ${error.message}`
          : 'Failed to send email'
      );
    }
  });
