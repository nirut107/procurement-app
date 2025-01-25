import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const customer = await prisma.customer.findMany();
    return NextResponse.json(customer);
  } catch (error) {
    console.log(error);
  }
}

export async function POST(req: Request) {
  try {
    const dataArray = await req.json();
    for (const data of dataArray) {
      if (data.CODE && data.CUST__ORDER_NAME) {
        await prisma.customer.upsert({
          where: {
            customerCode: data.CODE,
          },
          update: {},
          create: {
            customerCode: String(data.CODE),
            customerName: String(data.CUST__ORDER_NAME),
            saleCode: String(data["รหัสดูแลเขต"] || ""),
            email: String(data["เมล์ผู้ติดต่อ"] || ""),
            province: String(data["จังหวัด"] || ""),
          },
        });
      }
    }

    return NextResponse.json(
      { message: "Stocks uploaded successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}
