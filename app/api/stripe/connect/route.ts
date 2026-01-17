import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { affiliateId, userId } = await request.json();

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Get affiliate data
    const affiliateDoc = await getDoc(doc(db, 'affiliates', affiliateId));
    if (!affiliateDoc.exists()) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    const affiliateData = affiliateDoc.data();

    // Create Stripe Express account if not exists
    let stripeAccountId = affiliateData.stripeAccountId;
    
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', // Change based on your target market
        email: affiliateData.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      // Save Stripe account ID to Firestore
      await updateDoc(doc(db, 'affiliates', affiliateId), {
        stripeAccountId: stripeAccountId,
        updatedAt: new Date(),
      });
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_URL}/affiliate?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_URL}/affiliate?success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      success: true,
      accountLink: accountLink.url,
      stripeAccountId,
    });

  } catch (error: any) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: 'Failed to setup Stripe Connect: ' + error.message },
      { status: 500 }
    );
  }
}

// Get account status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stripeAccountId = searchParams.get('accountId');

    if (!stripe || !stripeAccountId) {
      return NextResponse.json(
        { error: 'Missing parameters' },
        { status: 400 }
      );
    }

    const account = await stripe.accounts.retrieve(stripeAccountId);

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements,
      },
    });

  } catch (error: any) {
    console.error('Error retrieving account:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve account: ' + error.message },
      { status: 500 }
    );
  }
}