import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_EVENTS } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { resetMonthlyUsage } from '@/lib/usage-limits';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('Stripe webhook received:', event.type);

    switch (event.type) {
      case STRIPE_WEBHOOK_EVENTS.CHECKOUT_COMPLETED:
        await handleCheckoutCompleted(event.data.object as any);
        break;

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object as any);
        break;

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object as any);
        break;

      case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object as any);
        break;

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAID:
        await handleInvoicePaid(event.data.object as any);
        break;

      case STRIPE_WEBHOOK_EVENTS.INVOICE_FAILED:
        await handleInvoiceFailed(event.data.object as any);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  console.log('Processing checkout completed:', session.id);

  const { userId, planType, userEmail } = session.metadata;

  if (!userId || !planType) {
    console.error('Missing metadata in checkout session');
    return;
  }

  try {
    // Update user with subscription info
    const userRef = doc(db, 'users', userId);
    
    // Calculate billing cycle end (30 days from now)
    const billingCycleEnd = new Date();
    billingCycleEnd.setDate(billingCycleEnd.getDate() + 30);

    await updateDoc(userRef, {
      plan: planType,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      blogCredits: 0, // Reset credits on plan change
      wordsUsed: 0, // Reset words on plan change
      billingCycleEnd: billingCycleEnd,
      updatedAt: new Date(),
    });

    console.log(`User ${userId} upgraded to ${planType}`);

  } catch (error) {
    console.error('Error updating user after checkout:', error);
  }
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('Processing subscription created:', subscription.id);
  
  const { userId } = subscription.metadata;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // Additional subscription setup if needed
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Processing subscription updated:', subscription.id);
  
  const { userId, planType } = subscription.metadata;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      plan: planType || 'FREE',
      stripeSubscriptionStatus: subscription.status,
      updatedAt: new Date(),
    });

    console.log(`Subscription updated for user ${userId}`);

  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log('Processing subscription deleted:', subscription.id);
  
  const { userId } = subscription.metadata;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      plan: 'FREE',
      stripeSubscriptionId: null,
      stripeSubscriptionStatus: 'canceled',
      updatedAt: new Date(),
    });

    console.log(`User ${userId} downgraded to FREE plan`);

  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handleInvoicePaid(invoice: any) {
  console.log('Processing invoice paid:', invoice.id);
  
  // Reset monthly usage on successful payment
  if (invoice.subscription) {
    try {
      // Find user by subscription ID
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeSubscriptionId', '==', invoice.subscription)
      );
      
      const userDocs = await getDocs(usersQuery);
      
      if (!userDocs.empty) {
        const userDoc = userDocs.docs[0];
        const userId = userDoc.id;
        
        // Reset monthly usage
        await resetMonthlyUsage(userId);
        
        console.log(`Monthly usage reset for user ${userId}`);
      }
      
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
    }
  }
}

async function handleInvoiceFailed(invoice: any) {
  console.log('Processing invoice failed:', invoice.id);
  
  // Handle failed payment - could send notification, pause service, etc.
  if (invoice.subscription) {
    try {
      // Find user by subscription ID
      const usersQuery = query(
        collection(db, 'users'),
        where('stripeSubscriptionId', '==', invoice.subscription)
      );
      
      const userDocs = await getDocs(usersQuery);
      
      if (!userDocs.empty) {
        const userDoc = userDocs.docs[0];
        const userId = userDoc.id;
        
        // Mark payment as failed
        await updateDoc(doc(db, 'users', userId), {
          paymentStatus: 'failed',
          updatedAt: new Date(),
        });
        
        console.log(`Payment failed for user ${userId}`);
      }
      
    } catch (error) {
      console.error('Error handling failed payment:', error);
    }
  }
}