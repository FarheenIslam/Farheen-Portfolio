-- =====================================================================
-- Seed data: only verified facts supplied by the portfolio owner.
-- Safe to run once on a fresh database. Existing rows are never overwritten.
--
-- BEFORE YOU RUN THIS:
--   1) Create your account in Supabase → Authentication → Users → Add user
--      (email + password). Confirm the email if confirmation is enabled.
--   2) Run the block at the bottom of this file to make that user an admin.
--   3) Sign in at /admin/login.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Profile
-- ---------------------------------------------------------------------
insert into public.profiles (
  id, full_name, headline, short_bio, long_bio, email, location,
  github_url, linkedin_url, avatar_url, availability,
  interests, research_interests, learning_goals, career_goals
)
values (
  '9f000000-0000-4000-8000-000000000001',
  'Most. Farheen Islam Badhon',
  'Computer Science & Engineering undergraduate at IUBAT · AI, machine learning and computer vision · UI/UX and visual design',
  'I am a Computer Science and Engineering undergraduate at IUBAT, Bangladesh, expecting to graduate in 2027. I am a beginner-level developer building my foundations in programming and databases, with a growing interest in artificial intelligence, machine learning and computer vision - and a parallel love for UI/UX and visual design.',
  E'I am currently studying for a BSc in Computer Science and Engineering at the International University of Business Agriculture and Technology (IUBAT) in Dhaka, Bangladesh, with an expected graduation in 2027. Before university I completed my HSC at Rajuk Uttara Model College and my SSC at Khwaja Yunus Ali Laboratory School and College, both with a GPA of 5.00.\n\nI am at the beginning of my technical journey. My coursework and self-study have introduced me to programming in C, C++, C#, Python, JavaScript and PHP, to relational and document databases, and to design tools such as Figma, Adobe XD and Photopea. I am honest about my level: I am a learner, not a senior engineer, and this portfolio documents work in progress rather than claiming expertise I do not have.\n\nMy academic interests are in artificial intelligence, machine learning, deep learning, computer vision and deepfake detection, and my undergraduate thesis focuses on image-based deepfake detection. Alongside engineering I enjoy design work - interface design, posters, academic diagrams and infographics - and I am interested in research collaboration, research assistant opportunities, fully funded postgraduate study, and remote work.',
  'farheenislam2003@gmail.com',
  'Bangladesh',
  'https://github.com/FarheenIslam',
  'https://www.linkedin.com/in/farheen-islam-badhon-10b17b259',
  null,
  'Open to research collaboration and remote opportunities',
  array[
    'Software Development', 'Artificial Intelligence', 'Machine Learning',
    'Deep Learning', 'Computer Vision', 'Deepfake Detection', 'UI/UX Design',
    'Research Collaboration', 'Research Assistant Opportunities',
    'Fully Funded Higher Education & Direct PhD', 'Remote Jobs & Freelancing'
  ],
  array[
    'Artificial Intelligence', 'Machine Learning', 'Deep Learning',
    'Computer Vision', 'Human-Computer Interaction', 'Deepfake Detection'
  ],
  'Strengthening my programming and data-structure fundamentals, practising machine-learning workflows end to end, learning computer-vision and deepfake-detection research methods, and improving my UI/UX craft through real design work.',
  'To grow into a researcher and engineer working on trustworthy computer vision and deepfake detection, while contributing to research teams, pursuing fully funded graduate study, and taking on remote software or design work.'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Education
-- ---------------------------------------------------------------------
insert into public.education (id, institution, degree, department, location, start_year, end_year, is_current, result, result_scale, description, sort_order)
values
  ('e0000000-0000-4000-8000-000000000001', 'International University of Business Agriculture and Technology (IUBAT)', 'BSc in Computer Science and Engineering', 'Department of Computer Science and Engineering', 'Dhaka, Bangladesh', null, 2027, true, null, null, 'Undergraduate degree in Computer Science and Engineering. Expected graduation in 2027.', 1),
  ('e0000000-0000-4000-8000-000000000002', 'Rajuk Uttara Model College', 'Higher Secondary Certificate (HSC)', 'Science', 'Dhaka, Bangladesh', null, 2021, false, '5.00', '5.00', 'Completed HSC with a GPA of 5.00 in 2021.', 2),
  ('e0000000-0000-4000-8000-000000000003', 'Khwaja Yunus Ali Laboratory School and College', 'Secondary School Certificate (SSC)', 'Science', 'Bangladesh', null, 2019, false, '5.00', '5.00', 'Completed SSC with a GPA of 5.00 in 2019.', 3)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Skills (honest "Beginner" labels; edit levels from the dashboard)
-- ---------------------------------------------------------------------
insert into public.skills (name, category, level, sort_order)
values
  ('C', 'Programming', 'Beginner', 1),
  ('C++', 'Programming', 'Beginner', 2),
  ('C#', 'Programming', 'Beginner', 3),
  ('Python', 'Programming', 'Beginner', 4),
  ('JavaScript', 'Programming', 'Beginner', 5),
  ('PHP', 'Programming', 'Beginner', 6),
  ('MySQL', 'Database', 'Beginner', 7),
  ('MongoDB', 'Database', 'Beginner', 8),
  ('Supabase', 'Database', 'Beginner', 9),
  ('Figma', 'Design Tools', 'Beginner', 10),
  ('Adobe XD', 'Design Tools', 'Beginner', 11),
  ('Photopea', 'Design Tools', 'Beginner', 12),
  ('Canva', 'Design Tools', 'Beginner', 13),
  ('Draw.io', 'Design Tools', 'Beginner', 14),
  ('Artificial Intelligence', 'Research Interests', 'Beginner', 15),
  ('Machine Learning', 'Research Interests', 'Beginner', 16),
  ('Deep Learning', 'Research Interests', 'Beginner', 17),
  ('Computer Vision', 'Research Interests', 'Beginner', 18),
  ('HCI', 'Research Interests', 'Beginner', 19),
  ('Deepfake Detection', 'Research Interests', 'Beginner', 20)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Projects (only the supplied titles, repositories and status)
-- ---------------------------------------------------------------------
insert into public.projects (id, slug, title, tagline, summary, category, technologies, github_url, project_status, is_featured, sort_order)
values
  ('a0000000-0000-4000-8000-000000000001', 'inventorypro-commerce', 'InventoryPro Commerce', 'Inventory and commerce management', 'An inventory and commerce management project. Full write-up, screenshots and technology list are maintained from the admin dashboard.', 'Software Development', '{}', 'https://github.com/FarheenIslam/inventorypro-commerce', null, true, 1),
  ('a0000000-0000-4000-8000-000000000002', 'alumni-management-system', 'Alumni Management System', 'Alumni records and engagement', 'A management system for alumni records. Full write-up, screenshots and technology list are maintained from the admin dashboard.', 'Software Development', '{}', 'https://github.com/FarheenIslam/alumni_managemnt', null, true, 2),
  ('a0000000-0000-4000-8000-000000000003', 'courier-parcel-delivery-analytics', 'Courier and Parcel Delivery Analytics System', 'Delivery analytics', 'An analytics system for courier and parcel delivery. Full write-up, screenshots and technology list are maintained from the admin dashboard.', 'Data & Analytics', '{}', 'https://github.com/FarheenIslam/cpds', null, false, 3),
  ('a0000000-0000-4000-8000-000000000004', 'routeflow-bus-counter-booking', 'Bus Counter & Seat Booking System (RouteFlow)', 'Seat booking, in progress', 'A bus counter and seat booking system. Currently in progress; details, screenshots and technology list are maintained from the admin dashboard.', 'Software Development', '{}', 'https://github.com/FarheenIslam/routeflow', 'in_progress', true, 4)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Publications (titles only; venues, years and DOIs left empty on purpose)
-- ---------------------------------------------------------------------
insert into public.publications (id, title, authors, keywords, publication_status, is_featured, sort_order)
values
  ('b0000000-0000-4000-8000-000000000001', 'Depression Detection from Code Mixed Bangla English Social Media Text', array['Most. Farheen Islam Badhon'], array['Depression Detection', 'Code-Mixed Text', 'Bangla', 'English', 'Social Media'], 'published', true, 1),
  ('b0000000-0000-4000-8000-000000000002', 'Evaluating ML Model Reliability in Medical Diagnosis with Data Splits and Noise', array['Most. Farheen Islam Badhon'], array['Machine Learning', 'Model Reliability', 'Medical Diagnosis', 'Data Splits', 'Noise'], 'published', false, 2),
  ('b0000000-0000-4000-8000-000000000003', 'A Real Time Automated Traffic Violations Detection System for Motorcycles Using YOLOR', array['Most. Farheen Islam Badhon'], array['YOLOR', 'Traffic Violation Detection', 'Motorcycles', 'Computer Vision', 'Real-Time'], 'published', false, 3)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Thesis
-- ---------------------------------------------------------------------
insert into public.thesis (id, title, research_area, description, thesis_status, expected_year, sort_order)
values
  ('c0000000-0000-4000-8000-000000000001', 'Image-Based Deepfake Detection', 'Computer Vision · Deepfake Detection', 'Ongoing undergraduate thesis on detecting image-based deepfakes. Methodology, results and artefacts will be published as the research progresses.', 'ongoing', 2027, 1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Achievements / experience / activities
-- ---------------------------------------------------------------------
insert into public.achievements (id, title, achieved_on, category, description, is_featured, sort_order)
values
  ('d0000000-0000-4000-8000-000000000001', 'Humanitarian Poster Presentation', '2025-12-28', 'Presentation', 'Presented a poster at a humanitarian poster presentation event.', true, 1)
on conflict (id) do nothing;

insert into public.experiences (id, role, organization, kind, start_date, end_date, is_current, description, sort_order)
values
  ('f0000000-0000-4000-8000-000000000001', 'Member', 'IUBAT IT Society', 'Membership', '2023-01-01', '2024-12-31', false, 'Member of the IUBAT IT Society (2023-2024).', 1)
on conflict (id) do nothing;

insert into public.activities (id, title, event_date, role, description, sort_order)
values
  ('aa000000-0000-4000-8000-000000000001', 'Quiz of IIEC Innovation', '2025-11-29', 'Participant', 'Participated in the Quiz of IIEC Innovation.', 1),
  ('aa000000-0000-4000-8000-000000000002', 'Craft Your CV', '2025-12-04', 'Participant', 'Participated in the Craft Your CV session.', 2),
  ('aa000000-0000-4000-8000-000000000003', 'Humanitarian Poster Presentation', '2025-12-28', 'Presenter', 'Presented a poster at a humanitarian poster presentation event.', 3)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Website settings
-- ---------------------------------------------------------------------
insert into public.site_settings (key, value)
values
  ('site_title', '"Most. Farheen Islam Badhon"'::jsonb),
  ('site_tagline', '"Computer Science & Engineering undergraduate · AI & computer vision"'::jsonb),
  ('seo_description', '"Portfolio of Most. Farheen Islam Badhon, Computer Science and Engineering undergraduate at IUBAT, Bangladesh - projects, research on deepfake detection, certificates and design work."'::jsonb),
  ('contact_intro', '"For research collaboration, research assistant opportunities, fully funded graduate study or remote work, email me or use the form below."'::jsonb),
  ('show_design_gallery', 'true'::jsonb),
  ('footer_note', '"Built with Next.js, Supabase and care."'::jsonb)
on conflict (key) do nothing;

-- =====================================================================
-- STEP 2 - make your own account an administrator.
-- Replace the email below with the account you created in Supabase Auth.
-- =====================================================================
-- insert into public.admins (user_id, email, full_name)
-- select id, lower(email), 'Most. Farheen Islam Badhon'
-- from auth.users
-- where lower(email) = lower('farheenislam2003@gmail.com')
-- on conflict (user_id) do nothing;
