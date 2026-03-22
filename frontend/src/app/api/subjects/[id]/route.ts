import { NextResponse } from 'next/server';
import { SUBJECTS, SECTIONS, VIDEOS } from '../../../lib/mock-data';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = await params;
    const subjectId = parseInt(id);

    const subject = SUBJECTS.find(s => s.id === subjectId);
    if (!subject) {
        return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
    }

    const subjectSections = SECTIONS.filter(s => s.subject_id === subjectId);
    const formattedSections = subjectSections.map(section => ({
        ...section,
        videos: VIDEOS.filter(v => v.section_id === section.id)
    }));

    return NextResponse.json({
        ...subject,
        sections: formattedSections,
        isEnrolled: true // Always enrolled in standalone demo
    });
}
