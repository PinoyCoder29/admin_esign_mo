import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define a type for the expected request body
interface QuestionBody {
  imageUrl: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
}

// POST → Create Question
export async function POST(req: Request) {
  try {
    const body: QuestionBody = await req.json();

    const { imageUrl, optionA, optionB, optionC, optionD, answer } = body;

    if (!imageUrl || !optionA || !optionB || !optionC || !optionD || !answer) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: { imageUrl, optionA, optionB, optionC, optionD, answer },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error: any) {
    console.error("Create question error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET → Fetch all questions
export async function GET() {
  const questions = await prisma.question.findMany();
  return NextResponse.json(questions);
}
