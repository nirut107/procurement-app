import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

type StockData = {
  __EMPTY?: string;
  __EMPTY_1?: string;
  __EMPTY_2?: string;
  __EMPTY_3?: string; // Product Code
  __EMPTY_4?: string;
  __EMPTY_5?: string;
  __EMPTY_6?: string;
  __EMPTY_7?: string;
  __EMPTY_8?: string;
  __EMPTY_16?: string; // Price
  __EMPTY_17?: string; // Stock China
  ["In PCS"]?: string; // Stock OH
};

const prisma = new PrismaClient();

export async function GET() {
  try {
    const item = await prisma.stocks.findMany();
    return NextResponse.json(item);
  } catch (error) {
    console.log(error);
  }
}

export async function POST(req: Request) {
  try {
    const dataArray: StockData[] = await req.json();
    const filteredData = dataArray.filter(
      (row) => row.__EMPTY_3 !== "Product Code" && row.__EMPTY_3 !== ""
    );
    if (!Array.isArray(filteredData)) {
      return NextResponse.json(
        { error: "Expected an array of JSON objects" },
        { status: 400 }
      );
    }
    for (const data of filteredData) {
      if (data.__EMPTY_3) {
        await prisma.stocks.upsert({
          where: {
            productcode: data.__EMPTY_3,
          },
          update: {
            price: parseFloat(data.__EMPTY_16 || "0"),
            stockoh: parseInt(data["In PCS"] || "0", 10),
            stockchina: parseInt(data.__EMPTY_17 || "0", 10),
          },
          create: {
            version: String(data.__EMPTY || ""),
            brand: String(data.__EMPTY_1 || ""),
            category: String(data.__EMPTY_2 || ""),
            productcode: String(data.__EMPTY_3 || ""),
            opccode: String(data.__EMPTY_4 || ""),
            model: String(data.__EMPTY_5 || ""),
            color: String(data.__EMPTY_6 || ""),
            colorname: String(data.__EMPTY_7 || ""),
            searchstring: String(data.__EMPTY_8 || ""),
            price: parseFloat(data.__EMPTY_16 || "0"),
            stockoh: parseInt(data["In PCS"] || "0", 10),
            stockchina: parseInt(data.__EMPTY_17 || "0", 10),
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
