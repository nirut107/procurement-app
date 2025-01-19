import React from "react";
import type { MenuProps } from "antd";
import { Dropdown, Avatar } from "antd";
import Image from "next/image";

const onClick: MenuProps["onClick"] = ({ key }) => {
  switch (key) {
    case "1": // Profile
      console.log("Navigating to profile...");
      // Implement your navigation logic here, e.g., using Next.js Router:
      // router.push('/profile');
      break;
    case "2": // Logout
      console.log("You have logged out successfully!");
      // Implement your logout logic here
      // e.g., clearing user data, redirecting to login page, etc.
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
const url =
  "https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg";
const UserAvatar: React.FC = () => (
  <Dropdown menu={{ items, onClick }}>
    <Avatar src={<Image src={url} width={60} height={60} alt="avatar" />} />
  </Dropdown>
);

export default UserAvatar;
