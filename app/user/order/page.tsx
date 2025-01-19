"use client";
import { useSession } from "next-auth/react";
import OrderTable from "@/app/component/orderTable";
import React, { Key, useState } from "react";
import { useRouter } from "next/navigation";
import AddOrder from "./AddOrder";
import { useCounterStore } from "@/app/providers/app-store-provider";

export default function Order() {
  const { editOrder, createEditOrder } = useCounterStore((state) => state);
  const { openOrder, setOpenOrder } = useCounterStore((state) => state);
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log("session", session);
  console.log("status", status);
  const handleEditOrder = async (orderId) => {
    console.log("orderID", orderId);
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
    <div>
      <div className="flex justify-end mx-4">
        <AddOrder />
      </div>
      <OrderTable onEditOrder={handleEditOrder} />
    </div>
  );
}
