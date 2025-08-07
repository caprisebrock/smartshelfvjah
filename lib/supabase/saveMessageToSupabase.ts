import { supabase } from "../supabaseClient";

export const saveMessageToSupabase = async ({
  sessionId,
  userId,
  sender,
  content,
}: {
  sessionId: string;
  userId: string;
  sender: "user" | "assistant";
  content: string;
}) => {
  if (!content.trim()) return;

  const { error } = await supabase.from("session_messages").insert({
    session_id: sessionId,
    user_id: userId,
    sender,
    content: content.trim(),
    token_count: 0, // optional, you can remove this if unused
  });

  if (error) {
    console.error("❌ Supabase insert failed:", error);
  } else {
    console.log("✅ Message saved to Supabase");
  }
}; 