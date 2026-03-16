import { NextResponse } from 'next/server';
import { executeQuery } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export async function POST(request: Request) {
    try {
        const { videoId, progressSeconds, isCompleted } = await request.json();
        const user = getUserFromRequest(request);

        if (!user) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const userId = user.id;
        const completedVal = isCompleted ? 1 : 0;

        const existing = await executeQuery('SELECT id FROM video_progress WHERE user_id = ? AND video_id = ?', [userId, videoId]);

        if (existing.length > 0) {
            await executeQuery(
                'UPDATE video_progress SET progress_seconds = ?, is_completed = GREATEST(is_completed, ?) WHERE user_id = ? AND video_id = ?',
                [progressSeconds, completedVal, userId, videoId]
            );
        } else {
            await executeQuery(
                'INSERT INTO video_progress (user_id, video_id, progress_seconds, is_completed) VALUES (?, ?, ?, ?)',
                [userId, videoId, progressSeconds, completedVal]
            );
        }

        return NextResponse.json({ message: 'Progress saved' });
    } catch (error) {
        console.error('Error saving progress:', error);
        return NextResponse.json({ message: 'Error saving progress', error: String(error) }, { status: 500 });
    }
}
