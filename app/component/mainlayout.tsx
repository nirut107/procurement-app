"use client";
import React, { useState} from "react";
import { useRouter, usePathname } from "next/navigation";
import Avatar from "./avatar";
import {
  ContainerOutlined,
  DesktopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Space } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  { key: "order", icon: <PieChartOutlined />, label: "Order" },
  { key: "stock", icon: <DesktopOutlined />, label: "Stock" },
  { key: "customer", icon: <ContainerOutlined />, label: "Customer" },
];

const Sidebar = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const [collapsed, setCollapsed] = useState(false);
  const [bar, setBar] = useState("order");
  const router = useRouter();
  const pathname = usePathname();

  const navigateToPage = (path: string) => {
    router.push(`/user/${path}`);
    console.log(path);
    setBar(path);
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
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
            defaultSelectedKeys={[bar]}
            defaultOpenKeys={[bar]}
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
          <div className=" text-black text-2xl flex justify-start px-4 pt-4">
			
            <CrownOutlined />
            <strong>{bar}</strong>
          </div>
          {children}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
