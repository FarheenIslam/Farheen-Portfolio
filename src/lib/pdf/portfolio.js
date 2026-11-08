import {
  COLORS,
  CONTENT_WIDTH,
  MARGIN,
  PAGE,
  clean,
  createWriter,
  monthYear,
  yearRange,
} from "./layout";

const SKILL_GROUPS = ["Programming", "Database", "Design Tools", "Research Interests"];

function educationEntry(writer, item) {
  const result = item.result
    ? `Result: GPA ${item.result}${item.result_scale ? ` / ${item.result_scale}` : ""}`
    : "";
  writer.entry({
    title: item.degree,
    meta: [
      [item.institution, item.department].filter(Boolean).join(" · "),
      yearRange(item.start_year, item.end_year, item.is_current),
    ],
    body: [result, item.description].filter(Boolean).join("  "),
  });
}

function drawCover(writer, data) {
  const { profile } = data;
  const page = writer.addPage({ cover: true });
  const left = MARGIN;
  const width = CONTENT_WIDTH;

  page.drawText("PROFESSIONAL PORTFOLIO", {
    x: left,
    y: PAGE.height - 92,
    size: 8,
    font: writer.fonts.bold,
    color: COLORS.coverMuted,
  });
  page.drawLine({
    start: { x: left, y: PAGE.height - 108 },
    end: { x: left + 56, y: PAGE.height - 108 },
    thickness: 1.4,
    color: COLORS.coverLine,
  });

  let y = PAGE.height - 150;
  const nameLines = writer.wrap(profile.full_name, writer.fonts.serif, 34, width);
  for (const line of nameLines) {
    page.drawText(line, {
      x: left,
      y: y - 34 * 0.82,
      size: 34,
      font: writer.fonts.serif,
      color: COLORS.white,
    });
    y -= 40;
  }

  y -= 10;
  const headlineLines = writer.wrap(profile.headline, writer.fonts.body, 11, width - 40);
  for (const line of headlineLines) {
    page.drawText(line, {
      x: left,
      y: y - 11 * 0.82,
      size: 11,
      font: writer.fonts.body,
      color: COLORS.coverInk,
    });
    y -= 16;
  }

  y -= 20;
  const interests = (profile.research_interests ?? []).slice(0, 6);
  let chipX = left;
  let chipRow = 18;
  for (const interest of interests) {
    const label = clean(interest);
    const chipWidth = writer.fonts.body.widthOfTextAtSize(label, 7.6) + 16;
    if (chipX + chipWidth > left + width) {
      chipX = left;
      y -= chipRow + 5;
      chipRow = 18;
    }
    page.drawRectangle({
      x: chipX,
      y: y - 18,
      width: chipWidth,
      height: 18,
      borderColor: COLORS.coverLine,
      borderWidth: 0.7,
    });
    page.drawText(label, {
      x: chipX + 8,
      y: y - 12.4,
      size: 7.6,
      font: writer.fonts.body,
      color: COLORS.coverInk,
    });
    chipX += chipWidth + 6;
  }
  y -= chipRow;

  // Contact block, anchored to the bottom of the cover.
  const contactTop = 152;
  page.drawLine({
    start: { x: left, y: contactTop },
    end: { x: left + width, y: contactTop },
    thickness: 0.7,
    color: COLORS.coverLine,
  });

  let contactY = contactTop - 24;
  const contactRows = [];
  if (profile.email) contactRows.push({ text: profile.email, url: `mailto:${profile.email}` });
  if (profile.github_url) contactRows.push({ text: profile.github_url, url: profile.github_url });
  if (profile.linkedin_url) contactRows.push({ text: profile.linkedin_url, url: profile.linkedin_url });

  for (const row of contactRows) {
    const label = clean(row.text);
    page.drawText(label, {
      x: left,
      y: contactY,
      size: 8.6,
      font: writer.fonts.body,
      color: COLORS.coverInk,
    });
    const linkWidth = writer.fonts.body.widthOfTextAtSize(label, 8.6);
    writer.addLink({ x: left, y: contactY - 3, width: linkWidth, height: 12, url: row.url });
    contactY -= 16;
  }

  page.drawText(
    clean(
      [
        profile.location,
        "BSc in Computer Science & Engineering, IUBAT",
        "Expected 2027",
      ]
        .filter(Boolean)
        .join("  ·  ")
    ),
    { x: left, y: contactY - 2, size: 8.4, font: writer.fonts.body, color: COLORS.coverMuted }
  );
}

