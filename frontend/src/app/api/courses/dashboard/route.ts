import { NextResponse } from 'next/server';
import { SUBJECTS } from '../../../../lib/mock-data';

export async function GET() {
    // In standalone mode, we show all subjects in the dashboard as well
    return NextResponse.json({ subjects: SUBJECTS });
}
