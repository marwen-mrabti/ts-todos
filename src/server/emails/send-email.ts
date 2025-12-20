import { env } from '@/lib/env';
import nodemailer from 'nodemailer';
import { z } from 'zod';

// Email validation schema
const sendEmailInputSchema = z.object({
  to: z.email(),
  subject: z.string(),
  html: z.string(),
  text: z.string().optional(),
});

type SendEmailInput = z.infer<typeof sendEmailInputSchema>;

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

// ✅ To be used within better-auth plugins or within server functions
export async function sendEmail(data: SendEmailInput) {
  try {
    const transporter = createTransporter();

    await transporter.verify();

    const mailOptions = {
      from: env.SMTP_USER,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error: unknown) {
    console.log('🚨🚨 Send email error 🚨🚨 ', (error as Error)?.message);
    throw error;
  }
}
