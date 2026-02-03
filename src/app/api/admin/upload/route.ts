import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// =======================
// Cloudinary Configuration
// =======================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// =======================
// Generate 4 options including correct answer
// =======================
function generateOptions(correct: string) {
  const options = new Set<string>();
  options.add(correct);

  while (options.size < 4) {
    const randomLetter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    options.add(randomLetter);
  }

  return Array.from(options).sort(() => Math.random() - 0.5);
}

// =======================
// Upload file to Cloudinary
// =======================
async function uploadFileToCloudinary(localPath: string, folder: string) {
  return new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload(localPath, { folder }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

// =======================
// POST Handler
// =======================
export async function POST() {
  try {
    const lettersDir = path.join(process.cwd(), "public", "Letters");
    const files = fs.readdirSync(lettersDir);

    const uploaded: any[] = [];

    for (const file of files) {
      const localPath = path.join(lettersDir, file);
      const answer = path.parse(file).name.toUpperCase();
      const [optionA, optionB, optionC, optionD] = generateOptions(answer);

      // Upload to Cloudinary
      const result = await uploadFileToCloudinary(localPath, "letters");

      // Avoid duplicates
      const exists = await prisma.question.findFirst({ where: { answer } });
      if (!exists) {
        const question = await prisma.question.create({
          data: {
            imageUrl: result.secure_url,
            optionA,
            optionB,
            optionC,
            optionD,
            answer,
          },
        });
        uploaded.push(question);
      }
    }

    return NextResponse.json({
      success: true,
      message: "All letters uploaded and questions saved to DB",
      uploaded,
    });
  } catch (error: any) {
    console.error("Error uploading letters:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
