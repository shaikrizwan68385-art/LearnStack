import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';
import { getUserFromRequest } from '../../../../lib/auth';

export async function POST(request: Request) {
    try {
        const user = getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { title, description, orderIndex } = await request.json();
        const result = await executeQuery('INSERT INTO subjects (title, description, order_index) VALUES (?, ?, ?)', [title, description, orderIndex || 0]);

        return NextResponse.json({ message: 'Subject created', id: result.insertId });
    } catch (error) {
        console.error('Error creating subject:', error);
        return NextResponse.json({ message: 'Error creating subject', error: String(error) }, { status: 500 });
    }
}
