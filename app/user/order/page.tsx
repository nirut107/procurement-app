"use client";
import { useSession } from "next-auth/react";
import OrderTable from "@/app/component/orderTable";
import AddOrder from "./AddOrder";
import { useCounterStore } from "@/app/providers/app-store-provider";
import { message } from "antd";

export default function Order() {
  const { createEditOrder } = useCounterStore((state) => state);
  const { setOpenOrder } = useCounterStore((state) => state);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: session, status } = useSession();
  console.log("session", session);
  console.log("status", status);

  const handleEditOrder = async (orderId: string) => {
    messageApi.open({
      key: "updatable",
      type: "loading",
      content: "Loading",
    });
    try {
      const response = await fetch(`/api/addorder/${orderId}`, {
        method: "GET",
      });

      if (!response.ok) {
        console.error(
          `Failed to fetch order with ID ${orderId}:`,
          response.status
        );
        messageApi.open({
          key: "updatable",
          type: "error",
          content: "can't load... plase check Internet",
          duration: 2,
        });
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
      {contextHolder}
      <div className="flex justify-end mx-4">
        <AddOrder />
      </div>
      <OrderTable onEditOrder={handleEditOrder} />
    </div>
  );
}
