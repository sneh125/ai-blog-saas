import { NextRequest, NextResponse } from 'next/server';
import { getAgencyByDomain, getAgencyBranding } from '@/lib/agency';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    console.log('Fetching agency config for domain:', domain);

    const agency = await getAgencyByDomain(domain);
    
    if (!agency) {
      return NextResponse.json(
        { error: 'Agency not found' },
        { status: 404 }
      );
    }

    const branding = getAgencyBranding(agency);

    return NextResponse.json({
      success: true,
      agency: {
        id: agency.id,
        name: agency.name,
        plan: agency.plan,
        isActive: agency.isActive,
      },
      branding,
    });

  } catch (error: any) {
    console.error('Error fetching agency config:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch agency configuration' },
      { status: 500 }
    );
  }
}