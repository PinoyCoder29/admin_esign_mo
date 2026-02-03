import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const VIDEO_DIR = path.join(process.cwd(), "public", "named_video_clean");

// Generate 4 options including correct answer
function generateOptions(correct: string, allWords: string[]) {
  const options = new Set([correct]);
  while (options.size < 4) {
    const r = allWords[Math.floor(Math.random() * allWords.length)];
    options.add(r);
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
}

// Upload video to Cloudinary
async function uploadVideo(filePath: string): Promise<{ secure_url: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { resource_type: "video", folder: "asl_videos" },
      (err, result) => {
        if (err) return reject(err);
        if (!result?.secure_url) return reject("No secure_url returned");
        resolve({ secure_url: result.secure_url });
      }
    );
  });
}

export async function POST() {
  try {
    if (!fs.existsSync(VIDEO_DIR)) {
      return NextResponse.json(
        { error: "Video folder not found" },
        { status: 404 }
      );
    }

    const files = fs
      .readdirSync(VIDEO_DIR)
      .filter((f) => /\.(mp4|webm|ogg)$/i.test(f));

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No video files found" },
        { status: 404 }
      );
    }

    // Fetch existing answers from DB
    const existingRecords = await prisma.wordQuestion.findMany({
      select: { answer: true },
    });
    const existingAnswers = new Set(existingRecords.map((r) => r.answer));

    // All words for generating options
    const allWords = files.map((f) => path.parse(f).name.toLowerCase());

    const uploadedRecords: any[] = [];

    for (const file of files) {
      const answer = path.parse(file).name.toLowerCase();

      // Skip if the answer already exists
      if (existingAnswers.has(answer)) {
        console.log(`⚠️ Skipping existing video: ${file}`);
        continue;
      }

      const videoPath = path.join(VIDEO_DIR, file);

      try {
        const [optionA, optionB, optionC, optionD] = generateOptions(
          answer,
          allWords
        );

        const uploadRes = await uploadVideo(videoPath);

        const saved = await prisma.wordQuestion.create({
          data: {
            videoUrl: uploadRes.secure_url,
            optionA,
            optionB,
            optionC,
            optionD,
            answer,
          },
        });

        uploadedRecords.push(saved);
        console.log(`✅ Uploaded: ${file}`);
      } catch (err: any) {
        console.error(`❌ Failed to upload ${file}:`, err.message || err);
        continue; // skip this file but continue with others
      }
    }

    return NextResponse.json({
      success: true,
      totalInserted: uploadedRecords.length,
      message: `✅ Successfully uploaded ${uploadedRecords.length} new videos`,
    });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
 