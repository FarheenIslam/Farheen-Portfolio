import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { MessagesManager } from "@/components/admin/messages-manager";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Contact messages · Admin",
  robots: { index: false, follow: false },
};

const DEMO_MESSAGES = [
  {
    id: "demo-message-1",
    name: "Dr. A. Rahman",
    email: "a.rahman@example.edu",
    subject: "Research collaboration on deepfake detection",
    message:
      "Hello Farheen,\n\nI read your work on image-based deepfake detection and would like to discuss a possible collaboration with our vision lab. Would you be available for a short call next week?\n\nBest regards,\nA. Rahman",
    is_read: false,
    is_archived: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-message-2",
    name: "Sarah Chen",
    email: "sarah@example.com",
    subject: "UI/UX internship",
    message:
      "Hi Farheen, we are a small product studio looking for a design intern for the summer. Your portfolio gallery caught our eye. Would you be open to a conversation?",
    is_read: true,
    is_archived: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default async function AdminMessagesPage() {
  const admin = await requireAdmin();
  let messages = [];

  if (admin.demo || !isSupabaseConfigured()) {
    messages = DEMO_MESSAGES;
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    messages = data ?? [];
  }

  const unread = messages.filter((message) => !message.is_read && !message.is_archived).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            Contact messages
            {unread > 0 && <Badge variant="accent">{unread} unread</Badge>}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Messages submitted through the public contact form. Never shared publicly.
          </p>
        </div>
      </div>

      <MessagesManager messages={messages} />
    </div>
  );
}
