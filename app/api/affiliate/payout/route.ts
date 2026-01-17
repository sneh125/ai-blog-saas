import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';

// Manual payout trigger (for testing)
export async function POST(request: NextRequest) {
  try {
    const { affiliateId, amount } = await request.json();

    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Get affiliate data
    const affiliateDoc = await getDocs(
      query(collection(db, 'affiliates'), where('id', '==', affiliateId))
    );

    if (affiliateDoc.empty) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    const affiliate = affiliateDoc.docs[0].data();
    
    if (!affiliate.stripeAccountId) {
      return NextResponse.json(
        { error: 'Affiliate has not completed Stripe onboarding' },
        { status: 400 }
      );
    }

    // Create transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: affiliate.stripeAccountId,
      description: `Affiliate commission payout for ${affiliate.email}`,
    });

    // Record payout in database
    await addDoc(collection(db, 'affiliatePayouts'), {
      affiliateId,
      stripeTransferId: transfer.id,
      amount,
      currency: 'usd',
      status: 'completed',
      createdAt: serverTimestamp(),
    });

    // Update affiliate earnings
    await updateDoc(doc(db, 'affiliates', affiliateId), {
      totalPaidOut: (affiliate.totalPaidOut || 0) + amount,
      lastPayoutAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      transfer: {
        id: transfer.id,
        amount: transfer.amount / 100,
        status: transfer.status,
      },
    });

  } catch (error: any) {
    console.error('Payout error:', error);
    return NextResponse.json(
      { error: 'Payout failed: ' + error.message },
      { status: 500 }
    );
  }
}

// Auto payout function (called by webhook or cron)
export async function processMonthlyPayouts() {
  try {
    if (!stripe) {
      console.error('Stripe not configured');
      return;
    }

    // Get all affiliates with earnings >= minimum payout
    const affiliatesQuery = query(
      collection(db, 'affiliates'),
      where('totalEarnings', '>=', 50) // $50 minimum
    );

    const affiliatesSnapshot = await getDocs(affiliatesQuery);

    for (const affiliateDoc of affiliatesSnapshot.docs) {
      const affiliate = affiliateDoc.data();
      const affiliateId = affiliateDoc.id;

      // Skip if no Stripe account or already paid this month
      if (!affiliate.stripeAccountId || affiliate.lastPayoutAt) {
        const lastPayout = affiliate.lastPayoutAt?.toDate();
        const thisMonth = new Date();
        thisMonth.setDate(1);
        
        if (lastPayout && lastPayout >= thisMonth) {
          continue; // Already paid this month
        }
      }

      try {
        // Calculate unpaid earnings
        const unpaidEarnings = affiliate.totalEarnings - (affiliate.totalPaidOut || 0);
        
        if (unpaidEarnings >= 50) { // $50 minimum
          // Create transfer
          const transfer = await stripe.transfers.create({
            amount: Math.round(unpaidEarnings * 100),
            currency: 'usd',
            destination: affiliate.stripeAccountId,
            description: `Monthly affiliate commission for ${affiliate.email}`,
          });

          // Record payout
          await addDoc(collection(db, 'affiliatePayouts'), {
            affiliateId,
            stripeTransferId: transfer.id,
            amount: unpaidEarnings,
            currency: 'usd',
            status: 'completed',
            type: 'monthly_auto',
            createdAt: serverTimestamp(),
          });

          // Update affiliate
          await updateDoc(doc(db, 'affiliates', affiliateId), {
            totalPaidOut: (affiliate.totalPaidOut || 0) + unpaidEarnings,
            lastPayoutAt: serverTimestamp(),
          });

          console.log(`Paid $${unpaidEarnings} to ${affiliate.email}`);
        }
      } catch (error) {
        console.error(`Failed to pay affiliate ${affiliate.email}:`, error);
      }
    }

  } catch (error) {
    console.error('Auto payout process failed:', error);
  }
}