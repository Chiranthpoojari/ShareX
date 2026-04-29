"use client";

import { supabase } from "@/lib/supabase";
import { deriveKey, getChunkIV } from "@/lib/crypto";

export default function DownloadPage({ params }: any) {
  async function download(password: string) {
    const { data } = await supabase
      .from("files")
      .select("*")
      .eq("id", params.id)
      .single();

    const salt = new Uint8Array(data.salt);
    const baseIV = new Uint8Array(data.baseiv);

    const key = await deriveKey(password, salt);

    let chunks = [];

    for (let i = 0; i < data.chunkcount; i++) {
      const { data: file } = await supabase.storage
        .from("files")
        .download(`${params.id}/${i}`);

      const encrypted = await file.arrayBuffer();
      const iv = getChunkIV(baseIV, i);

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encrypted
      );

      chunks.push(new Uint8Array(decrypted));
    }

    const blob = new Blob(chunks);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = data.filename;
    link.click();
  }

  return (
    <div className="text-white bg-black h-screen flex flex-col items-center justify-center">
      <input
        type="password"
        placeholder="Enter password"
        className="p-2 bg-gray-800 rounded"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            download((e.target as HTMLInputElement).value);
          }
        }}
      />
    </div>
  );
}