import { NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/db';

export async function GET() {
    try {
        const subjects = await executeQuery('SELECT * FROM subjects ORDER BY order_index ASC');
        return NextResponse.json(subjects);
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json({ message: 'Error fetching courses', error: String(error) }, { status: 500 });
    }
}
