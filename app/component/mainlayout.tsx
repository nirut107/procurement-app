"use client";
import React, { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Avatar from "./avatar";
import {
  ContainerOutlined,
  DesktopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  LeftSquareOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Skeleton } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  { key: "home", icon: <HomeOutlined />, label: "Home" },
  { key: "order", icon: <PieChartOutlined />, label: "Order" },
  { key: "stock", icon: <DesktopOutlined />, label: "Stock" },
  { key: "customer", icon: <ContainerOutlined />, label: "Customer" },
];

const Sidebar = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [bar, setBar] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const pathParts = pathname.split("/");
    if (pathParts[2] === "addorder" && pathParts[3]) {
      setBar(pathParts[3]);
    } else {
      setBar(pathParts[2] || "home");
    }
  }, [pathname]);

  const navigateToPage = (path: string) => {
    setBar(path);
    startTransition(() => {
      router.push(`/user/${path}`);
    });
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const ClickGoHome = () => {
    setBar("home");
    startTransition(() => {
      router.push("/user/home");
    });
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-[#001529] to-blue-900 flex justify-between px-4 py-4">
        <button onClick={toggleCollapsed}>
          {collapsed ? (
            <MenuUnfoldOutlined style={{ fontSize: 24, color: "white" }} />
          ) : (
            <MenuFoldOutlined style={{ fontSize: 24, color: "white" }} />
          )}
        </button>
        <div>
          <Avatar />
        </div>
      </div>
      <div className="flex flex-wrap justify-between w-full h-screen">
        <div
          className={`${collapsed ? "w-24" : "w-48"}
             transition-all duration-300 ease-in-out  bg-[#001529] flex justify-between px-2 py-4 top-1`}
        >
          <Menu
            selectedKeys={[bar]}
            mode="inline"
            theme="dark"
            inlineCollapsed={collapsed}
            items={items}
            subMenuCloseDelay={0}
            style={{
              transition: "width 0.05s linear",
            }}
            onClick={(e) => navigateToPage(e.key)}
          />
        </div>

        <div className=" flex-1 w-80 overflow-auto bg-white">
          <div className="bg-gray-100 text-black text-2xl flex justify-start px-4 py-3 items-center">
            <LeftSquareOutlined onClick={ClickGoHome} />
            <strong className="pl-2">{bar.toUpperCase()}</strong>
          </div>
          {isPending ? <Skeleton active className="p-10" /> : children}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
