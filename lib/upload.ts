import { supabase } from "./supabase";
import { deriveKey, getChunkIV } from "./crypto";

const CHUNK_SIZE = 1024 * 1024; // 1MB

export async function uploadFile(file: File, password: string) {
  const fileId = crypto.randomUUID();

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const baseIV = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt);

  let chunkIndex = 0;

  for (let i = 0; i < file.size; i += CHUNK_SIZE) {
    const chunk = await file.slice(i, i + CHUNK_SIZE).arrayBuffer();

    const iv = getChunkIV(baseIV, chunkIndex);

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      chunk
    );

    const { error } = await supabase.storage
      .from("files")
      .upload(`${fileId}/${chunkIndex}`, new Blob([encrypted]), {
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error);
      return;
    }

    chunkIndex++;
  }

  // Save metadata
  const { error: metaError } = await supabase.from("files").insert({
    id: fileId,
    filename: file.name,
    salt: Array.from(salt),
    baseiv: Array.from(baseIV),
    chunkcount: chunkIndex,
  });

  if (metaError) {
    console.error("Metadata error:", metaError);
    return;
  }

  alert(`Upload complete!\nFile ID: ${fileId}`);
}