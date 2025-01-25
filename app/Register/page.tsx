"use client";
import { useRouter } from "next/navigation";
import { Button, Input, Form, Spin } from "antd";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Password from "antd/es/input/Password";

export default function Order() {
  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleOnChange = (e: any) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: any) => {
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
        <p className="text-2xl text-blue-600">Loading.........</p>
      </div>
    </div>
  ) : (
    <div className="w-full h-screen flex justify-center items-center bg-register bg-no-repeat bg-cover">
      <div className="bg-white p-10 rounded-lg shadow-md w-[350px]">
        <h2 className="text-center text-2xl font-bold mb-6 text-gray-400">
          Register
        </h2>

        <Form onSubmitCapture={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold">Email</label>
            <Input
              className="w-full"
              name="email"
              value={input.email}
              onChange={handleOnChange}
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Username</label>
            <Input
              className="w-full"
              name="name"
              value={input.name}
              onChange={handleOnChange}
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Password</label>
            <Password
              className="w-full"
              name="password"
              value={input.password}
              onChange={handleOnChange}
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="primary"
            htmlType="submit"
            className="mt-6 w-full"
            loading={loading}
          >
            Register
          </Button>
        </Form>
      </div>
    </div>
  );
}
