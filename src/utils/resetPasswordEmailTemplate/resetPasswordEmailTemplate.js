import { generateSignedUrl } from "../signedUrl.js";

export default async function resetPasswordTemplate(resetUrl) {
  const signedImageUrl = await generateSignedUrl('Logo-01.jpg', 7 * 24 * 60 * 60);
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="margin:0;padding:0;width:100%;background-color:#FFFFFF;font-family:Arial,sans-serif;">
      <header style="margin:0;padding:20px 0 0 0px;text-align:left;">
        <img
          src="${signedImageUrl}"
          alt="logo"
          style="display:block;width:130px;object-fit:contain;margin:0;"
        />
      </header>
      <main style="padding:0 20px;">
        <h1 style="margin:20px 0 20px 0;font-size:20px;font-weight:normal;color:#253138;">
          Hi!
        </h1>

        <div style="margin:40px 0;">
          <p style="margin:0 0 10px 0;color:#253138;font-size:16px;line-height:1.2;">
            We received a request to update your password.
          </p>
          <p style="margin:0 0 10px 0;color:#253138;font-size:16px;line-height:1.2;">
            To reset your password, click the link below. This link expires in 1 hour:
          </p>
        </div>

        <p style="margin:20px 0 12px 0;">
          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              padding:10px 15px;
              border-radius:10px;
              background-color:#007bff;
              color:#ffffff;
              text-decoration:none;
              font-weight:300;
              font-size:16px;
            "
          >
            Reset Password
          </a>
        </p>

        <div style="margin:40px 0;">
          <p style="margin:0 0 10px 0;color:#253138;font-size:16px;line-height:1.2;">
            If you did not initiate this request, please disregard this email.
          </p>
          <p style="margin:0 0 10px 0;color:#253138;font-size:16px;line-height:1.2;">
            If you have any questions or concerns, please contact us at
            <span style="color:#086DD7;">info@fit4taal.com</span>
          </p>
        </div>

        <div style="margin:40px 0;">
          <p style="margin:0 0 10px 0;color:#253138;font-size:16px;line-height:1.2;">
            Thank you
          </p>
          <p style="margin:0 0 10px 0;color:#253138;font-size:16px;line-height:1.2;">
            Fit4taal team
          </p>
        </div>
      </main>
    </body>
    </html>
  `;
}
