"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please share your name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(200),
  subject: z.string().trim().max(160).optional().default(""),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(4000, "Please keep the message under 4000 characters"),
});

export async function submitContactMessage(_previousState, formData) {
  const honeypot = formData.get("website");

  // Bots fill hidden fields. Pretend success without storing anything.
  if (honeypot) {
    return { status: "success", message: "Thank you - your message has been received." };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const errors = {};
    parsed.error.issues.forEach((issue) => {
      const key = issue.path[0];
      if (!errors[key]) errors[key] = issue.message;
    });
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "The contact form is not connected to a database yet. Please email farheenislam2003@gmail.com directly.",
    };
  }

  try {
    const supabase = await createClient();
    if (!supabase) throw new Error("Supabase is not configured");

    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });

    if (error) throw error;

    return {
      status: "success",
      message: "Thank you - your message has been sent. I will reply as soon as I can.",
    };
  } catch (error) {
    console.error("[contact]", error.message);
    return {
      status: "error",
      message:
        "Something went wrong while sending your message. Please try again or email farheenislam2003@gmail.com.",
    };
  }
}
