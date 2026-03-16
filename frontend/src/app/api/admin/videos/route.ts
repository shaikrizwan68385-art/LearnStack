import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';
import { getUserFromRequest } from '../../../../lib/auth';

export async function POST(request: Request) {
    try {
        const user = getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { sectionId, title, videoUrl, duration, orderIndex } = await request.json();
        const result = await executeQuery('INSERT INTO videos (section_id, title, video_url, duration, order_index) VALUES (?, ?, ?, ?, ?)', [sectionId, title, videoUrl, duration || 0, orderIndex || 0]);

        return NextResponse.json({ message: 'Video created', id: result.insertId });
    } catch (error) {
        console.error('Error creating video:', error);
        return NextResponse.json({ message: 'Error creating video', error: String(error) }, { status: 500 });
    }
}
