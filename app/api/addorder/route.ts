import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.order.findMany();
    return NextResponse.json(orders);
  } catch (error) {
	console.log(error)
  }
}

export async function POST(req: Request, ) {
  try {
    const body = await req.json();

    const { customerId, customerName, orders, remark, total } = body;

    const order = await prisma.order.create({
      data: {
        customerId,
        customerName,
        orders,
        remark,
		total,
      },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.log(error);
  }
}
