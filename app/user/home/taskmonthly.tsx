"use client";
import "jspdf-autotable";
import React, { useEffect, useState } from "react";
import { useForm } from "antd/es/form/Form";
import { useCounterStore } from "@/app/providers/app-store-provider";
import { Order } from "@/app/store/app-store";
import {
  Progress,
  Card,
  ProgressProps,
  Segmented,
  Button,
  Popover,
  Form,
  Input,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// -------- Monthpicker ---------
dayjs.extend(customParseFormat);

const conicColors: ProgressProps["strokeColor"] = {
  "0%": "#ffccc7",
  "50%": "#ffe58f",
  "100%": "#87d068",
};

const tasks = [
  {
    id: 1,
    name: "Plan A",
    targetAmount: 100000,
    currentAmount: 450000,
    unitPrice: 100,
  },
  {
    id: 2,
    name: "Plan B",
    targetAmount: 50000,
    currentAmount: 25000,
    unitPrice: 50,
  },
  {
    id: 3,
    name: "Plan C",
    targetAmount: 30000,
    currentAmount: 10000,
    unitPrice: 30,
  },
];

export default function TaskMonthly() {
  const { order } = useCounterStore((state) => state);
  const [openPopover, setOpenPopover] = useState(false);
  const [form] = useForm();

  const handleSubmit = async (values: any) => {
    try {
      const response = await fetch("/api/home/task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: dayjs(values.month).format("MM").toString(),
          year: dayjs(values.month).format("YYYY").toString(),
          goal: values.goal,
        }),
      });
      if (response.ok) {
        console.log(response.body);
		form.resetFields();
        setOpenPopover(false);
      }
    } catch {
      console.log("Can not save task");
      setOpenPopover(false);
    }
  };
  const content = (
    <Form
      form={form}
      colon={false}
      style={{ maxWidth: 700 }}
      onFinish={(vaule) => handleSubmit(vaule)}
    >
      <Form.Item label="Month" name="month" rules={[{ required: true }]}>
        <DatePicker
          picker="month"
          disabledDate={() => false}
          className="w-full"
        />
      </Form.Item>

      <Form.Item label="Goal" name="goal" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label=" ">
        <Button type="primary" htmlType="submit" className="m-1">
          Submit
        </Button>
        <Button
          type="dashed"
          onClick={() => {
            setOpenPopover(false);
          }}
        >
          Cancle
        </Button>
      </Form.Item>
    </Form>
  );

  useEffect(() => {}, [order]);

  return (
    <>
      <div className=" flex justify-end p-3">
        <Popover
          placement="bottom"
          content={content}
          trigger="click"
          open={openPopover}
        >
          <Button onClick={() => setOpenPopover(true)}>add task</Button>
        </Popover>
      </div>
      {tasks.map((task) => {
        const progress = (task.currentAmount / task.targetAmount) * 100;
        return (
          <Card key={task.id} title={task.name} bordered={true}>
            <p>Target: {task.targetAmount.toLocaleString()} units</p>
            <p>Current: {task.currentAmount.toLocaleString()} units</p>
            <p>Unit Price: ${task.unitPrice}</p>
            <Progress
              percent={Math.round(progress)}
              status={progress >= 100 ? "success" : "active"}
              strokeColor={conicColors}
            />
          </Card>
        );
      })}
    </>
  );
}
