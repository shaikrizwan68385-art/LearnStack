import { NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export async function GET(request: Request) {
    try {
        const user = getUserFromRequest(request);

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const [usersCount, subjectsCount, enrollmentsCount] = await Promise.all([
            executeQuery('SELECT COUNT(*) as count FROM users'),
            executeQuery('SELECT COUNT(*) as count FROM subjects'),
            executeQuery('SELECT COUNT(*) as count FROM enrollments')
        ]);

        return NextResponse.json({
            users: usersCount[0].count,
            subjects: subjectsCount[0].count,
            enrollments: enrollmentsCount[0].count
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ message: 'Error fetching admin stats', error: String(error) }, { status: 500 });
    }
}
