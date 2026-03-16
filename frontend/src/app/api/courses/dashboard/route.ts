import { NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export async function GET(request: Request) {
    try {
        const user = getUserFromRequest(request);

        if (!user) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const userId = user.id;
        const subjects = await executeQuery(`
            SELECT s.* FROM subjects s 
            JOIN enrollments e ON s.id = e.subject_id 
            WHERE e.user_id = ?
        `, [userId]);

        return NextResponse.json({ subjects });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        return NextResponse.json({ message: 'Error fetching dashboard', error: String(error) }, { status: 500 });
    }
}
