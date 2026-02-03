// scripts/seedLetters.ts
import { prisma } from "@/lib/prismaClient"; // <-- use relative path
import fs from "fs";
import path from "path";

async function main() {
  // Test DB connection
  try {
    const count = await prisma.question.count();
    console.log("Connected to DB. Existing Question records:", count);
  } catch (err) {
    console.error("Cannot connect to database:", err);
    process.exit(1);
  }

  const lettersFolder = path.join(process.cwd(), "public", "Letters");
  if (!fs.existsSync(lettersFolder)) {
    console.error("Letters folder not found at", lettersFolder);
    process.exit(1);
  }

  const files = fs
    .readdirSync(lettersFolder)
    .filter((f) => /\.(mp4|mov|webm)$/i.test(f));

  for (const file of files) {
    const letter = path.parse(file).name.toUpperCase();

    const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const otherOptions = allLetters
      .filter((l) => l !== letter)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const options = [letter, ...otherOptions].sort(() => 0.5 - Math.random());

    try {
      await prisma.question.create({
        data: {
          imageUrl: `/Letters/${file}`,
          optionA: options[0],
          optionB: options[1],
          optionC: options[2],
          optionD: options[3],
          answer: letter,
        },
      });
      console.log(`Inserted: ${file} -> answer: ${letter}`);
    } catch (err) {
      console.error(`Failed to insert ${file}:`, err);
    }
  }

  console.log("All videos attempted for insertion!");
}

main()
  .catch((e) => {
    console.error("Script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
