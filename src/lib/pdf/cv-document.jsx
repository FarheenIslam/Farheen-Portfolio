import { Document, Page, Text, View, Link } from "@react-pdf/renderer";
import { COLORS, pdfStyles as s } from "./theme";

export function CvDocument({ data }) {
  const { profile, education, skills, projects, publications, experiences, activities } = data;

  const skillGroups = ["Programming", "Database", "Design Tools", "Research Interests"]
    .map((category) => ({
      category,
      items: skills.filter((skill) => skill.category === category).map((skill) => skill.name),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Document
      title={`${profile.full_name} — CV`}
      author={profile.full_name}
      subject="Curriculum Vitae"
    >
      <Page size="A4" style={s.page}>
        <View style={s.footer} fixed>
          <Text>{profile.full_name} · Curriculum Vitae</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={s.h1}>{profile.full_name}</Text>
          <Text style={{ fontSize: 9.5, color: COLORS.muted, marginTop: 3 }}>
            {profile.headline}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
            <Text style={{ fontSize: 8, color: COLORS.body, marginRight: 10 }}>{profile.email}</Text>
            <Text style={{ fontSize: 8, color: COLORS.body, marginRight: 10 }}>
              {profile.location}
            </Text>
            {profile.github_url ? (
              <Link src={profile.github_url} style={{ fontSize: 8, color: COLORS.accent, marginRight: 10 }}>
                GitHub
              </Link>
            ) : null}
            {profile.linkedin_url ? (
              <Link src={profile.linkedin_url} style={{ fontSize: 8, color: COLORS.accent }}>
                LinkedIn
              </Link>
            ) : null}
          </View>
        </View>

        <View style={s.rule} />

        <View style={s.section}>
          <Text style={s.eyebrow}>Profile</Text>
          <Text style={s.body}>{profile.short_bio}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.eyebrow}>Education</Text>
          {education.map((item) => (
            <View key={item.id} style={{ marginBottom: 5 }}>
              <View style={s.row}>
                <Text style={s.h3}>{item.degree}</Text>
                <Text style={s.small}>
                  {item.is_current
                    ? `Expected ${item.end_year ?? ""}`
                    : [item.start_year, item.end_year].filter(Boolean).join(" — ")}
                </Text>
              </View>
              <Text style={{ fontSize: 8.5 }}>{item.institution}</Text>
              {item.result ? (
                <Text style={s.small}>
                  GPA {item.result}
                  {item.result_scale ? ` / ${item.result_scale}` : ""}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.eyebrow}>Technical skills</Text>
          {skillGroups.map((group) => (
            <Text key={group.category} style={{ fontSize: 8.5, marginBottom: 2 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", color: COLORS.ink }}>
                {group.category}:{" "}
              </Text>
              {group.items.join(", ")}
            </Text>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.eyebrow}>Projects</Text>
          {projects.map((project) => (
            <View key={project.id} style={{ marginBottom: 4 }} wrap={false}>
              <Text style={s.h3}>{project.title}</Text>
              {project.summary ? (
                <Text style={{ fontSize: 8.5 }}>{project.summary}</Text>
              ) : null}
              {project.technologies?.length > 0 ? (
                <Text style={s.small}>{project.technologies.join(" · ")}</Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.eyebrow}>Research</Text>
          {publications.map((publication) => (
            <View key={publication.id} style={s.bulletRow} wrap={false}>
              <Text style={s.bullet}>•</Text>
              <Text style={{ fontSize: 8.5 }}>
                {publication.title}
                {[publication.venue, publication.publication_year].filter(Boolean).length > 0
                  ? ` — ${[publication.venue, publication.publication_year].filter(Boolean).join(", ")}`
                  : ""}
              </Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.eyebrow}>Experience & activities</Text>
          {experiences.map((item) => (
            <Text key={item.id} style={{ fontSize: 8.5, marginBottom: 2 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", color: COLORS.ink }}>
                {item.role}
              </Text>
              {" · "}
              {item.organization}
            </Text>
          ))}
          {activities.map((item) => (
            <View key={item.id} style={s.bulletRow}>
              <Text style={s.bullet}>•</Text>
              <Text style={{ fontSize: 8.5 }}>{item.title}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
