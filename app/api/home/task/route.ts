import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.task.findMany();
    return NextResponse.json(orders);
  } catch (error) {
    console.log(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body);
    if (!body || !body.month || !body.year || !body.goal) {
      throw new Error("Invalid request body: Missing required fields");
    }

    const month = body.month;
    const year = body.year;
    const goal = parseInt(body.goal, 10);

    if (isNaN(goal)) {
      throw new Error("Goal must be a valid integer");
    }
    const task = await prisma.task.create({
      data: { month, year, goal },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
