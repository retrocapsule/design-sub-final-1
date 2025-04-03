import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

// For development purposes, log the email instead of sending it
const devTransporter = {
  sendMail: async (options: any) => {
    console.log('=========== EMAIL ===========');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Content:', options.html);
    console.log('=============================');
    return { messageId: 'dev-message-id' };
  }
};

// Create a transporter
const getTransporter = () => {
  // In production, use actual email service
  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_SERVER) {
    return nodemailer.createTransport(process.env.EMAIL_SERVER);
  }

  // In development, just log the email
  return devTransporter;
};

export const sendEmail = async ({ to, subject, html }: EmailPayload) => {
  const transporter = getTransporter();

  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@designrequests.com',
      to,
      subject,
      html,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}; 