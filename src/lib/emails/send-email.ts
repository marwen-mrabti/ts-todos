import { env } from '@/lib/env';
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

// Create and configure the transporter
const createTransporter = () => {
  const port = env.SMTP_PORT;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
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
        from: env.SMTP_USER,
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
      console.log(error.message);
      throw new Error('Failed to send email.');
    }
  });
