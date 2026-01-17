import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: {
    subject: '🎉 Welcome to BlogAI - Your AI Blog Generator!',
    getHtml: (userName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">BlogAI</h1>
          <p style="color: #6B7280; margin: 5px 0;">AI-Powered Blog Generator</p>
        </div>
        
        <h2 style="color: #1F2937;">Welcome, ${userName}! 🚀</h2>
        
        <p style="color: #4B5563; line-height: 1.6;">
          Thank you for joining BlogAI! You're now ready to create amazing, SEO-optimized blog posts with the power of AI.
        </p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1F2937; margin-top: 0;">🎁 Your Free Plan Includes:</h3>
          <ul style="color: #4B5563; margin: 0; padding-left: 20px;">
            <li>3 blog posts per month</li>
            <li>Basic SEO optimization</li>
            <li>Email support</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" 
             style="background: linear-gradient(to right, #3B82F6, #8B5CF6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Start Creating Blogs →
          </a>
        </div>
        
        <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px;">
          Need help? Reply to this email or visit our support center.
        </p>
      </div>
    `,
  },
  
  BLOG_GENERATED: {
    subject: '✨ Your Blog Post is Ready!',
    getHtml: (userName: string, blogTitle: string, wordCount: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">BlogAI</h1>
        </div>
        
        <h2 style="color: #1F2937;">Great news, ${userName}! 🎉</h2>
        
        <p style="color: #4B5563; line-height: 1.6;">
          Your blog post "<strong>${blogTitle}</strong>" has been successfully generated!
        </p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1F2937; margin-top: 0;">📊 Blog Details:</h3>
          <ul style="color: #4B5563; margin: 0; padding-left: 20px;">
            <li><strong>Title:</strong> ${blogTitle}</li>
            <li><strong>Word Count:</strong> ${wordCount} words</li>
            <li><strong>Status:</strong> Ready to publish</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" 
             style="background: linear-gradient(to right, #3B82F6, #8B5CF6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Your Blog →
          </a>
        </div>
      </div>
    `,
  },
  
  PAYMENT_SUCCESS: {
    subject: '🎊 Payment Successful - Welcome to Premium!',
    getHtml: (userName: string, planName: string, amount: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">BlogAI</h1>
        </div>
        
        <h2 style="color: #1F2937;">Payment Successful! 🎊</h2>
        
        <p style="color: #4B5563; line-height: 1.6;">
          Hi ${userName}, your payment has been processed successfully. Welcome to the ${planName} plan!
        </p>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1F2937; margin-top: 0;">💳 Payment Details:</h3>
          <ul style="color: #4B5563; margin: 0; padding-left: 20px;">
            <li><strong>Plan:</strong> ${planName}</li>
            <li><strong>Amount:</strong> $${amount}</li>
            <li><strong>Status:</strong> Active</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_URL}/dashboard" 
             style="background: linear-gradient(to right, #3B82F6, #8B5CF6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Access Premium Features →
          </a>
        </div>
      </div>
    `,
  },
  
  CREDITS_LOW: {
    subject: '⚠️ Blog Credits Running Low',
    getHtml: (userName: string, creditsLeft: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">BlogAI</h1>
        </div>
        
        <h2 style="color: #1F2937;">Credits Running Low ⚠️</h2>
        
        <p style="color: #4B5563; line-height: 1.6;">
          Hi ${userName}, you have only ${creditsLeft} blog credits remaining this month.
        </p>
        
        <p style="color: #4B5563; line-height: 1.6;">
          Don't let your content creation stop! Upgrade to a premium plan for more credits and advanced features.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_URL}/pricing" 
             style="background: linear-gradient(to right, #3B82F6, #8B5CF6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Upgrade Now →
          </a>
        </div>
      </div>
    `,
  },
  
  ADMIN_BLOG_NOTIFICATION: {
    subject: '📝 New Blog Generated - BlogAI Admin Alert',
    getHtml: (userEmail: string, keyword: string, wordCount: number, userPlan: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">BlogAI Admin Alert</h1>
        </div>
        
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1F2937; margin-top: 0;">📝 New Blog Generated</h2>
          <ul style="color: #4B5563; margin: 0; padding-left: 20px;">
            <li><strong>User:</strong> ${userEmail}</li>
            <li><strong>Keyword:</strong> "${keyword}"</li>
            <li><strong>Word Count:</strong> ${wordCount} words</li>
            <li><strong>Plan:</strong> ${userPlan}</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_URL}/admin" 
             style="background: linear-gradient(to right, #3B82F6, #8B5CF6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Admin Dashboard →
          </a>
        </div>
      </div>
    `,
  },
  
  ADMIN_PAYMENT_NOTIFICATION: {
    subject: '💰 Payment Received - BlogAI Admin Alert',
    getHtml: (userEmail: string, planType: string, amount: number) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">BlogAI Admin Alert</h1>
        </div>
        
        <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #BBF7D0;">
          <h2 style="color: #166534; margin-top: 0;">💰 Payment Received!</h2>
          <ul style="color: #166534; margin: 0; padding-left: 20px;">
            <li><strong>Customer:</strong> ${userEmail}</li>
            <li><strong>Plan:</strong> ${planType}</li>
            <li><strong>Amount:</strong> $${amount}</li>
            <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_URL}/admin" 
             style="background: linear-gradient(to right, #059669, #10B981); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            View Admin Dashboard →
          </a>
        </div>
      </div>
    `,
  },
};

// Send email function
export async function sendEmail(
  to: string,
  template: keyof typeof EMAIL_TEMPLATES,
  data: any
) {
  try {
    const emailTemplate = EMAIL_TEMPLATES[template];
    let htmlContent = '';
    
    // Handle different template types
    switch (template) {
      case 'WELCOME':
        htmlContent = emailTemplate.getHtml(data.userName);
        break;
      case 'BLOG_GENERATED':
        htmlContent = emailTemplate.getHtml(data.userName, data.blogTitle, data.wordCount);
        break;
      case 'PAYMENT_SUCCESS':
        htmlContent = emailTemplate.getHtml(data.userName, data.planName, data.amount);
        break;
      case 'CREDITS_LOW':
        htmlContent = emailTemplate.getHtml(data.userName, data.creditsLeft);
        break;
      default:
        htmlContent = emailTemplate.getHtml(data.userName);
    }
    
    const mailOptions = {
      from: `"BlogAI" <${process.env.SMTP_USER}>`,
      to,
      subject: emailTemplate.subject,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Bulk email function for admin
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  htmlContent: string
) {
  try {
    const promises = recipients.map(email => 
      transporter.sendMail({
        from: `"BlogAI" <${process.env.SMTP_USER}>`,
        to: email,
        subject,
        html: htmlContent,
      })
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return { successful, failed, total: recipients.length };
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    return { successful: 0, failed: recipients.length, total: recipients.length };
  }
}