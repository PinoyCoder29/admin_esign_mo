"use client";

import { useState } from "react";

export default function UploadWordQuestions() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/questionWord", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage(`Successfully uploaded ${data.totalInserted} word videos.`);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h4 className="card-title mb-3">Upload Word Question Videos</h4>
          <p className="text-muted mb-4">
            This will upload the first 100 ASL videos to Cloudinary and save
            them to the database.
          </p>

          <button
            className="btn btn-primary w-100 py-2"
            disabled={loading}
            onClick={handleUpload}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Uploading...
              </>
            ) : (
              "Upload First 100 Videos"
            )}
          </button>

          {message && (
            <div
              className={`alert mt-4 ${
                message.startsWith("Successfully")
                  ? "alert-success"
                  : "alert-danger"
              }`}
              role="alert"
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
