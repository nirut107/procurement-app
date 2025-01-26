"use client";
import { useRouter } from "next/navigation";
import { Button, Input, Form, Spin } from "antd";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.username,
        password: values.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push("/user/home");
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const regis = () => {
    router.push("/Register");
  };

  return loading ? (
    <div className="flex w-screen h-screen justify-center items-center text-black ">
      <div className="flex flex-col justify-center items-center gap-8">
        <Spin size="large" spinning={loading} />
        <p className="text-2xl text-blue-600">Loading.........</p>
      </div>
    </div>
  ) : (
    <div className=" w-full h-screen flex justify-center items-center bg-glasses bg-no-repeat bg-cover ">
      <div className="bg-gradient-to-r from-white to-gray-100  p-10 rounded-lg shadow-md w-[350px]">
        <h2 className="text-center text-2xl font-bold mb-6 text-gray-400">
          Login
        </h2>

        <Form form={form} onFinish={onFinish} className="flex flex-col gap-4">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input className="w-full" placeholder="Username" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password className="w-full" placeholder="Password" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="mt-6 w-full"
            loading={loading}
          >
            Login
          </Button>
        </Form>

        <Button type="link" onClick={regis} className="mt-4 text-center w-full">
          {`Don't have an account? Register`}
        </Button>
      </div>
    </div>
  );
}
