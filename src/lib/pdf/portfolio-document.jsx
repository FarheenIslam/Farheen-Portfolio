import { Document, Page, Text, View, Link } from "@react-pdf/renderer";
import { COLORS, pdfStyles as s } from "./theme";

const Footer = ({ name }) => (
  <View style={s.footer} fixed>
    <Text>
      {name} · Portfolio
    </Text>
    <Text
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
    />
  </View>
);

function SectionTitle({ children }) {
  return <Text style={s.h2}>{children}</Text>;
}

function Empty({ children }) {
  return <Text style={s.small}>{children}</Text>;
}

export function PortfolioDocument({ data }) {
  const {
    profile,
    education,
    skills,
    projects,
    publications,
    thesis,
    certificates,
    achievements,
    designWorks,
    experiences,
    activities,
  } = data;

  const skillGroups = ["Programming", "Database", "Design Tools", "Research Interests"]
    .map((category) => ({
      category,
      items: skills.filter((skill) => skill.category === category),
    }))
    .filter((group) => group.items.length > 0);

  const paragraphs = String(profile.long_bio || profile.short_bio || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <Document
      title={`${profile.full_name} — Portfolio`}
      author={profile.full_name}
      subject="Professional portfolio"
      keywords="computer science, AI, deepfake detection, portfolio"
      creator="Portfolio CMS"
    >
      {/* Cover */}
      <Page size="A4" style={[s.page, s.cover]} wrap>
        <View style={{ padding: 46, flexGrow: 1 }}>
          <Text style={s.coverLabel}>Professional Portfolio</Text>
          <Text style={s.coverTitle}>{profile.full_name}</Text>
          <Text
            style={{
              fontSize: 11,
              color: "#c9d8ee",
              marginTop: 12,
              maxWidth: 380,
              lineHeight: 1.5,
            }}
          >
            {profile.headline}
          </Text>

          <View style={{ marginTop: 28, flexDirection: "row", flexWrap: "wrap" }}>
            {(profile.research_interests ?? []).slice(0, 6).map((interest) => (
              <Text
                key={interest}
                style={{
                  fontSize: 7.5,
                  color: "#cfe0f7",
                  borderWidth: 0.6,
                  borderColor: "#3f648f",
                  borderRadius: 10,
                  paddingVertical: 3,
                  paddingHorizontal: 8,
                  marginRight: 5,
                  marginBottom: 5,
                }}
              >
                {interest}
              </Text>
            ))}
          </View>
        </View>

        <View
          style={{
            padding: 46,
            paddingTop: 20,
            borderTopWidth: 0.6,
            borderTopColor: "#33547c",
          }}
        >
          <Text style={{ fontSize: 8.5, color: "#c9d8ee", marginBottom: 3 }}>
            {profile.email}
          </Text>
          {profile.github_url ? (
            <Link src={profile.github_url} style={{ fontSize: 8.5, color: "#c9d8ee", marginBottom: 3 }}>
              {profile.github_url}
            </Link>
          ) : null}
          {profile.linkedin_url ? (
            <Link
              src={profile.linkedin_url}
              style={{ fontSize: 8.5, color: "#c9d8ee", marginBottom: 3 }}
            >
              {profile.linkedin_url}
            </Link>
          ) : null}
          <Text style={{ fontSize: 8.5, color: "#c9d8ee" }}>
            {profile.location} · BSc in Computer Science & Engineering, IUBAT · Expected 2027
          </Text>
        </View>
      </Page>

      {/* Introduction + About + Education */}
      <Page size="A4" style={s.page}>
        <Footer name={profile.full_name} />

        <View style={s.section}>
          <Text style={s.eyebrow}>Introduction</Text>
          <Text style={s.h1}>{profile.full_name}</Text>
          <Text style={{ fontSize: 10, color: COLORS.muted, marginTop: 4, marginBottom: 8 }}>
            {profile.headline}
          </Text>
          <Text style={s.body}>{profile.short_bio}</Text>
        </View>

        <View style={s.rule} />

        <View style={s.section}>
          <SectionTitle>About me</SectionTitle>
          {paragraphs.map((paragraph, index) => (
            <Text key={index} style={{ ...s.body, marginBottom: 6 }}>
              {paragraph}
            </Text>
          ))}
        </View>

        <View style={s.section}>
          <SectionTitle>Education</SectionTitle>
          {education.length === 0 ? (
            <Empty>Education entries will be added soon.</Empty>
          ) : (
            education.map((item) => (
              <View key={item.id} style={s.card}>
                <View style={s.row}>
                  <Text style={s.h3}>{item.degree}</Text>
                  <Text style={s.small}>
                    {item.is_current
                      ? `Expected ${item.end_year ?? ""}`
                      : [item.start_year, item.end_year].filter(Boolean).join(" — ")}
                  </Text>
                </View>
                <Text style={{ fontSize: 9, color: COLORS.body }}>{item.institution}</Text>
                {item.department ? <Text style={s.small}>{item.department}</Text> : null}
                {item.result ? (
                  <Text style={{ fontSize: 8.5, color: COLORS.ink, marginTop: 2 }}>
                    Result: GPA {item.result}
                    {item.result_scale ? ` / ${item.result_scale}` : ""}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </Page>

      {/* Skills + Projects */}
      <Page size="A4" style={s.page}>
        <Footer name={profile.full_name} />

        <View style={s.section}>
          <SectionTitle>Technical skills</SectionTitle>
          {skillGroups.length === 0 ? (
            <Empty>Skills will be added soon.</Empty>
          ) : (
            skillGroups.map((group) => (
              <View key={group.category} style={{ marginBottom: 8 }}>
                <Text style={{ ...s.h3, marginBottom: 3 }}>{group.category}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {group.items.map((skill) => (
                    <Text key={skill.id} style={s.badge}>
                      {skill.name}
                      {skill.level ? ` · ${skill.level}` : ""}
                    </Text>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={s.section}>
          <SectionTitle>Projects</SectionTitle>
          {projects.length === 0 ? (
            <Empty>Projects will be added soon.</Empty>
          ) : (
            projects.map((project) => (
              <View key={project.id} style={s.card} wrap={false}>
                <Text style={s.h3}>{project.title}</Text>
                {project.tagline ? <Text style={s.small}>{project.tagline}</Text> : null}
                {(project.summary || project.description) ? (
                  <Text style={{ ...s.body, fontSize: 9, marginTop: 3 }}>
                    {project.summary || project.description}
                  </Text>
                ) : null}
                {project.technologies?.length > 0 ? (
                  <Text style={{ ...s.small, marginTop: 3 }}>
                    {project.technologies.join(" · ")}
                  </Text>
                ) : null}
                {project.github_url ? (
                  <Link src={project.github_url} style={{ ...s.link, fontSize: 8, marginTop: 3 }}>
                    {project.github_url}
                  </Link>
                ) : null}
              </View>
            ))
          )}
        </View>
      </Page>

      {/* Research */}
      <Page size="A4" style={s.page}>
        <Footer name={profile.full_name} />

        <View style={s.section}>
          <SectionTitle>Research & publications</SectionTitle>
          {publications.length === 0 ? (
            <Empty>Publications will be added soon.</Empty>
          ) : (
            publications.map((publication) => (
              <View key={publication.id} style={s.card} wrap={false}>
                <Text style={s.h3}>{publication.title}</Text>
                {publication.authors?.length > 0 ? (
                  <Text style={s.small}>{publication.authors.join(", ")}</Text>
                ) : null}
                {[publication.venue, publication.publication_year, publication.doi]
                  .filter(Boolean).length > 0 ? (
                  <Text style={s.small}>
                    {[publication.venue, publication.publication_year, publication.doi]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                ) : null}
                {publication.abstract ? (
                  <Text style={{ ...s.body, fontSize: 9, marginTop: 3 }}>
                    {publication.abstract}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>

        <View style={s.section}>
          <SectionTitle>Thesis</SectionTitle>
          {thesis.length === 0 ? (
            <Empty>No thesis information published.</Empty>
          ) : (
            thesis.map((item) => (
              <View key={item.id} style={s.washCard} wrap={false}>
                <Text style={s.h3}>{item.title}</Text>
                <Text style={s.small}>
                  {[item.research_area, item.thesis_status, item.expected_year ? `expected ${item.expected_year}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
                {item.description ? (
                  <Text style={{ ...s.body, fontSize: 9, marginTop: 3 }}>{item.description}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>

        <View style={s.section}>
          <SectionTitle>Certificates & achievements</SectionTitle>
          {certificates.length === 0 && achievements.length === 0 ? (
            <Empty>Certificates and achievements will be added soon.</Empty>
          ) : (
            <View>
              {certificates.map((certificate) => (
                <View key={certificate.id} style={s.bulletRow}>
                  <Text style={s.bullet}>•</Text>
                  <Text style={{ ...s.body, fontSize: 9 }}>
                    {certificate.title}
                    {[certificate.issuer, certificate.category].filter(Boolean).length > 0
                      ? ` — ${[certificate.issuer, certificate.category].filter(Boolean).join(", ")}`
                      : ""}
                  </Text>
                </View>
              ))}
              {achievements.map((achievement) => (
                <View key={achievement.id} style={s.bulletRow}>
                  <Text style={s.bullet}>•</Text>
                  <Text style={{ ...s.body, fontSize: 9 }}>{achievement.title}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>

      {/* Design + experience + contact */}
      <Page size="A4" style={s.page}>
        <Footer name={profile.full_name} />

        <View style={s.section}>
          <SectionTitle>Design portfolio highlights</SectionTitle>
          {designWorks.length === 0 ? (
            <Empty>Design work will be added soon.</Empty>
          ) : (
            designWorks.slice(0, 10).map((work) => (
              <View key={work.id} style={s.card} wrap={false}>
                <View style={s.row}>
                  <Text style={s.h3}>{work.title}</Text>
                  <Text style={s.small}>{work.category}</Text>
                </View>
                {work.short_description ? (
                  <Text style={{ ...s.body, fontSize: 9 }}>{work.short_description}</Text>
                ) : null}
                {work.tools?.length > 0 ? (
                  <Text style={{ ...s.small, marginTop: 2 }}>{work.tools.join(" · ")}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>

        <View style={s.section}>
          <SectionTitle>Experience & activities</SectionTitle>
          {experiences.map((item) => (
            <View key={item.id} style={{ marginBottom: 5 }}>
              <Text style={s.h3}>
                {item.role} · {item.organization}
              </Text>
              <Text style={s.small}>
                {[item.kind, item.is_current ? `${item.start_date ?? ""} — Present` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
          ))}
          {activities.slice(0, 8).map((item) => (
            <View key={item.id} style={s.bulletRow}>
              <Text style={s.bullet}>•</Text>
              <Text style={{ ...s.body, fontSize: 9 }}>
                {item.title}
                {item.event_date ? ` — ${new Date(item.event_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}
              </Text>
            </View>
          ))}
        </View>

        <View style={s.rule} />

        <View>
          <SectionTitle>Contact</SectionTitle>
          <Text style={s.body}>Email: {profile.email}</Text>
          {profile.github_url ? (
            <Link src={profile.github_url} style={s.link}>
              {profile.github_url}
            </Link>
          ) : null}
          {profile.linkedin_url ? (
            <Link src={profile.linkedin_url} style={{ ...s.link, marginTop: 2 }}>
              {profile.linkedin_url}
            </Link>
          ) : null}
          <Text style={{ ...s.small, marginTop: 6 }}>{profile.location}</Text>
        </View>
      </Page>
    </Document>
  );
}
