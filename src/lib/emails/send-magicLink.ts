import { sendEmail } from '@/lib/emails/send-email';

import { validateWithPretty } from '@/lib/helpers';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const sendMagicLinkInputSchema = z.object({
  email: z.email(),
  url: z.url(),
});

export const sendEmailWithMagicLink = createServerFn({ method: 'POST' })
  .inputValidator((data) => validateWithPretty(sendMagicLinkInputSchema, data))
  .handler(async ({ data }) => {
    await sendEmail({
      data: {
        to: data.email,
        subject: 'Sign in to your account',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <h2 style="color: #1a1a1a; margin-bottom: 24px;">Sign in to your account</h2>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
                  Click the button below to securely sign in. This link will expire in 30 minutes.
                </p>
                <a href="${data.url}"
                   style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Sign In
                </a>
                <p style="color: #718096; font-size: 14px; margin-top: 32px; line-height: 1.5;">
                  If you didn't request this email, you can safely ignore it.
                </p>
                <p style="color: #a0aec0; font-size: 12px; margin-top: 24px;">
                  Or copy and paste this URL: ${data.url}
                </p>
              </div>
            </body>
          </html>
        `,
        text: `Sign in to your account\n\nClick this link to sign in: ${data.url}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this email, you can safely ignore it.`,
      },
    });
  });
