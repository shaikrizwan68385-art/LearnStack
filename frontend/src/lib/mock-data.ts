export const MOCK_USER = {
    id: 1,
    name: 'Quest Student',
    email: 'admin@lms.com',
    role: 'STUDENT'
};

export const SUBJECTS = [
    {
        id: 1,
        title: 'Full-Stack Web Development',
        description: 'Learn Next.js and Node.js with modern best practices.',
        order_index: 1,
        category: 'Software Development'
    },
    {
        id: 2,
        title: 'Data Science with Python',
        description: 'Learn Pandas, NumPy, and Machine Learning from scratch.',
        order_index: 2,
        category: 'Data Science'
    },
    {
        id: 3,
        title: 'Java Full Stack Development',
        description: 'Master Core Java, Spring Boot, and Frontend Integration.',
        order_index: 3,
        category: 'Software Development'
    }
];

export const SECTIONS = [
    { id: 1, subject_id: 1, title: 'Introduction to React & Next.js', order_index: 1 },
    { id: 2, subject_id: 1, title: 'Advanced Next.js Concepts', order_index: 2 },
    { id: 3, subject_id: 2, title: 'Python Basics', order_index: 1 },
    { id: 4, subject_id: 2, title: 'Advanced Python & Automation', order_index: 2 },
    { id: 5, subject_id: 3, title: 'Core Java Fundamentals', order_index: 1 },
    { id: 6, subject_id: 3, title: 'Backend Development with Spring', order_index: 2 }
];

export const VIDEOS = [
    { id: 1, section_id: 1, title: 'What is Next.js?', video_url: 'https://www.youtube.com/watch?v=Sklc_fQBmcs', duration: 600, order_index: 1 },
    { id: 2, section_id: 1, title: 'Routing in Next.js', video_url: 'https://www.youtube.com/watch?v=wm5gMKuwSYk', duration: 800, order_index: 2 },
    { id: 3, section_id: 2, title: 'Server Actions', video_url: 'https://www.youtube.com/watch?v=dDpZfOQBMaU', duration: 1200, order_index: 1 },
    { id: 4, section_id: 3, title: 'Python Hello World', video_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration: 400, order_index: 1 },
    { id: 5, section_id: 3, title: 'Python OOP', video_url: 'https://www.youtube.com/watch?v=JeznW_7DlB0', duration: 1200, order_index: 2 },
    { id: 6, section_id: 4, title: 'Data Analysis with Pandas', video_url: 'https://www.youtube.com/watch?v=vmEHCJofslg', duration: 900, order_index: 1 },
    { id: 7, section_id: 5, title: 'Java Syntax & OOPs', video_url: 'https://www.youtube.com/watch?v=BGTx91t8q50', duration: 700, order_index: 1 },
    { id: 8, section_id: 6, title: 'Spring Boot REST API', video_url: 'https://www.youtube.com/watch?v=9SGDpanrc8U', duration: 1200, order_index: 1 }
];
