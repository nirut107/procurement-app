import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// -------------- DELETE ------------------------
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: "Valid order ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log(`Deleting order with ID: ${id}`);
    await prisma.order.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}

// --------------------------- PUT -----------------------------
export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: "Valid order ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await _request.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Request body cannot be empty" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: body,
    });

    return NextResponse.json({
      message: `Order with ID ${id} updated successfully`,
      updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// --------------------------- GET -----------------------------
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;

  if (!id || isNaN(Number(id))) {
    return NextResponse.json(
      { error: "Valid order ID is required" },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
    });

    if (!order) {
      return NextResponse.json(
        { error: `Order with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error retrieving order:", error);

    return NextResponse.json(
      { error: "Failed to retrieve order" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
