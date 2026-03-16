import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';
import { getUserFromRequest } from '../../../../lib/auth';

export async function POST(request: Request) {
    try {
        const user = getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { subjectId, title, orderIndex } = await request.json();
        const result = await executeQuery('INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)', [subjectId, title, orderIndex || 0]);

        return NextResponse.json({ message: 'Section created', id: result.insertId });
    } catch (error) {
        console.error('Error creating section:', error);
        return NextResponse.json({ message: 'Error creating section', error: String(error) }, { status: 500 });
    }
}
