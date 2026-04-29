"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/upload";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-2xl mb-4">Upload File</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <input
        type="password"
        placeholder="Password"
        className="mb-4 p-2 bg-gray-800 rounded"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-white text-black px-6 py-2 rounded"
        onClick={() => file && uploadFile(file, password)}
      >
        Upload
      </button>
    </div>
  );
}