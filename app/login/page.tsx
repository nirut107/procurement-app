"use client";
import { useRouter } from "next/navigation";
import { Button, Input } from "antd";

export default function Order() {
  const router = useRouter();
  const toUser = () => {
    router.push("/user/order");
  };
  return (
    <>
      <div className="w-full h-screen flex justify-center items-center flex-col ">
        <label>username</label>
        <Input className="w-[250px]" />
        <label>password</label>
        <Input className="w-[250px]" />
        <Button
          onClick={() => {
            toUser();
          }}
        >
          login
        </Button>
      </div>
    </>
  );
}
