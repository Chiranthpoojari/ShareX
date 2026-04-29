"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { deriveKey } from "@/lib/crypto";

export default function DownloadPage({
  params,
}: {
  params: { id: string };
}) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (!password) {
      alert("Enter password");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Get metadata from DB
      const { data: fileMeta, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !fileMeta) {
        alert("File not found");
        return;
      }

      // 2️⃣ Download encrypted file
      const { data: fileData, error: downloadError } =
        await supabase.storage
          .from("files")
          .download(fileMeta.path);

      if (downloadError || !fileData) {
        alert("Download failed");
        return;
      }

      const encryptedBuffer = await fileData.arrayBuffer();

      // 3️⃣ Prepare crypto inputs
      const salt = new Uint8Array(fileMeta.salt);
      const iv = new Uint8Array(fileMeta.baseiv);

      // 4️⃣ Derive key
      const key = await deriveKey(password, salt);

      // 5️⃣ Decrypt
      let decrypted;
      try {
        decrypted = await crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv,
          },
          key,
          encryptedBuffer
        );
      } catch (e) {
        alert("Wrong password or corrupted file");
        return;
      }

      // 6️⃣ Create downloadable file
      const blob = new Blob([decrypted]);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileMeta.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl mb-6">🔐 Download File</h1>

      <input
        type="password"
        placeholder="Enter password"
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 p-2 rounded bg-gray-800"
      />

      <button
        onClick={handleDownload}
        className="bg-white text-black px-6 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Decrypting..." : "Download"}
      </button>
    </div>
  );
}