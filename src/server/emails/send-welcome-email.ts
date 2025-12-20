import { emailColors } from '@/lib/email-colors';
import { sendEmail } from '@/server/emails/send-email';

import { validateWithPretty } from '@/lib/helpers';
import { z } from 'zod';

const sendWelcomeEmailSchema = z.object({
  email: z.email(),
  name: z.string(),
});

export const sendWelcomeEmail = async (data: {
  email: string;
  name: string;
}) => {
  const validated = validateWithPretty(sendWelcomeEmailSchema, data);

  await sendEmail({
    to: validated.email,
    subject: 'Welcome to our app',
    html: `
          <!DOCTYPE html>
          <html>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${emailColors.background}; color: ${emailColors.foreground};">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: ${emailColors.primary};">Welcome to Our App!</h2>
        <p>Hello ${validated.name},</p>
        <p>Thank you for signing up for our app! We're excited to have you on board.</p>
        <p>Best regards,
        <br>
        Your App Team</p>
              </div>
            </body>
          </html>
        `,
    text: `Hello ${validated.name},\n\nThank you for signing up for our app! We're excited to have you on board.\n\nBest regards,\nYour App Team`,
  });
  return { success: true };
};
