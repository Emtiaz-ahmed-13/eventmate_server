import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"EventMate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your EventMate account",
    html: `
      <h2>Welcome to EventMate!</h2>
      <p>Click below to verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link expires in <b>24 hours</b>.</p>
    `,
  });
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"EventMate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your EventMate password",
    html: `
      <h2>Password Reset Request</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in <b>1 hour</b>.</p>
       
    `,
  });
};

export const sendEventCancellationEmail = async (
  email: string,
  eventName: string,
) => {
  await transporter.sendMail({
    from: `"EventMate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Event Cancelled: ${eventName}`,
    html: `
      <h2>Event Cancelled</h2>
      <p>We're sorry! The event <b>${eventName}</b> has been cancelled by the host.</p>
      <p>We hope to see you at other events soon!</p>
    `,
  });
};
export const sendWaitlistPromotionEmail = async (
  email: string,
  eventName: string,
) => {
  await transporter.sendMail({
    from: `"EventMate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `You're in! ${eventName}`,
    html: `
      <h2>Great news! 🎉</h2>
      <p>A spot opened up and you've been automatically added to <b>${eventName}</b>!</p>
      <p>See you there!</p>
    `,
  });
};

export const sendEventReminderEmail = async (
  email: string,
  eventName: string,
  eventDate: Date,
  location: string
) => {
  await transporter.sendMail({
    from: `"EventMate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Reminder: ${eventName} is tomorrow!`,
    html: `
      <h2>Event Reminder! 🎉</h2>
      <p>Just a reminder that <b>${eventName}</b> is tomorrow!</p>
      <p>📅 Date: <b>${new Date(eventDate).toLocaleDateString()}</b></p>
      <p>📍 Location: <b>${location}</b></p>
      <p>See you there!</p>
    `,
  });
};

export const sendApprovalEmail = async (
  email: string,
  eventName: string
) => {
  await transporter.sendMail({
    from: `"EventMate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `You're approved! ${eventName}`,
    html: `
      <h2>Great news! 🎉</h2>
      <p>Your request to join <b>${eventName}</b> has been approved!</p>
      <p>See you there!</p>
    `,
  });
};

export const sendRejectionEmail = async (
  email: string,
  eventName: string
) => {
  await transporter.sendMail({
    from: `"EventMate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Update on your request: ${eventName}`,
    html: `
      <h2>Sorry!</h2>
      <p>Your request to join <b>${eventName}</b> has been rejected by the host.</p>
      <p>Check out other events on EventMate!</p>
    `,
  });
};