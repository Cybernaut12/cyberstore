let nodemailer = null;
try {
  // Optional dependency for environments where SMTP delivery is enabled.
  // Fallback behavior is handled below if package/config is missing.
  nodemailer = require("nodemailer");
} catch (error) {
  nodemailer = null;
}

let cachedTransporter = null;

const smtpHost =
  process.env.SMTP_HOST ||
  process.env.BREVO_SMTP_HOST ||
  "smtp-relay.brevo.com";
const smtpPort = Number(
  process.env.SMTP_PORT ||
    process.env.BREVO_SMTP_PORT ||
    587
);
const smtpSecure =
  String(
    process.env.SMTP_SECURE ??
      process.env.BREVO_SMTP_SECURE ??
      "false"
  ).toLowerCase() === "true";
const smtpUser =
  process.env.SMTP_USER ||
  process.env.BREVO_SMTP_LOGIN ||
  "";
const smtpPass =
  process.env.SMTP_PASS ||
  process.env.BREVO_SMTP_KEY ||
  "";
const fromAddress =
  process.env.EMAIL_FROM ||
  process.env.BREVO_EMAIL_FROM ||
  "CyberStore <no-reply@cyberstore.dev>";
const emailRequestTimeoutMs = Number(process.env.EMAIL_TIMEOUT_MS || 15000);

const canSendEmail = () =>
  Boolean(smtpHost && smtpPort && smtpUser && smtpPass);

const isEmailConfigured = () => Boolean(nodemailer && canSendEmail());

const getTransporter = () => {
  if (!isEmailConfigured()) return null;
  if (cachedTransporter) return cachedTransporter;

  cachedTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    connectionTimeout: emailRequestTimeoutMs,
    greetingTimeout: emailRequestTimeoutMs,
    socketTimeout: emailRequestTimeoutMs,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return cachedTransporter;
};

exports.sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    // Dev fallback: no SMTP configured.
    console.log(`[MAIL-DEV] to=${to} subject=${subject} text=${text}`);
    return { delivered: false, reason: "smtp_not_configured" };
  }

  try {
    await Promise.race([
      transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text,
        html,
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("email_send_timeout")), emailRequestTimeoutMs);
      }),
    ]);
    return { delivered: true };
  } catch (error) {
    console.error("[MAIL-ERROR]", error?.message || error);
    return { delivered: false, reason: "smtp_send_failed", error: error?.message || "smtp_send_failed" };
  }
};

exports.isEmailConfigured = isEmailConfigured;
