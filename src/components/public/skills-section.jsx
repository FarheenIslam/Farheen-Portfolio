import { Code2, Database, PenTool, Microscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ICONS = {
  Programming: Code2,
  Database: Database,
  "Design Tools": PenTool,
  "Research Interests": Microscope,
};

const ORDER = ["Programming", "Database", "Design Tools", "Research Interests"];

export function SkillsSection({ skills = [] }) {
  const groups = ORDER.map((category) => ({
    category,
    items: skills.filter((skill) => skill.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {groups.map((group) => {
        const Icon = ICONS[group.category] ?? Code2;
        return (
          <div key={group.category} className="surface p-6">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Icon className="size-4" />
              </span>
              <h3 className="text-[15px] font-semibold">{group.category}</h3>
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
              {group.items.map((skill) => (
                <li key={skill.id}>
                  <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[13px]">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {skill.level}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function SkillsCompact({ skills = [] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <Badge key={skill.id} variant="outline" className="font-normal">
          {skill.name}
        </Badge>
      ))}
    </div>
  );
}
