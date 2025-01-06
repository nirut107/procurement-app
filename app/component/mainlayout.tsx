"use client"
import React, { useState } from "react";
import { useRouter } from 'next/navigation'
import Avatar from "./avatar";
import {
  ContainerOutlined,
  DesktopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  { key: "order", icon: <PieChartOutlined />, label: "Order", },
  { key: "stock", icon: <DesktopOutlined />, label: "Stock" },
  { key: "customer", icon: <ContainerOutlined />, label: "Customer" },
];

const Sidebar = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const navigateToPage = (path:string) => { 
	router.push(`/user/${path}`)
  }
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      <div className="w-full bg-[#001529] flex justify-between px-4 py-2">
        <button onClick={toggleCollapsed}>
          {collapsed ? (
            <MenuUnfoldOutlined style={{ fontSize: 24, color: "white" }} />
          ) : (
            <MenuFoldOutlined style={{ fontSize: 24, color: "white" }} />
          )}
        </button>
		<div>
			<Avatar/>
		</div>
      </div>
      <div className="flex flex-wrap justify-between w-full">
        <div className=" top-10">
          <Menu
            style={{ height: "100vh" }}
			defaultSelectedKeys={["order"]}
            defaultOpenKeys={["sub1"]}
            mode="inline"
            theme="dark"
            inlineCollapsed={collapsed}
            items={items}
            subMenuCloseDelay={0}
			onClick={e=>navigateToPage(e.key)}
          />
        </div>
        {children}
      </div>
    </>
  );
};

export default Sidebar;
