"use client";
import "jspdf-autotable";
import React, { useEffect, useState } from "react";
import { useCounterStore } from "@/app/providers/app-store-provider";
import { Order } from "@/app/store/app-store";
import { Select, Progress, Card, ProgressProps, Segmented } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Chart from "./chart";
import Chartdata from "./chart";
import TaskMonthly from "./taskmonthly";
const { Option } = Select;

const allMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const conicColors: ProgressProps["strokeColor"] = {
  "0%": "#ffccc7",
  "50%": "#ffe58f",
  "100%": "#87d068",
};

const tasks = [
  {
    id: 1,
    name: "Product A",
    targetAmount: 100000,
    currentAmount: 450000,
    unitPrice: 100,
  },
  {
    id: 2,
    name: "Product B",
    targetAmount: 50000,
    currentAmount: 25000,
    unitPrice: 50,
  },
  {
    id: 3,
    name: "Product C",
    targetAmount: 30000,
    currentAmount: 10000,
    unitPrice: 30,
  },
];

export default function Static() {
  const { order, createOrder } = useCounterStore((state) => state);
  const [chartData, setChartData] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isLoading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  useEffect(() => {
    async function getAllOrder() {
      try {
        const response = await fetch("/api/addorder", {
          method: "GET",
        });
        if (response.ok) {
          const orders = await response.json();
          console.log(orders);
          const transferData = orders
            .map((order: Order) => ({
              key: order.id,
              id: order.id,
              Date: new Date(order.createdAt).toLocaleDateString(),
              createdAt: order.createdAt,
              customerId: order.customerId,
              customerName: order.customerName,
              orders: order.orders,
              status: order.status,
              total: order.total,
              number: order.number,
              edit: false,
              IdAndName: order.customerId + " - " + order.customerName,
            }))
            .sort((a: any, b: any) => b.id - a.id);
          createOrder(transferData);
          setLoading(false);
        } else {
          throw new Error("Cannot get order");
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (order.length == 0 && isLoading) {
      getAllOrder();
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [order, selectedYear]);

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="mb-6 text-black">
            <div className=" flex justify-around p-5">
              <Chartdata />
              <div className=" w-1/4">
                <TaskMonthly />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