export async function renderPortfolioPdf(data) {
  const { profile } = data;
  const writer = await createWriter({
    title: `${profile.full_name} — Portfolio`,
    author: profile.full_name,
    subject: "Professional portfolio",
    keywords: "computer science, AI, deepfake detection, portfolio",
  });

  drawCover(writer, data);

  writer.addPage();
  writer.eyebrow("Introduction");
  writer.ensure(40);
  writer.page.drawText(clean(profile.full_name), {
    x: MARGIN,
    y: writer.y - 22,
    size: 22,
    font: writer.fonts.serif,
    color: COLORS.navy,
  });
  writer.y -= 30;
  writer.paragraph(profile.headline, { size: 10, color: COLORS.muted, gap: 8 });
  writer.paragraph(profile.short_bio, { size: 9.5, gap: 4 });

  writer.heading("About me", { gapBefore: 10 });
  const paragraphs = String(profile.long_bio || profile.short_bio || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  for (const paragraph of paragraphs) writer.paragraph(paragraph, { gap: 6 });

  writer.heading("Education");
  const { education } = data;
  if (education.length === 0) writer.empty("Education entries will be added soon.");
  for (const item of education) educationEntry(writer, item);

  writer.heading("Technical skills");
  const groups = SKILL_GROUPS.map((category) => ({
    category,
    items: data.skills.filter((skill) => skill.category === category),
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) writer.empty("Skills will be added soon.");
  for (const group of groups) {
    writer.paragraph(group.category, {
      size: 9.2,
      font: writer.fonts.bold,
      color: COLORS.ink,
      gap: 4,
    });
    writer.chips(group.items.map((skill) => (skill.level ? `${skill.name} (${skill.level})` : skill.name)));
    writer.y -= 4;
  }

  writer.heading("Projects");
  const { projects } = data;
  if (projects.length === 0) writer.empty("Projects will be added soon.");
  for (const project of projects) {
    writer.entry({
      title: project.title,
      meta: [project.tagline, project.category].filter(Boolean),
      body: project.summary || project.description,
      tags: project.technologies ?? [],
      links: [
        project.github_url ? { label: project.github_url, url: project.github_url } : null,
        project.live_url ? { label: project.live_url, url: project.live_url } : null,
      ].filter(Boolean),
    });
  }

  writer.heading("Research & publications");
  const { publications, thesis } = data;
  if (publications.length === 0) writer.empty("Publications will be added soon.");
  for (const publication of publications) {
    writer.entry({
      title: publication.title,
      meta: [
        (publication.authors ?? []).join(", "),
        [publication.venue, publication.publication_year, publication.publication_status]
          .filter(Boolean)
          .join(" · "),
      ].filter(Boolean),
      body: publication.abstract,
      links: [
        publication.publication_url ? { label: publication.publication_url, url: publication.publication_url } : null,
        publication.doi ? { label: `DOI: ${publication.doi}`, url: `https://doi.org/${publication.doi}` } : null,
      ].filter(Boolean),
    });
  }

  writer.heading("Thesis");
  if (thesis.length === 0) writer.empty("No thesis information published.");
  for (const item of thesis) {
    writer.entry({
      title: item.title,
      meta: [
        [item.research_area, item.thesis_status].filter(Boolean).join(" · "),
        item.expected_year ? `Expected ${item.expected_year}` : "",
      ].filter(Boolean),
      body: item.description,
    });
  }

  writer.heading("Certificates & achievements");
  const { certificates, achievements } = data;
  if (certificates.length === 0 && achievements.length === 0) {
    writer.empty("Certificates and achievements will be added soon.");
  }
  writer.bullets(
    certificates.map((certificate) =>
      [certificate.title, [certificate.issuer, certificate.category].filter(Boolean).join(", ")]
        .filter(Boolean)
        .join(" — ")
    )
  );
  writer.bullets(
    achievements.map((achievement) =>
      [achievement.title, [achievement.issuer, monthYear(achievement.achieved_on)].filter(Boolean).join(", ")]
        .filter(Boolean)
        .join(" — ")
    )
  );

  writer.heading("Design portfolio highlights");
  const { designWorks } = data;
  if (designWorks.length === 0) writer.empty("Design work will be added soon.");
  for (const work of designWorks.slice(0, 10)) {
    writer.entry({
      title: work.title,
      meta: [work.category].filter(Boolean),
      body: work.short_description,
      tags: work.tools ?? [],
      links: [
        work.figma_url ? { label: work.figma_url, url: work.figma_url } : null,
        work.live_url ? { label: work.live_url, url: work.live_url } : null,
      ].filter(Boolean),
    });
  }

  writer.heading("Experience & activities");
  const { experiences, activities } = data;
  if (experiences.length === 0 && activities.length === 0) writer.empty("Experience will be added soon.");
  for (const item of experiences) {
    writer.entry({
      title: `${item.role} · ${item.organization}`,
      meta: [
        [item.kind, item.is_current ? `${monthYear(item.start_date) || ""} — Present` : [monthYear(item.start_date), monthYear(item.end_date)].filter(Boolean).join(" — ")]
          .filter(Boolean)
          .join(" · "),
      ].filter(Boolean),
      body: item.description,
    });
  }
  writer.bullets(activities.slice(0, 10).map((item) => [item.title, monthYear(item.event_date)].filter(Boolean).join(" — ")));

  writer.rule({ gap: 12 });
  writer.heading("Contact", { gapBefore: 0 });
  writer.paragraph(`Email: ${profile.email}`, { size: 9, gap: 4 });
  writer.linkRow(profile.github_url, profile.github_url);
  writer.linkRow(profile.linkedin_url, profile.linkedin_url);
  writer.paragraph(profile.location, { size: 8.5, color: COLORS.muted, gap: 0 });

  return writer.finish(`${profile.full_name} · Portfolio`);
}
