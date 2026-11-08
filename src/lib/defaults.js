/**
 * STARTING CONTENT - only verified facts from the portfolio owner's brief.
 *
 * This file is a fallback so the public site renders before Supabase is
 * connected (and so `supabase/seed.sql` has a readable source of truth).
 * Once Supabase is set up, the database wins and everything here can be edited
 * from the admin dashboard - no code changes required.
 *
 * Nothing in this file should be invented. Empty sections stay empty and show
 * an honest empty state until the owner adds real content.
 */

export const defaultProfile = {
  id: "primary",
  full_name: "Most. Farheen Islam Badhon",
  headline:
    "Computer Science & Engineering undergraduate at IUBAT · AI, machine learning and computer vision · UI/UX and visual design",
  short_bio:
    "I am a Computer Science and Engineering undergraduate at IUBAT, Bangladesh, expecting to graduate in 2027. I am a beginner-level developer building my foundations in programming and databases, with a growing interest in artificial intelligence, machine learning and computer vision - and a parallel love for UI/UX and visual design.",
  long_bio:
    "I am currently studying for a BSc in Computer Science and Engineering at the International University of Business Agriculture and Technology (IUBAT) in Dhaka, Bangladesh, with an expected graduation in 2027. Before university I completed my HSC at Rajuk Uttara Model College and my SSC at Khwaja Yunus Ali Laboratory School and College, both with a GPA of 5.00.\n\nI am at the beginning of my technical journey. My coursework and self-study have introduced me to programming in C, C++, C#, Python, JavaScript and PHP, to relational and document databases, and to design tools such as Figma, Adobe XD and Photopea. I am honest about my level: I am a learner, not a senior engineer, and this portfolio documents work in progress rather than claiming expertise I do not have.\n\nMy academic interests are in artificial intelligence, machine learning, deep learning, computer vision and deepfake detection, and my undergraduate thesis focuses on image-based deepfake detection. Alongside engineering I enjoy design work - interface design, posters, academic diagrams and infographics - and I am interested in research collaboration, research assistant opportunities, fully funded postgraduate study, and remote work.",
  email: "farheenislam2003@gmail.com",
  location: "Bangladesh",
  github_url: "https://github.com/FarheenIslam",
  linkedin_url:
    "https://www.linkedin.com/in/farheen-islam-badhon-10b17b259",
  avatar_url: null,
  resume_url: null,
  availability: "Open to research collaboration and remote opportunities",
  interests: [
    "Software Development",
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Computer Vision",
    "Deepfake Detection",
    "UI/UX Design",
    "Research Collaboration",
    "Research Assistant Opportunities",
    "Fully Funded Higher Education & Direct PhD",
    "Remote Jobs & Freelancing",
  ],
  research_interests: [
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Computer Vision",
    "Human-Computer Interaction",
    "Deepfake Detection",
  ],
  learning_goals:
    "Strengthening my programming and data-structure fundamentals, practising machine-learning workflows end to end, learning computer-vision and deepfake-detection research methods, and improving my UI/UX craft through real design work.",
  career_goals:
    "To grow into a researcher and engineer working on trustworthy computer vision and deepfake detection, while contributing to research teams, pursuing fully funded graduate study, and taking on remote software or design work.",
  updated_at: "2026-01-01T00:00:00.000Z",
};

export const defaultEducation = [
  {
    id: "edu-iubat",
    institution: "International University of Business Agriculture and Technology (IUBAT)",
    degree: "BSc in Computer Science and Engineering",
    department: "Department of Computer Science and Engineering",
    location: "Dhaka, Bangladesh",
    start_year: null,
    end_year: 2027,
    is_current: true,
    result: null,
    result_scale: null,
    description:
      "Undergraduate degree in Computer Science and Engineering. Expected graduation in 2027.",
    sort_order: 1,
    is_published: true,
  },
  {
    id: "edu-hsc",
    institution: "Rajuk Uttara Model College",
    degree: "Higher Secondary Certificate (HSC)",
    department: "Science",
    location: "Dhaka, Bangladesh",
    start_year: null,
    end_year: 2021,
    is_current: false,
    result: "5.00",
    result_scale: "5.00",
    description: "Completed HSC with a GPA of 5.00 in 2021.",
    sort_order: 2,
    is_published: true,
  },
  {
    id: "edu-ssc",
    institution: "Khwaja Yunus Ali Laboratory School and College",
    degree: "Secondary School Certificate (SSC)",
    department: "Science",
    location: "Bangladesh",
    start_year: null,
    end_year: 2019,
    is_current: false,
    result: "5.00",
    result_scale: "5.00",
    description: "Completed SSC with a GPA of 5.00 in 2019.",
    sort_order: 3,
    is_published: true,
  },
];

