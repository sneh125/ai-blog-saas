import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { sendEmail } from './email';

export interface AdminNotification {
  id: string;
  type: 'blog_generated' | 'user_registered' | 'payment_received' | 'upgrade_plan';
  title: string;
  message: string;
  userId: string;
  userEmail: string;
  metadata: any;
  read: boolean;
  createdAt: any;
}

// Send notification to admin when user generates blog
export async function notifyAdminBlogGenerated(
  userId: string,
  userEmail: string,
  keyword: string,
  wordCount: number,
  userPlan: string
) {
  try {
    const notification = {
      type: 'blog_generated',
      title: '📝 New Blog Generated',
      message: `${userEmail} generated a blog about "${keyword}" (${wordCount} words) on ${userPlan} plan`,
      userId,
      userEmail,
      metadata: {
        keyword,
        wordCount,
        userPlan,
        timestamp: new Date().toISOString()
      },
      read: false,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'adminNotifications'), notification);
    
    // Send email to admin
    if (process.env.SMTP_USER) {
      await sendEmail(process.env.ADMIN_EMAIL || 'snehprajapati36@gmail.com', 'ADMIN_BLOG_NOTIFICATION', {
        userEmail,
        keyword,
        wordCount,
        userPlan
      });
    }

    console.log('Admin notification sent for blog generation');
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

// Send notification when user registers
export async function notifyAdminUserRegistered(userId: string, userEmail: string) {
  try {
    const notification = {
      type: 'user_registered',
      title: '👤 New User Registered',
      message: `${userEmail} just signed up for BlogAI`,
      userId,
      userEmail,
      metadata: {
        registrationDate: new Date().toISOString()
      },
      read: false,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'adminNotifications'), notification);
    console.log('Admin notification sent for user registration');
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

// Send notification when payment is received
export async function notifyAdminPaymentReceived(
  userId: string,
  userEmail: string,
  planType: string,
  amount: number
) {
  try {
    const notification = {
      type: 'payment_received',
      title: '💰 Payment Received',
      message: `${userEmail} upgraded to ${planType} plan ($${amount})`,
      userId,
      userEmail,
      metadata: {
        planType,
        amount,
        paymentDate: new Date().toISOString()
      },
      read: false,
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'adminNotifications'), notification);
    
    // Send email to admin
    if (process.env.SMTP_USER) {
      await sendEmail(process.env.ADMIN_EMAIL || 'snehprajapati36@gmail.com', 'ADMIN_PAYMENT_NOTIFICATION', {
        userEmail,
        planType,
        amount
      });
    }

    console.log('Admin notification sent for payment');
  } catch (error) {
    console.error('Error sending admin notification:', error);
  }
}

// Get recent admin notifications
export async function getAdminNotifications(limitCount = 50) {
  try {
    const q = query(
      collection(db, 'adminNotifications'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AdminNotification[];
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return [];
  }
}

// Get unread notification count
export async function getUnreadNotificationCount() {
  try {
    const q = query(
      collection(db, 'adminNotifications'),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}