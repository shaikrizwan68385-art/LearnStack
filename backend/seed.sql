-- USE lms_db; -- Not needed for SQLite

INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES 
(1, 'Admin User', 'admin@lms.com', '$2a$10$wT2HlD0R9GIt2fKkVt9Y4e1h5eG38/N7hL/QOa0LgIfQ0S9s9/4wW', 'ADMIN'), -- password: password
(2, 'Student User', 'student@lms.com', '$2a$10$wT2HlD0R9GIt2fKkVt9Y4e1h5eG38/N7hL/QOa0LgIfQ0S9s9/4wW', 'STUDENT');

INSERT OR IGNORE INTO subjects (id, title, description, order_index) VALUES 
(1, 'Full-Stack Web Development', 'Learn Next.js and Node.js', 1),
(2, 'Data Science with Python', 'Learn Pandas, NumPy, and Machine Learning', 2),
(3, 'Java Full Stack Development', 'Master Core Java, Spring Boot, MySQL, and Frontend Integration', 3);

INSERT OR IGNORE INTO sections (id, subject_id, title, order_index) VALUES 
(1, 1, 'Introduction to React & Next.js', 1),
(2, 1, 'Advanced Next.js Concepts', 2),
(3, 2, 'Python Basics', 1),
(4, 2, 'Advanced Python & Automation', 2),
(5, 3, 'Core Java Fundamentals', 1),
(6, 3, 'Backend Development with Spring', 2),
(7, 3, 'Full Stack Integration', 3);

INSERT OR IGNORE INTO videos (id, section_id, title, video_url, duration, order_index) VALUES 
(1, 1, 'What is Next.js?', 'https://www.youtube.com/watch?v=Sklc_fQBmcs', 600, 1),
(2, 1, 'Routing in Next.js', 'https://www.youtube.com/watch?v=wm5gMKuwSYk', 800, 2),
(3, 2, 'Server Actions', 'https://www.youtube.com/watch?v=dDpZfOQBMaU', 1200, 1),
(4, 3, 'Python Hello World', 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 400, 1),
(9, 3, 'Python Object Oriented Programming', 'https://www.youtube.com/watch?v=JeznW_7DlB0', 1200, 2),
(10, 4, 'Data Analysis with Pandas', 'https://www.youtube.com/watch?v=vmEHCJofslg', 900, 1),
(11, 4, 'NumPy for Scientists', 'https://www.youtube.com/watch?v=QUT1VHiLmmI', 850, 2),
(12, 4, 'Machine Learning Basics', 'https://www.youtube.com/watch?v=1u888p0CjUE', 1000, 3),
(13, 5, 'Java Syntax & OOPs', 'https://www.youtube.com/watch?v=BGTx91t8q50', 700, 1),
(14, 6, 'Spring Boot REST API', 'https://www.youtube.com/watch?v=9SGDpanrc8U', 1200, 1),
(15, 7, 'Connecting React with Spring Boot', 'https://www.youtube.com/watch?v=YfOY-Wp_xRA', 1100, 1);
