import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
console.log(id);
  if (!id) {
    return NextResponse.json(
      { error: "Valid order ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log(`Deleting order with ID: ${id}`);
    await prisma.task.delete({
      where: { id: id },
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
