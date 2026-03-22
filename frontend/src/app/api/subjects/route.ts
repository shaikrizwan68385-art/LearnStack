import { NextResponse } from 'next/server';
import { SUBJECTS } from '../../../lib/mock-data';

export async function GET() {
    return NextResponse.json(SUBJECTS);
}
