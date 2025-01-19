import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

-
export async function GET(request: Request) {
  const { search } = new URL(request.url).searchParams;
  if (!search) {
    return NextResponse.json([]);
  }

  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          {
            customerCode: {
              contains: search,
              mode: "insensitive", // Case-insensitive search
            },
          },
          {
            customerName: {
              contains: search,
              mode: "insensitive", // Case-insensitive search
            },
          },
        ],
      },
      select: {
        customerCode: true,
        customerName: true,
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json([], { status: 500 });
  }
}
