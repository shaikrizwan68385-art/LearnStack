import { Response } from 'express';
import { executeQuery } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const getSubjects = async (req: AuthRequest, res: Response) => {
    try {
        const subjects = await executeQuery('SELECT * FROM subjects ORDER BY order_index ASC');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subjects', error: String(error) });
    }
};

export const getSubjectDetails = async (req: AuthRequest, res: Response) => {
    try {
        const subjectId = req.params.id;
        const userId = req.user?.id || null;

        let isEnrolled = false;
        if (userId) {
            const enrollment = await executeQuery('SELECT * FROM enrollments WHERE user_id = ? AND subject_id = ?', [userId, subjectId]);
            isEnrolled = enrollment.length > 0;
        }

        const subjects = await executeQuery('SELECT * FROM subjects WHERE id = ?', [subjectId]);
        if (subjects.length === 0) return res.status(404).json({ message: 'Subject not found' });
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
        res.json(subject);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subject details', error: String(error) });
    }
};

export const enrollSubject = async (req: AuthRequest, res: Response) => {
    try {
        const subjectId = req.params.id;
        const userId = req.user!.id;
        await executeQuery('INSERT INTO enrollments (user_id, subject_id) VALUES (?, ?) ON CONFLICT(user_id, subject_id) DO NOTHING', [userId, subjectId]);
        res.json({ message: 'Enrolled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling', error: String(error) });
    }
};

export const getDashboardInfo = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const subjects = await executeQuery(`
      SELECT s.* FROM subjects s 
      JOIN enrollments e ON s.id = e.subject_id 
      WHERE e.user_id = ?
    `, [userId]);
        res.json({ subjects });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard', error: String(error) });
    }
};
