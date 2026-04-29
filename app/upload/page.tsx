"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/upload";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file || !password) {
      alert("Select file and enter password");
      return;
    }

    try {
      setLoading(true);

      const fileId = await uploadFile(file, password);

      const shareLink = `${window.location.origin}/download/${fileId}`;
      setLink(shareLink);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl mb-6">🐼 PandaShare</h1>

      {/* File input */}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      {/* Password */}
      <input
        type="password"
        placeholder="Enter password"
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 p-2 rounded bg-gray-800"
      />

      {/* Upload button */}
      <button
        onClick={handleUpload}
        className="bg-white text-black px-6 py-2 rounded mb-4"
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload Securely"}
      </button>

      {/* Share link */}
      {link && (
        <div className="w-full max-w-md mt-4">
          <p className="mb-2">Share this link:</p>

          <input
            value={link}
            readOnly
            className="w-full p-2 text-black rounded"
          />

          <button
            className="mt-2 bg-green-500 px-4 py-2 rounded"
            onClick={() => {
              navigator.clipboard.writeText(link);
              alert("Copied!");
            }}
          >
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
}