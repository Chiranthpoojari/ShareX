"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/upload";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [link, setLink] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file || !password) {
      alert("Select file and enter password");
      return;
    }

    try {
      setLoading(true);
      setProgress(0);

      // Fake smooth progress (UI improvement)
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 5 : prev));
      }, 200);

      const fileId = await uploadFile(file, password);

      clearInterval(interval);
      setProgress(100);

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

      {/* Progress Bar */}
      {loading && (
        <div className="w-full max-w-md mt-4">
          <div className="w-full bg-gray-700 h-3 rounded">
            <div
              className="bg-green-500 h-3 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center mt-2">{progress}%</p>
        </div>
      )}

      {/* Share link */}
      {link && (
        <div className="w-full max-w-md mt-6">
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