/**
 * Resource definitions powering the admin CMS.
 *
 * One config entry describes a table, its form fields and its list columns.
 * The generic <ResourceManager /> and the save/delete server actions read from
 * here, so adding a field is a one-line change - no duplicated CRUD code.
 */

const field = (name, label, type = "text", options = {}) => ({
  name,
  label,
  type,
  ...options,
});

const sortField = field("sort_order", "Sort order", "number", {
  defaultValue: 0,
  help: "Lower numbers appear first.",
  width: "w-28",
});

const publishedField = field("is_published", "Published", "switch", {
  defaultValue: true,
  help: "Only published items appear on the public website and in the PDF.",
});

const featuredField = field("is_featured", "Featured", "switch", {
  defaultValue: false,
  help: "Featured items are highlighted on the home page.",
});

const slugField = field("slug", "URL slug", "text", {
  placeholder: "auto-generated from the title",
  help: "Used in the public URL. Leave blank to generate it automatically.",
});

export const RESOURCES = {
  profile: {
    table: "profiles",
    label: "Profile",
    singular: "Profile",
    description: "Your public identity: name, headline, biography and links.",
    singleton: true,
    primary: "full_name",
    fields: [
      field("full_name", "Full name", "text", { required: true }),
      field("headline", "Professional headline", "text", { required: true }),
      field("short_bio", "Short introduction", "textarea", {
        rows: 3,
        required: true,
        help: "Used in the hero and PDF introduction.",
      }),
      field("long_bio", "Full biography", "textarea", {
        rows: 8,
        help: "Shown on the About page. Separate paragraphs with a blank line.",
      }),
      field("email", "Professional email", "email", { required: true }),
      field("location", "Country / location", "text", { placeholder: "Bangladesh" }),
      field("github_url", "GitHub URL", "url"),
      field("linkedin_url", "LinkedIn URL", "url"),
      field("avatar_url", "Profile photo", "image", {
        folder: "profile",
        help: "JPG, PNG or WebP. Leave empty to show initials instead.",
      }),
      field("resume_url", "CV / résumé file", "file", { folder: "cv" }),
      field("availability", "Availability line", "text"),
      field("interests", "Career interests", "tags", {
        help: "Comma separated.",
      }),
      field("research_interests", "Research interests", "tags", {
        help: "Comma separated.",
      }),
      field("learning_goals", "Current learning goals", "textarea", { rows: 4 }),
      field("career_goals", "Future career goals", "textarea", { rows: 4 }),
    ],
  },

  education: {
    table: "education",
    label: "Education",
    singular: "Education entry",
    description: "Degrees, colleges and academic results.",
    primary: "institution",
    order: { column: "sort_order", ascending: true },
    fields: [
      field("institution", "Institution", "text", { required: true }),
      field("degree", "Degree / certificate", "text", { required: true }),
      field("department", "Department / group", "text"),
      field("location", "Location", "text"),
      field("start_year", "Start year", "number", { width: "w-32" }),
      field("end_year", "End year", "number", { width: "w-32" }),
      field("is_current", "Currently studying", "switch"),
      field("result", "Result (e.g. 5.00)", "text"),
      field("result_scale", "Result scale (e.g. 5.00)", "text"),
      field("description", "Description", "textarea", { rows: 3 }),
      sortField,
      publishedField,
    ],
  },

  skills: {
    table: "skills",
    label: "Skills",
    singular: "Skill",
    description: "Grouped skills with honest level labels.",
    primary: "name",
    order: { column: "sort_order", ascending: true },
    fields: [
      field("name", "Skill", "text", { required: true }),
      field("category", "Category", "select", {
        required: true,
        options: ["Programming", "Database", "Design Tools", "Research Interests"],
      }),
      field("level", "Level", "select", {
        options: ["Beginner", "Intermediate", "Advanced"],
        defaultValue: "Beginner",
        help: "Be honest - no percentage bars are shown anywhere.",
      }),
      sortField,
      publishedField,
    ],
  },

  projects: {
    table: "projects",
    label: "Projects",
    singular: "Project",
    description: "Software projects, their stack and screenshots.",
    primary: "title",
    order: { column: "sort_order", ascending: true },
    slug: true,
    gallery: { table: "project_images", foreignKey: "project_id" },
    fields: [
      field("title", "Project title", "text", { required: true }),
      slugField,
      field("tagline", "Short tagline", "text"),
      field("summary", "Card summary", "textarea", { rows: 2 }),
      field("description", "Full description", "textarea", { rows: 8 }),
      field("category", "Category", "text", { placeholder: "Software Development" }),
      field("technologies", "Technologies", "tags", { help: "Comma separated." }),
      field("github_url", "GitHub URL", "url"),
      field("live_url", "Live demo URL", "url"),
      field("cover_image_url", "Cover image", "image", { folder: "projects" }),
      field("project_status", "Status", "select", {
        options: ["", "in_progress", "completed", "archived"],
        labels: { "": "Not specified", in_progress: "In progress", completed: "Completed", archived: "Archived" },
      }),
      field("started_on", "Start date", "date"),
      featuredField,
      sortField,
      publishedField,
      field("gallery", "Screenshots", "gallery", {
        folder: "projects",
        help: "Add screenshots in the order they should appear.",
      }),
    ],
  },

  publications: {
    table: "publications",
    label: "Research & Publications",
    singular: "Publication",
    description: "Published papers. Only add verified venues, years and DOIs.",
    primary: "title",
    order: { column: "sort_order", ascending: true },
    fields: [
      field("title", "Paper title", "text", { required: true }),
      field("authors", "Authors", "tags", { help: "Comma separated, in published order." }),
      field("venue", "Publication venue", "text"),
      field("publication_year", "Year", "number", { width: "w-32" }),
      field("doi", "DOI", "text"),
      field("abstract", "Abstract", "textarea", { rows: 6 }),
      field("keywords", "Keywords", "tags"),
      field("publication_status", "Status", "select", {
        options: ["published", "under_review", "preprint", "conference", "journal"],
        labels: {
          published: "Published",
          under_review: "Under review",
          preprint: "Preprint",
          conference: "Conference paper",
          journal: "Journal article",
        },
        defaultValue: "published",
      }),
      field("pdf_url", "Research PDF", "file", { folder: "research" }),
      field("publication_url", "Publication URL", "url"),
      field("poster_url", "Research poster", "file", { folder: "research" }),
      field("presentation_url", "Presentation", "file", { folder: "research" }),
      featuredField,
      sortField,
      publishedField,
    ],
  },

  thesis: {
    table: "thesis",
    label: "Thesis",
    singular: "Thesis",
    description: "Undergraduate thesis and ongoing research.",
    primary: "title",
    order: { column: "sort_order", ascending: true },
    fields: [
      field("title", "Thesis title", "text", { required: true }),
      field("research_area", "Research area", "text"),
      field("supervisor", "Supervisor", "text"),
      field("description", "Overview", "textarea", { rows: 4 }),
      field("abstract", "Abstract", "textarea", { rows: 6 }),
      field("thesis_status", "Status", "select", {
        options: ["ongoing", "under_review", "submitted", "defended", "completed"],
        labels: {
          ongoing: "Ongoing",
          under_review: "Under review",
          submitted: "Submitted",
          defended: "Defended",
          completed: "Completed",
        },
        defaultValue: "ongoing",
      }),
      field("started_year", "Started", "number", { width: "w-32" }),
      field("expected_year", "Expected completion", "number", { width: "w-32" }),
      field("document_url", "Thesis document", "file", { folder: "thesis" }),
      sortField,
      publishedField,
    ],
  },

  certificates: {
    table: "certificates",
    label: "Certificates",
    singular: "Certificate",
    description: "Certificate library with images, PDFs and verification links.",
    primary: "title",
    order: { column: "sort_order", ascending: true },
    fields: [
      field("title", "Certificate title", "text", { required: true }),
      field("issuer", "Issuing organisation", "text"),
      field("issue_date", "Issue date", "date"),
      field("category", "Category", "select", {
        options: [
          "Academic Certificates",
          "Online Course Certificates",
          "Workshop Certificates",
          "Training Certificates",
          "Competition Certificates",
          "Participation Certificates",
          "Research Certificates",
          "Other Achievements",
        ],
        defaultValue: "Online Course Certificates",
      }),
      field("description", "Description", "textarea", { rows: 3 }),
      field("file_url", "Certificate image or PDF", "file", { folder: "certificates" }),
      field("verification_url", "Verification URL", "url"),
      featuredField,
      sortField,
      publishedField,
    ],
  },

  achievements: {
    table: "achievements",
    label: "Achievements",
    singular: "Achievement",
    description: "Awards, presentations and recognition.",
    primary: "title",
    order: { column: "sort_order", ascending: true },
    fields: [
      field("title", "Achievement", "text", { required: true }),
      field("issuer", "Organisation", "text"),
      field("achieved_on", "Date", "date"),
      field("category", "Category", "select", {
        options: ["Award", "Presentation", "Recognition", "Competition", "Other"],
        defaultValue: "Presentation",
      }),
      field("description", "Description", "textarea", { rows: 3 }),
      featuredField,
      sortField,
      publishedField,
    ],
  },

  designs: {
    table: "design_works",
    label: "Design Portfolio",
    singular: "Design work",
    description: "UI/UX, graphic and academic design work in the creative gallery.",
    primary: "title",
    order: { column: "sort_order", ascending: true },
    slug: true,
    gallery: { table: "design_work_images", foreignKey: "design_work_id" },
    fields: [
      field("title", "Design title", "text", { required: true }),
      slugField,
      field("short_description", "Short description", "textarea", { rows: 2 }),
      field("description", "Detailed description", "textarea", { rows: 8 }),
      field("category", "Category", "select", {
        required: true,
        options: ["UI/UX Design", "Graphic Design", "Academic & Research Design", "Other Creative Work"],
      }),
      field("tools", "Design tools", "tags", { help: "Comma separated, e.g. Figma, Photopea." }),
      field("objectives", "Design objectives", "textarea", {
        rows: 4,
        help: "One objective per line.",
      }),
      field("process", "Design process", "textarea", {
        rows: 5,
        help: "One step per line.",
      }),
      field("cover_image_url", "Cover image", "image", {
        folder: "designs",
        help: "Landscape images look best in the gallery.",
      }),
      field("figma_url", "Figma prototype URL", "url"),
      field("source_url", "Source file URL", "url"),
      field("live_url", "Live preview URL", "url"),
      field("created_on", "Creation date", "date"),
      featuredField,
      sortField,
      publishedField,
      field("gallery", "Gallery images", "gallery", { folder: "designs" }),
    ],
  },

  experiences: {
    table: "experiences",
    label: "Experience",
    singular: "Experience",
    description: "Memberships, internships and roles.",
    primary: "organization",
    order: { column: "sort_order", ascending: true },
    fields: [
      field("role", "Role", "text", { required: true }),
      field("organization", "Organisation", "text", { required: true }),
      field("kind", "Type", "select", {
        options: ["Membership", "Internship", "Volunteer", "Work", "Research", "Other"],
        defaultValue: "Membership",
      }),
      field("start_date", "Start date", "date"),
      field("end_date", "End date", "date"),
      field("is_current", "Current role", "switch"),
      field("description", "Description", "textarea", { rows: 3 }),
      sortField,
      publishedField,
    ],
  },

  activities: {
    table: "activities",
    label: "Activities",
    singular: "Activity",
    description: "Events, workshops and presentations.",
    primary: "title",
    order: { column: "sort_order", ascending: true },
    fields: [
      field("title", "Activity", "text", { required: true }),
      field("event_date", "Date", "date"),
      field("location", "Location", "text"),
      field("role", "Your role", "text", { placeholder: "Participant" }),
      field("description", "Description", "textarea", { rows: 3 }),
      field("image_url", "Photo", "image", { folder: "activities" }),
      sortField,
      publishedField,
    ],
  },
};

export const RESOURCE_KEYS = Object.keys(RESOURCES);

export function getResource(key) {
  const resource = RESOURCES[key];
  if (!resource) throw new Error(`Unknown resource: ${key}`);
  return resource;
}

/** Fields that live in a child table and are edited as a gallery. */
export function formFields(resource) {
  return resource.fields.filter((f) => f.type !== "gallery");
}
