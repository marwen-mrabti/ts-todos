import { validateWithPretty } from '@/lib/helpers';
import { emailColors } from '@/serverFns/emails/email-colors';
import { sendEmail } from '@/serverFns/emails/send-email';
import { z } from 'zod';

const sendMagicLinkInputSchema = z.object({
  email: z.email(),
  url: z.url(),
});

export async function sendEmailWithMagicLink(data: {
  email: string;
  url: string;
}) {
  const validated = validateWithPretty(sendMagicLinkInputSchema, data);

  await sendEmail({
    to: validated.email,
    subject: 'Sign in to your account',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${emailColors.background};">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="color: ${emailColors.foreground}; margin-bottom: 24px;">Sign in to your account</h2>
            <p style="color: ${emailColors.mutedForeground}; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
              Click the button below to securely sign in. This link will expire in 30 minutes.
            </p>
            <a href="${validated.url}"
               style="display: inline-block; background: ${emailColors.primary}; color: ${emailColors.primaryForeground}; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Sign In
            </a>
            <p style="color: ${emailColors.mutedForeground}; font-size: 14px; margin-top: 32px; line-height: 1.5;">
              If you didn't request this email, you can safely ignore it.
            </p>
            <p style="color: ${emailColors.mutedForeground}; font-size: 12px; margin-top: 24px; opacity: 0.7;">
              Or copy and paste this URL: ${validated.url}
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Sign in to your account\n\nClick this link to sign in: ${validated.url}\n\nThis link will expire in 30 minutes.\n\nIf you didn't request this email, you can safely ignore it.`,
  });

  return { success: true };
}