const skill = (id, name, category, level, sort_order) => ({
  id,
  name,
  category,
  level,
  sort_order,
  is_published: true,
});

export const defaultSkills = [
  skill("sk-c", "C", "Programming", "Beginner", 1),
  skill("sk-cpp", "C++", "Programming", "Beginner", 2),
  skill("sk-cs", "C#", "Programming", "Beginner", 3),
  skill("sk-py", "Python", "Programming", "Beginner", 4),
  skill("sk-js", "JavaScript", "Programming", "Beginner", 5),
  skill("sk-php", "PHP", "Programming", "Beginner", 6),
  skill("sk-mysql", "MySQL", "Database", "Beginner", 7),
  skill("sk-mongo", "MongoDB", "Database", "Beginner", 8),
  skill("sk-supabase", "Supabase", "Database", "Beginner", 9),
  skill("sk-figma", "Figma", "Design Tools", "Beginner", 10),
  skill("sk-xd", "Adobe XD", "Design Tools", "Beginner", 11),
  skill("sk-photopea", "Photopea", "Design Tools", "Beginner", 12),
  skill("sk-canva", "Canva", "Design Tools", "Beginner", 13),
  skill("sk-drawio", "Draw.io", "Design Tools", "Beginner", 14),
  skill("sk-ai", "Artificial Intelligence", "Research Interests", "Beginner", 15),
  skill("sk-ml", "Machine Learning", "Research Interests", "Beginner", 16),
  skill("sk-dl", "Deep Learning", "Research Interests", "Beginner", 17),
  skill("sk-cv", "Computer Vision", "Research Interests", "Beginner", 18),
  skill("sk-hci", "HCI", "Research Interests", "Beginner", 19),
  skill("sk-deepfake", "Deepfake Detection", "Research Interests", "Beginner", 20),
];

export const defaultProjects = [
  {
    id: "prj-inventorypro",
    slug: "inventorypro-commerce",
    title: "InventoryPro Commerce",
    tagline: "Inventory and commerce management",
    summary:
      "An inventory and commerce management project. Full write-up, screenshots and technology list are maintained from the admin dashboard.",
    description: "",
    category: "Software Development",
    technologies: [],
    github_url: "https://github.com/FarheenIslam/inventorypro-commerce",
    live_url: null,
    cover_image_url: null,
    project_status: null,
    is_featured: true,
    started_on: null,
    sort_order: 1,
    is_published: true,
    created_at: "2026-01-01T00:00:00.000Z",
    project_images: [],
  },
  {
    id: "prj-alumni",
    slug: "alumni-management-system",
    title: "Alumni Management System",
    tagline: "Alumni records and engagement",
    summary:
      "A management system for alumni records. Full write-up, screenshots and technology list are maintained from the admin dashboard.",
    description: "",
    category: "Software Development",
    technologies: [],
    github_url: "https://github.com/FarheenIslam/alumni_managemnt",
    live_url: null,
    cover_image_url: null,
    project_status: null,
    is_featured: true,
    started_on: null,
    sort_order: 2,
    is_published: true,
    created_at: "2026-01-01T00:00:00.000Z",
    project_images: [],
  },
  {
    id: "prj-cpds",
    slug: "courier-parcel-delivery-analytics",
    title: "Courier and Parcel Delivery Analytics System",
    tagline: "Delivery analytics",
    summary:
      "An analytics system for courier and parcel delivery. Full write-up, screenshots and technology list are maintained from the admin dashboard.",
    description: "",
    category: "Data & Analytics",
    technologies: [],
    github_url: "https://github.com/FarheenIslam/cpds",
    live_url: null,
    cover_image_url: null,
    project_status: null,
    is_featured: false,
    started_on: null,
    sort_order: 3,
    is_published: true,
    created_at: "2026-01-01T00:00:00.000Z",
    project_images: [],
  },
  {
    id: "prj-routeflow",
    slug: "routeflow-bus-counter-booking",
    title: "Bus Counter & Seat Booking System (RouteFlow)",
    tagline: "Seat booking, in progress",
    summary:
      "A bus counter and seat booking system. Currently in progress; details, screenshots and technology list are maintained from the admin dashboard.",
    description: "",
    category: "Software Development",
    technologies: [],
    github_url: "https://github.com/FarheenIslam/routeflow",
    live_url: null,
    cover_image_url: null,
    project_status: "in_progress",
    is_featured: true,
    started_on: null,
    sort_order: 4,
    is_published: true,
    created_at: "2026-01-01T00:00:00.000Z",
    project_images: [],
  },
];

