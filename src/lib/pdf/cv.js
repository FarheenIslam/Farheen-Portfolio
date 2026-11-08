import { COLORS, CONTENT_WIDTH, MARGIN, clean, createWriter, monthYear } from "./layout";

const SKILL_GROUPS = ["Programming", "Database", "Design Tools", "Research Interests"];

/** Section label in the compact CV style. */
function section(writer, label) {
  writer.ensure(46);
  writer.y -= 8;
  writer.eyebrow(label);
  writer.y -= 2;
}

/** A title on the left and a right-aligned date on the same line. */
function row(writer, left, right, { size = 9.2 } = {}) {
  const fonts = writer.fonts;
  const rightText = clean(right);
  const rightWidth = rightText ? fonts.body.widthOfTextAtSize(rightText, 8) : 0;
  const lines = writer.wrap(left, fonts.bold, size, CONTENT_WIDTH - rightWidth - 10);
  const step = size * 1.45;
  writer.ensure(step);

  lines.forEach((line, index) => {
    if (writer.y - step < writer.bottom) writer.addPage();
    writer.page.drawText(line, {
      x: MARGIN,
      y: writer.y - size * 0.82,
      size,
      font: fonts.bold,
      color: COLORS.ink,
    });
    if (index === 0 && rightText) {
      const width = fonts.body.widthOfTextAtSize(rightText, 8);
      writer.page.drawText(rightText, {
        x: MARGIN + CONTENT_WIDTH - width,
        y: writer.y - 8 * 0.82,
        size: 8,
        font: fonts.body,
        color: COLORS.muted,
      });
    }
    writer.y -= step;
  });
}

/** Contact details on one line; anything with a URL becomes clickable. */
function contactRow(writer, items) {
  const size = 8;
  writer.ensure(size * 1.8);
  const baseline = writer.y - size * 0.82;
  let x = MARGIN;

  items.filter(Boolean).forEach((item, index) => {
    const label = clean(item.label);
    if (!label) return;
    const width = writer.fonts.body.widthOfTextAtSize(label, size);
    if (x + width > MARGIN + CONTENT_WIDTH) return;
    if (index > 0) x += 6;
    writer.page.drawText(label, {
      x,
      y: baseline,
      size,
      font: writer.fonts.body,
      color: item.url ? COLORS.accent : COLORS.body,
    });
    if (item.url) {
      writer.addLink({ x, y: baseline - 2, width, height: size + 4, url: item.url });
    }
    x += width + 8;
  });
  writer.y -= size * 1.8;
}

export async function renderCvPdf(data) {
  const { profile, education, skills, projects, publications, thesis, experiences, activities, certificates } = data;

  const writer = await createWriter({
    title: `${profile.full_name} — CV`,
    author: profile.full_name,
    subject: "Curriculum Vitae",
    keywords: "curriculum vitae, computer science, AI, deepfake detection",
  });

  writer.addPage();

  writer.ensure(46);
  writer.page.drawText(clean(profile.full_name), {
    x: MARGIN,
    y: writer.y - 24,
    size: 24,
    font: writer.fonts.serif,
    color: COLORS.navy,
  });
  writer.y -= 32;

  writer.paragraph(profile.headline, { size: 9.5, color: COLORS.muted, gap: 5, lineHeight: 1.4 });

  contactRow(
    writer,
    [
      profile.email ? { label: profile.email, url: `mailto:${profile.email}` } : null,
      profile.location ? { label: profile.location } : null,
      profile.github_url ? { label: "GitHub", url: profile.github_url } : null,
      profile.linkedin_url ? { label: "LinkedIn", url: profile.linkedin_url } : null,
    ].filter(Boolean)
  );

  writer.rule({ gap: 4 });

  if (profile.short_bio) {
    section(writer, "Profile");
    writer.paragraph(profile.short_bio, { size: 9, gap: 2, lineHeight: 1.5 });
  }

  if (education.length) {
    section(writer, "Education");
    for (const item of education) {
      row(
        writer,
        item.degree,
        item.is_current
          ? item.end_year
            ? `Expected ${item.end_year}`
            : "Present"
          : [item.start_year, item.end_year].filter(Boolean).join(" — ")
      );
      writer.paragraph(
        [item.institution, item.department].filter(Boolean).join(", "),
        { size: 8.6, gap: 1, lineHeight: 1.4 }
      );
      if (item.result) {
        writer.paragraph(
          `GPA ${item.result}${item.result_scale ? ` / ${item.result_scale}` : ""}`,
          { size: 8.2, color: COLORS.muted, gap: 2, lineHeight: 1.4 }
        );
      }
      writer.y -= 3;
    }
  }

  const groups = SKILL_GROUPS.map((category) => ({
    category,
    items: skills.filter((skill) => skill.category === category).map((skill) => skill.name),
  })).filter((group) => group.items.length > 0);

  if (groups.length) {
    section(writer, "Technical skills");
    for (const group of groups) {
      writer.paragraph(`${group.category}:  ${group.items.join(", ")}`, {
        size: 8.8,
        gap: 2,
        lineHeight: 1.45,
      });
    }
  }

  if (projects.length) {
    section(writer, "Projects");
    for (const project of projects) {
      row(writer, project.title, "");
      if (project.summary || project.description) {
        writer.paragraph(project.summary || project.description, { size: 8.6, gap: 1, lineHeight: 1.45 });
      }
      if (project.technologies?.length) {
        writer.paragraph(project.technologies.join(", "), {
          size: 8,
          color: COLORS.muted,
          gap: 2,
          lineHeight: 1.4,
        });
      }
      writer.y -= 3;
    }
  }

  if (publications.length || thesis.length) {
    section(writer, "Research");
    writer.bullets(
      [
        ...publications.map((publication) =>
          [
            publication.title,
            [publication.venue, publication.publication_year].filter(Boolean).join(", "),
          ]
            .filter(Boolean)
            .join(" — ")
        ),
        ...thesis.map((item) =>
          [item.title, [item.research_area, item.thesis_status].filter(Boolean).join(", ")]
            .filter(Boolean)
            .join(" — ")
        ),
      ],
      { size: 8.6, gap: 2 }
    );
  }

  if (certificates.length) {
    section(writer, "Certificates");
    writer.bullets(
      certificates.map((certificate) =>
        [certificate.title, certificate.issuer].filter(Boolean).join(" — ")
      ),
      { size: 8.6, gap: 2 }
    );
  }

  if (experiences.length || activities.length) {
    section(writer, "Experience & activities");
    for (const item of experiences) {
      row(
        writer,
        `${item.role} · ${item.organization}`,
        item.is_current
          ? `${monthYear(item.start_date) || ""} — Present`
          : [monthYear(item.start_date), monthYear(item.end_date)].filter(Boolean).join(" — ")
      );
      if (item.description) {
        writer.paragraph(item.description, { size: 8.6, gap: 2, lineHeight: 1.45 });
      }
      writer.y -= 2;
    }
    writer.bullets(
      activities.map((item) => [item.title, monthYear(item.event_date)].filter(Boolean).join(" — ")),
      { size: 8.6, gap: 2 }
    );
  }

  return writer.finish(`${profile.full_name} · Curriculum Vitae`);
}
