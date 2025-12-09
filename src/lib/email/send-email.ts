// sendEmail.ts
import { validateWithPretty } from '@/lib/helpers';
import { createServerFn } from '@tanstack/react-start';
import nodemailer from 'nodemailer';
import { z } from 'zod';

// Email validation schema
const sendEmailInputSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  html: z.string(),
});

// Create and configure the transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASSWORD!,
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
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: data.to,
        subject: data.subject,
        html: data.html,
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log(info);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error: any) {
      console.error('🚨🚨Error sending email:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to send email: ${error.message}`
          : 'Failed to send email'
      );
    }
  });