export const defaultPublications = [
  {
    id: "pub-depression",
    title: "Depression Detection from Code Mixed Bangla English Social Media Text",
    authors: ["Most. Farheen Islam Badhon"],
    venue: null,
    publication_year: null,
    doi: null,
    abstract: null,
    keywords: ["Depression Detection", "Code-Mixed Text", "Bangla", "English", "Social Media"],
    pdf_url: null,
    publication_url: null,
    poster_url: null,
    presentation_url: null,
    publication_status: "published",
    is_featured: true,
    sort_order: 1,
    is_published: true,
  },
  {
    id: "pub-medical",
    title: "Evaluating ML Model Reliability in Medical Diagnosis with Data Splits and Noise",
    authors: ["Most. Farheen Islam Badhon"],
    venue: null,
    publication_year: null,
    doi: null,
    abstract: null,
    keywords: ["Machine Learning", "Model Reliability", "Medical Diagnosis", "Data Splits", "Noise"],
    pdf_url: null,
    publication_url: null,
    poster_url: null,
    presentation_url: null,
    publication_status: "published",
    is_featured: false,
    sort_order: 2,
    is_published: true,
  },
  {
    id: "pub-traffic",
    title:
      "A Real Time Automated Traffic Violations Detection System for Motorcycles Using YOLOR",
    authors: ["Most. Farheen Islam Badhon"],
    venue: null,
    publication_year: null,
    doi: null,
    abstract: null,
    keywords: ["YOLOR", "Traffic Violation Detection", "Motorcycles", "Computer Vision", "Real-Time"],
    pdf_url: null,
    publication_url: null,
    poster_url: null,
    presentation_url: null,
    publication_status: "published",
    is_featured: false,
    sort_order: 3,
    is_published: true,
  },
];

export const defaultThesis = [
  {
    id: "thesis-deepfake",
    title: "Image-Based Deepfake Detection",
    research_area: "Computer Vision · Deepfake Detection",
    supervisor: null,
    description:
      "Ongoing undergraduate thesis on detecting image-based deepfakes. Methodology, results and artefacts will be published as the research progresses.",
    abstract: null,
    thesis_status: "ongoing",
    started_year: null,
    expected_year: 2027,
    document_url: null,
    sort_order: 1,
    is_published: true,
  },
];

export const defaultCertificates = [];

export const defaultAchievements = [
  {
    id: "ach-poster",
    title: "Humanitarian Poster Presentation",
    issuer: null,
    achieved_on: "2025-12-28",
    category: "Presentation",
    description: "Presented a poster at a humanitarian poster presentation event.",
    is_featured: true,
    sort_order: 1,
    is_published: true,
  },
];

export const defaultDesignWorks = [];

export const defaultExperiences = [
  {
    id: "exp-iubat-it",
    role: "Member",
    organization: "IUBAT IT Society",
    kind: "Membership",
    start_date: "2023-01-01",
    end_date: "2024-12-31",
    is_current: false,
    description: "Member of the IUBAT IT Society (2023-2024).",
    sort_order: 1,
    is_published: true,
  },
];

export const defaultActivities = [
  {
    id: "act-iiiec",
    title: "Quiz of IIEC Innovation",
    event_date: "2025-11-29",
    location: null,
    role: "Participant",
    description: "Participated in the Quiz of IIEC Innovation.",
    image_url: null,
    sort_order: 1,
    is_published: true,
  },
  {
    id: "act-cv",
    title: "Craft Your CV",
    event_date: "2025-12-04",
    location: null,
    role: "Participant",
    description: "Participated in the Craft Your CV session.",
    image_url: null,
    sort_order: 2,
    is_published: true,
  },
  {
    id: "act-humanitarian",
    title: "Humanitarian Poster Presentation",
    event_date: "2025-12-28",
    location: null,
    role: "Presenter",
    description: "Presented a poster at a humanitarian poster presentation event.",
    image_url: null,
    sort_order: 3,
    is_published: true,
  },
];

export const defaultSiteSettings = {
  site_title: "Most. Farheen Islam Badhon",
  site_tagline: "Computer Science & Engineering undergraduate · AI & computer vision",
  seo_description:
    "Portfolio of Most. Farheen Islam Badhon, Computer Science and Engineering undergraduate at IUBAT, Bangladesh - projects, research on deepfake detection, certificates and design work.",
  contact_intro:
    "For research collaboration, research assistant opportunities, fully funded graduate study or remote work, email me or use the form below.",
  show_design_gallery: true,
  footer_note: "Built with Next.js, Supabase and care.",
};
