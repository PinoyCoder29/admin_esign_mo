"use client";
import { useState } from "react";

export default function UploadLetters() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/upload", { method: "POST" });
    const data = await res.json();
    setMessage(data.message);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload All Letters"}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
