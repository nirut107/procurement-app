"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { MenuProps } from "antd";
import { Dropdown, Avatar } from "antd";
import Image from "next/image";

const url =
  "https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg";

const UserAvatar: React.FC = () => {
  const router = useRouter();  // Move the hook inside the component

  const onClick: MenuProps["onClick"] = ({ key }) => {
    switch (key) {
      case "1": // Profile
        console.log("Navigating to profile...");
        router.push("/profile");  // Correct placement
        break;
      case "2": // Logout
        console.log("You have logged out successfully!");
        signOut({ callbackUrl: "/login" });  // Sign out and redirect to login page
        break;
      default:
        console.error("Unhandled menu key:", key);
    }
  };

  const items: MenuProps["items"] = [
    {
      label: "Profile",
      key: "1",
    },
    {
      label: "Logout",
      key: "2",
    },
  ];

  return (
    <Dropdown menu={{ items, onClick }}>
      <Avatar src={<Image src={url} width={60} height={60} alt="avatar" />} />
    </Dropdown>
  );
};

export default UserAvatar;
