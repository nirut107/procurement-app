"use client";
import { useSession } from "next-auth/react";
import OrderTable from "@/app/component/orderTable";
import AddOrder from "./AddOrder";
import { useCounterStore } from "@/app/providers/app-store-provider";

export default function Order() {
  const { createEditOrder } = useCounterStore((state) => state);
  const { setOpenOrder } = useCounterStore((state) => state);
  const { data: session, status } = useSession();
  console.log("session", session);
  console.log("status", status);

  const handleEditOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/addorder/${orderId}`, {
        method: "GET",
      });

      if (!response.ok) {
        console.error(
          `Failed to fetch order with ID ${orderId}:`,
          response.status
        );
        return;
      }

      const order = await response.json();
      console.log("Fetched Order:", order);

      const setEditTrue = { ...order, edit: true };
      createEditOrder(setEditTrue);
      setOpenOrder(true);
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  };

  return (
    <div className=" bg-gray-100">
      <div className="flex justify-end mx-4">
        <AddOrder />
      </div>
      <OrderTable onEditOrder={handleEditOrder} />
    </div>
  );
}
