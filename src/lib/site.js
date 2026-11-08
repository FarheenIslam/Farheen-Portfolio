export const NAV_ITEMS = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/research", label: "Research" },
  { href: "/designs", label: "Design" },
  { href: "/certificates", label: "Certificates" },
  { href: "/experience", label: "Experience" },
  { href: "/contact", label: "Contact" },
];

export const ADMIN_NAV = [
  {
    group: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
      { href: "/admin/messages", label: "Contact messages", icon: "Inbox" },
      { href: "/admin/logs", label: "Activity logs", icon: "History" },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/profile", label: "Profile", icon: "UserRound" },
      { href: "/admin/education", label: "Education", icon: "GraduationCap" },
      { href: "/admin/skills", label: "Skills", icon: "Wrench" },
      { href: "/admin/projects", label: "Projects", icon: "FolderKanban" },
      { href: "/admin/publications", label: "Research & Publications", icon: "BookOpen" },
      { href: "/admin/thesis", label: "Thesis", icon: "FlaskConical" },
      { href: "/admin/certificates", label: "Certificates", icon: "Award" },
      { href: "/admin/achievements", label: "Achievements", icon: "Medal" },
      { href: "/admin/designs", label: "Design portfolio", icon: "Palette" },
      { href: "/admin/experiences", label: "Experience", icon: "Briefcase" },
      { href: "/admin/activities", label: "Activities", icon: "CalendarDays" },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/admin/cv", label: "CV & PDF", icon: "FileText" },
      { href: "/admin/media", label: "Media library", icon: "Images" },
      { href: "/admin/settings", label: "Website settings", icon: "Settings" },
      { href: "/admin/admins", label: "Administrators", icon: "ShieldCheck" },
    ],
  },
];
