import { config } from 'dotenv';
import nodemailer from 'nodemailer';

config();

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
      this.isConfigured = true;
    } else {
      console.warn(
        'Email service not configured. Please set SMTP environment variables.'
      );
    }
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.error('Email service not configured');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    userName: string
  ): Promise<boolean> {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const template: EmailTemplate = {
      subject: 'Verify Your YUTHUB Account',
      text: `Hello ${userName},\n\nPlease verify your email address by clicking the following link:\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nYUTHUB Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to YUTHUB!</h2>
          <p>Hello ${userName},</p>
          <p>Thank you for registering with YUTHUB. Please verify your email address to complete your account setup.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours. If you didn't create this account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">YUTHUB Housing Platform</p>
        </div>
      `,
    };

    return this.sendEmail(email, template);
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    userName: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const template: EmailTemplate = {
      subject: 'Reset Your YUTHUB Password',
      text: `Hello ${userName},\n\nYou requested a password reset for your YUTHUB account. Click the following link to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nYUTHUB Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>You requested a password reset for your YUTHUB account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">YUTHUB Housing Platform</p>
        </div>
      `,
    };

    return this.sendEmail(email, template);
  }

  async sendWelcomeEmail(
    email: string,
    userName: string,
    organizationName?: string
  ): Promise<boolean> {
    const dashboardUrl = `${process.env.CLIENT_URL}/dashboard`;

    const template: EmailTemplate = {
      subject: 'Welcome to YUTHUB - Your Housing Platform Journey Begins!',
      text: `Welcome ${userName}!\n\nYour YUTHUB account has been successfully created${organizationName ? ` for ${organizationName}` : ''}.\n\nGet started by visiting your dashboard: ${dashboardUrl}\n\nWhat you can do next:\n- Complete your profile setup\n- Explore available housing options\n- Connect with your community\n\nNeed help? Contact our support team.\n\nBest regards,\nYUTHUB Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #007bff; text-align: center;">Welcome to YUTHUB!</h1>
          <p>Hello ${userName},</p>
          <p>Congratulations! Your YUTHUB account has been successfully created${organizationName ? ` for <strong>${organizationName}</strong>` : ''}.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666;">
              <li>Complete your profile setup</li>
              <li>Explore available housing options</li>
              <li>Connect with your community</li>
              <li>Set up your preferences</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
          </div>

          <p style="color: #666;">Need help getting started? Our support team is here to assist you every step of the way.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">YUTHUB Housing Platform - Connecting Communities</p>
        </div>
      `,
    };

    return this.sendEmail(email, template);
  }

  async sendOrganizationInvitation(
    email: string,
    organizationName: string,
    inviterName: string,
    inviteToken: string
  ): Promise<boolean> {
    const inviteUrl = `${process.env.CLIENT_URL}/accept-invitation?token=${inviteToken}`;

    const template: EmailTemplate = {
      subject: `Invitation to Join ${organizationName} on YUTHUB`,
      text: `Hello,\n\n${inviterName} has invited you to join ${organizationName} on the YUTHUB platform.\n\nAccept your invitation: ${inviteUrl}\n\nThis invitation will expire in 7 days.\n\nBest regards,\nYUTHUB Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You're Invited!</h2>
          <p>Hello,</p>
          <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on the YUTHUB platform.</p>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <h3 style="color: #1976d2; margin-top: 0;">Organization: ${organizationName}</h3>
            <p style="color: #666; margin-bottom: 0;">Join your team and start collaborating on housing solutions.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="background-color: #2196f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Accept Invitation</a>
          </div>

          <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days. If you don't want to join this organization, you can safely ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">YUTHUB Housing Platform</p>
        </div>
      `,
    };

    return this.sendEmail(email, template);
  }
}

export const emailService = new EmailService();
