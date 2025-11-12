"use client";

import { useState } from "react";
import axios from "axios";

interface Options {
  a: string;
  b: string;
  c: string;
  d: string;
  answer: string;
}

export default function Admin() {
  const [image, setImage] = useState<File | null>(null);
  const [options, setOptions] = useState<Options>({
    a: "",
    b: "",
    c: "",
    d: "",
    answer: "",
  });

  const handleUpload = async () => {
    try {
      if (!image) {
        alert("Please select an image.");
        return;
      }

      const formData = new FormData();
      formData.append("image", image);

      // Upload to Cloudinary via API
      const uploadRes = await axios.post("/api/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = uploadRes.data.url;

      // Save to Prisma
      await axios.post("/api/admin/questions", {
        imageUrl,
        optionA: options.a,
        optionB: options.b,
        optionC: options.c,
        optionD: options.d,
        answer: options.answer,
      });

      alert("✅ Question added successfully!");
      setImage(null);
      setOptions({ a: "", b: "", c: "", d: "", answer: "" });
    } catch (err) {
      console.error("Error uploading question:", err);
      alert("❌ Something went wrong while uploading.");
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "500px" }}>
      <h1 className="mb-4 text-center">Admin Panel - ASL Quiz</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
        className="form-control mb-3"
      />

      {["a", "b", "c", "d", "answer"].map((key) => (
        <input
          key={key}
          type="text"
          placeholder={key.toUpperCase()}
          value={options[key as keyof Options]}
          onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
          className="form-control mb-2"
        />
      ))}

      <button className="btn btn-primary w-100" onClick={handleUpload}>
        Add Question
      </button>
    </div>
  );
}
