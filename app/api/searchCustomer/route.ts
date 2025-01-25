import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search");
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
            },
          },
          {
            customerName: {
              contains: search,
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
