import { NextResponse } from 'next/server';
import { executeQuery } from '../../../../lib/db';
import { getUserFromRequest } from '../../../../lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const subjectId = params.id;
        const user = getUserFromRequest(request);
        const userId = user?.id || null;

        let isEnrolled = false;
        if (userId) {
            const enrollment = await executeQuery('SELECT * FROM enrollments WHERE user_id = ? AND subject_id = ?', [userId, subjectId]);
            isEnrolled = enrollment.length > 0;
        }

        const subjects = await executeQuery('SELECT * FROM subjects WHERE id = ?', [subjectId]);
        if (subjects.length === 0) {
            return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
        }
        const subject = subjects[0];

        const sections = await executeQuery('SELECT * FROM sections WHERE subject_id = ? ORDER BY order_index ASC', [subjectId]);

        const videos = await executeQuery(`
            SELECT v.*, vp.progress_seconds, vp.is_completed 
            FROM videos v 
            LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
            WHERE v.section_id IN (SELECT id FROM sections WHERE subject_id = ?)
            ORDER BY v.order_index ASC
        `, [userId, subjectId]);

        const formattedSections = sections.map((section: any) => ({
            ...section,
            videos: videos.filter((video: any) => video.section_id === section.id)
        }));

        subject.sections = formattedSections;
        subject.isEnrolled = isEnrolled;

        return NextResponse.json(subject);
    } catch (error) {
        console.error('Error fetching course details:', error);
        return NextResponse.json({ message: 'Error fetching course details', error: String(error) }, { status: 500 });
    }
}
