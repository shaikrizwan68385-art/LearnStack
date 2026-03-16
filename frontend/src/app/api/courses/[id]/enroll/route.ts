import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../../lib/db';
import { getUserFromRequest } from '../../../../../lib/auth';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const subjectId = params.id;
        const user = getUserFromRequest(request);

        if (!user) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const userId = user.id;
        await executeQuery('INSERT IGNORE INTO enrollments (user_id, subject_id) VALUES (?, ?)', [userId, subjectId]);

        return NextResponse.json({ message: 'Enrolled successfully' });
    } catch (error) {
        console.error('Error enrolling:', error);
        return NextResponse.json({ message: 'Error enrolling', error: String(error) }, { status: 500 });
    }
}
