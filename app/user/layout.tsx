"use client";
import { getServerSession } from "next-auth";
import Sidebar from "../component/mainlayout";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Sidebar>{children}</Sidebar>;
}
