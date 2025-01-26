"use client";
import "jspdf-autotable";
import React, { useEffect, useState } from "react";
import { useCounterStore } from "@/app/providers/app-store-provider";
import { Order } from "@/app/store/app-store";
import { Select, ProgressProps, Segmented } from "antd";
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
const Quarterly = ["Jan - Mar", "Apr - Jun", "Jul - Sep", "Oct - Dec"];
const Weekly = ["Week-1", "Week-2", "Week-3", "Week-4"];

const conicColors: ProgressProps["strokeColor"] = {
  "0%": "#ffccc7",
  "50%": "#ffe58f",
  "100%": "#87d068",
};

export default function Chartdata() {
  const { order } = useCounterStore((state) => state);
  const [chartData, setChartData] = useState<any[]>([]);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [option, setoption] = useState<string>("Monthly");
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toLocaleString("en-US", {
      month: "2-digit",
    })
  );

  useEffect(() => {
    processChartData(order);
  }, [order, selectedYear, selectedMonth, option]);

  const processChartData = (order: Order[]) => {
    const filteredOrders = order.filter((order) => {
      const orderYear = order.createdAt.slice(0, 4);
      const orderMonth = order.createdAt.slice(5, 7);
      return (
        order.status === "SUCCESS" &&
        orderYear === selectedYear &&
        ((option !== "Daily" && option !== "Weekly") ||
          orderMonth == selectedMonth)
      );
    });

    type ChartDataItem = {
      name: string;
      sales: number;
      orders: number;
    };

    let totalRevenue = 0;
    let totalOrders = 0;
    let formattedData: ChartDataItem[] = [];

    switch (option) {
      case "Daily":
        const daysInMonth = new Date(
          Number(selectedYear),
          Number(selectedMonth),
          0
        ).getDate();
        const dailyData: { [key: string]: { sales: number; count: number } } =
          {};

        for (let day = 1; day <= daysInMonth; day++) {
          const dayKey = day.toString().padStart(2, "0");
          dailyData[dayKey] = { sales: 0, count: 0 };
        }

        filteredOrders.forEach((order) => {
          const day = order.createdAt.slice(8, 10);
          if (dailyData[day]) {
            dailyData[day].sales += order.total;
            dailyData[day].count += 1;
          }
        });

        formattedData = Object.keys(dailyData).map((day) => ({
          name: day,
          sales: dailyData[day].sales,
          orders: dailyData[day].count,
        }));
        break;

      case "Weekly":
        const weeklyData = Weekly.reduce((acc, week) => {
          acc[week] = { sales: 0, count: 0 };
          return acc;
        }, {} as { [key: string]: { sales: number; count: number } });

        filteredOrders.forEach((order) => {
          const day = parseInt(order.createdAt.slice(8, 10));
          const weekIndex = Math.ceil(day / 7) - 1;
          weeklyData[Weekly[weekIndex]].sales += order.total;
          weeklyData[Weekly[weekIndex]].count += 1;
          totalRevenue += order.total;
          totalOrders += 1;
        });

        formattedData = Weekly.map((week) => ({
          name: week,
          sales: weeklyData[week].sales,
          orders: weeklyData[week].count,
        }));
        break;

      case "Monthly":
        const monthlyData = allMonths.reduce((acc, month) => {
          acc[month] = { sales: 0, count: 0 };
          return acc;
        }, {} as { [key: string]: { sales: number; count: number } });

        filteredOrders.forEach((order) => {
          const month = new Date(order.createdAt).toLocaleString("en-US", {
            month: "short",
          });
          monthlyData[month].sales += order.total;
          monthlyData[month].count += 1;
          totalRevenue += order.total;
          totalOrders += 1;
        });

        formattedData = allMonths.map((month) => ({
          name: month,
          sales: monthlyData[month].sales,
          orders: monthlyData[month].count,
        }));
        break;

      case "Quarterly":
        const quarterlyData = Quarterly.reduce((acc, quarter) => {
          acc[quarter] = { sales: 0, count: 0 };
          return acc;
        }, {} as { [key: string]: { sales: number; count: number } });

        filteredOrders.forEach((order) => {
          const month = parseInt(order.createdAt.slice(5, 7));
          const quarterIndex = Math.floor((month - 1) / 3);
          quarterlyData[Quarterly[quarterIndex]].sales += order.total;
          quarterlyData[Quarterly[quarterIndex]].count += 1;
          totalRevenue += order.total;
          totalOrders += 1;
        });

        formattedData = Quarterly.map((quarter) => ({
          name: quarter,
          sales: quarterlyData[quarter].sales,
          orders: quarterlyData[quarter].count,
        }));
        break;

      case "Yearly":
        const yearlyData: { [key: string]: { sales: number; count: number } } =
          {};
        filteredOrders.forEach((order) => {
          const year = order.createdAt.slice(0, 4);
          if (!yearlyData[year]) yearlyData[year] = { sales: 0, count: 0 };
          yearlyData[year].sales += order.total;
          yearlyData[year].count += 1;
          totalRevenue += order.total;
          totalOrders += 1;
        });

        formattedData = Object.keys(yearlyData).map((year) => ({
          name: year,
          sales: yearlyData[year].sales,
          orders: yearlyData[year].count,
        }));
        break;
    }
    setChartData(formattedData);
    setTotalRevenue(totalRevenue);
    setOrderCount(totalOrders);
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year > 2000; year--) {
      years.push(year);
    }
    return years;
  };

  const generateMonthOptions = () => {
    const months = [];
    for (let month = 1; month <= 12; month++) {
      let m = month < 10 ? "0" + month.toString() : month.toString();
      months.push(m);
    }
    return months;
  };

  return (
    <div className=" w-full m-3 px-8">
      <h2 className=" text-black text-2xl font-bold mb-4">Sales Overview</h2>
      <>
        <div className="mb-6 text-black">
          <label htmlFor="year-select" className="mr-4">
            Select Month && Year:
          </label>
          <Select
            id="month-select"
            value={selectedMonth}
            onChange={(value) => {
              setSelectedMonth(value.toString());
            }}
            style={{ width: 100 }}
            dropdownStyle={{ maxHeight: 400, overflowY: "auto" }}
          >
            {generateMonthOptions().map((month) => (
              <Option key={month} value={month}>
                {month}
              </Option>
            ))}
          </Select>
          <Select
            id="year-select"
            value={selectedYear}
            onChange={(value) => {
              setSelectedYear(value);
            }}
            style={{ width: 100, marginLeft: 3 }}
            dropdownStyle={{ maxHeight: 400, overflowY: "auto" }}
          >
            {generateYearOptions().map((year) => (
              <Option key={year} value={year.toString()}>
                {year}
              </Option>
            ))}
          </Select>

          <p className="text-lg font-semibold mt-2">
            Total Orders: {orderCount}
          </p>
          <p className="text-lg font-semibold">
            Total Revenue: ${totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className=" flex justify-around ">
          <div className="flex flex-col w-full justify-start border-2 rounded-b-md">
            <Segmented<string>
              options={["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"]}
              value={option}
              onChange={(value: string) => {
                setoption(value);
              }}
              className="flex m-1  "
            />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Total Sales" />
                <Bar dataKey="orders" fill="#82ca9d" name="Total Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    </div>
  );
}
