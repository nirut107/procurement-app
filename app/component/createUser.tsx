"use client";
import { useRouter } from "next/navigation";
import { Button, Input } from "antd";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Password from "antd/es/input/Password";
import { Spin } from "antd";

export default function Order() {
  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleOnChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: input.name,
          email: input.email,
          password: input.password,
        }),
      });
      if (!response.ok) {
        throw new Error("error");
      }
      const result = await signIn("credentials", {
        redirect: false,
        email: input.email,
        password: input.password,
      });
      if (result?.error) {
        console.error(result.error);
        return false;
      }
      router.push("/user/order");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <div className="flex w-screen h-screen justify-center items-center text-black">
      <div className="flex flex-col justify-center items-center gap-8">
        <Spin size="large" spinning={loading} />
        <p className=" text-2xl text-blue-600">Loading.........</p>
      </div>
    </div>
  ) : (
    <>
      <div className="w-full h-svh flex justify-center items-center flex-col ">
        <label>Username</label>
        <Input
          className="w-[250px]"
          name="name"
          value={input.name}
          onChange={handleOnChange}
        />
        <label>Email</label>
        <Input
          className="w-[250px]"
          name="email"
          value={input.email}
          onChange={handleOnChange}
        />
        <label>password</label>
        <Password
          className="w-[250px]"
          name="password"
          value={input.password}
          onChange={handleOnChange}
        />
        <Button
          onClick={(e) => {
            onSubmit(e);
          }}
        >
          Register
        </Button>
      </div>
    </>
  );
}
