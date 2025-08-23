// COPY THIS ENTIRE FILE FROM: lib/supabase/saveMessageToSupabase.ts
// Move the complete contents of lib/supabase/saveMessageToSupabase.ts into this file 
import { supabase } from "../../database/config/databaseConfig";

export const saveMessageToSupabase = async ({
  sessionId,
  userId,
  sender,
  content,
  clientId,
}: {
  sessionId: string;
  userId: string;
  sender: "user" | "assistant";
  content: string;
  clientId?: string;
}) => {
  if (!content.trim()) return;

  const { error } = await supabase.from("session_messages").insert({
    session_id: sessionId,
    user_id: userId,
    sender,
    content: content.trim(),
    token_count: 0, // optional, you can remove this if unused
    client_id: clientId,
  });

  if (error) {
    console.error("❌ Supabase insert failed:", error);
  } else {
    console.log("✅ Message saved to Supabase");
  }
}; 