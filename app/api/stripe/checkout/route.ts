import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS } from '@/lib/stripe';
import { getStoredAffiliateCode } from '@/lib/affiliate';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId, planType, referralCode } = await request.json();

    if (!userId || !planType) {
      return NextResponse.json(
        { error: 'UserId and planType are required' },
        { status: 400 }
      );
    }

    // Validate plan type
    if (!PLANS[planType as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    const plan = PLANS[planType as keyof typeof PLANS];

    // Free plan doesn't need Stripe checkout
    if (planType === 'FREE') {
      return NextResponse.json(
        { error: 'Free plan does not require checkout' },
        { status: 400 }
      );
    }

    // Check if plan has priceId
    if (!plan.priceId) {
      return NextResponse.json(
        { error: 'Plan price ID not configured' },
        { status: 400 }
      );
    }

    // Check if stripe is available
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Get user data
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const userEmail = userData.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        planType,
        userEmail,
        planName: plan.name,
        blogCredits: plan.blogCredits.toString(),
        referralCode: referralCode || '',
      },
      subscription_data: {
        metadata: {
          userId,
          planType,
          userEmail,
          planName: plan.name,
          blogCredits: plan.blogCredits.toString(),
          referralCode: referralCode || '',
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    // Log the checkout attempt
    console.log('Stripe checkout session created:', {
      sessionId: session.id,
      userId,
      userEmail,
      planType,
      amount: plan.price,
      referralCode: referralCode || 'none',
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}