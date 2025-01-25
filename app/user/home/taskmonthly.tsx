"use client";
import "jspdf-autotable";
import React, { useEffect, useState } from "react";
import { useForm } from "antd/es/form/Form";
import { useCounterStore } from "@/app/providers/app-store-provider";
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
  Empty,
  message,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Order } from "@/app/store/app-store";

// -------- Monthpicker ---------
dayjs.extend(customParseFormat);

interface Tasks {
  id: string;
  month: string;
  year: string;
  goal: number;
}

const allMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const conicColors: ProgressProps["strokeColor"] = {
  "0%": "#ffccc7",
  "50%": "#ffe58f",
  "100%": "#87d068",
};

export default function TaskMonthly() {
  const { order } = useCounterStore((state) => state);
  const [fetchtasks, setTask] = useState<Tasks[]>([]);
  const [openPopover, setOpenPopover] = useState(false);
  const [form] = useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const getTask = async () => {
    fetch("/api/home/task", { method: "GET" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch task data");
        }
        return response.json();
      })
      .then((taskData: Tasks[]) => {
        console.log("Fetched tasks:", taskData);
        setTask(taskData);
      })
      .catch((error) => console.error(error));
  };

//   --------------------- GET --------------------------
  const handleSubmit = async (values: any) => {
    messageApi.open({
      key: "updatable",
      type: "loading",
      content: "Saving",
    });
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
        getTask();
        form.resetFields();
        setOpenPopover(false);
        messageApi.open({
          key: "updatable",
          type: "success",
          content: "Success",
          duration: 2,
        });
      } else {
        throw Error("error");
      }
    } catch {
      console.log("Can not save task");
      setOpenPopover(false);
      messageApi.open({
        key: "updatable",
        type: "error",
        content: "can't save... plase check Internet",
        duration: 2,
      });
    }
  };

//   ------------------------- DETETE -------------------------
  const deleteTask = async (taskId: string) => {
    const newTask = fetchtasks.filter((e) => e.id != taskId);
    messageApi.open({
      key: "updatable",
      type: "loading",
      content: "Deleting",
    });
    try {
      const response = await fetch(`/api/home/task/${taskId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTask(newTask);
        messageApi.open({
          key: "updatable",
          type: "success",
          content: "Success",
          duration: 2,
        });
      } else {
        throw Error("error");
      }
    } catch (error) {
      messageApi.open({
        key: "updatable",
        type: "error",
        content: "can't save... plase check Internet",
        duration: 2,
      });
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

  useEffect(() => {
    getTask().then(() => console.log("fetch", fetchtasks));
    console.log(order);
  }, []);

  const calculateCurrentAmount = (task: Tasks) => {
    return order
      .filter((order) => {
        const orderDate = new Date(order.createdAt);
        const orderMonth = (orderDate.getMonth() + 1)
          .toString()
          .padStart(2, "0");
        const orderYear = orderDate.getFullYear().toString();
        return orderMonth === task.month && orderYear === task.year;
      })
      .reduce((sum, order) => {
        return sum + order.orders.reduce((acc, item) => acc + item.piece, 0);
      }, 0);
  };

  return (
    <>
      {contextHolder}
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
      {fetchtasks &&
      fetchtasks.filter((task) => {
        const currentAmount = calculateCurrentAmount(task);
        const progress = (currentAmount / task.goal) * 100;
        return progress < 100;
      }).length === 0 ? (
        <Card key="no-task" title=" " bordered={true}>
          <Empty description="No tasks available" />
        </Card>
      ) : (
        fetchtasks
          .filter((task) => {
            const currentAmount = calculateCurrentAmount(task);
            const progress = (currentAmount / task.goal) * 100;
            return progress < 100;
          })
          .map((task) => {
            const currentAmount = calculateCurrentAmount(task);
            const progress = (currentAmount / task.goal) * 100;
            return (
              <Card
                key={task.id}
                title={allMonths[Number(task.month) - 1] + " " + task.year}
                bordered={true}
              >
                <p className="my-1">Target: {task.goal} units</p>
                <div>{currentAmount.toLocaleString() + " / " + task.goal}</div>
                <Progress
                  percent={Math.round(progress)}
                  status={progress >= 100 ? "success" : "active"}
                  strokeColor={conicColors}
                />
                <Button
                  type="dashed"
                  onClick={() => deleteTask(task.id)}
                  style={{ marginTop: "10px" }}
                >
                  Delete
                </Button>
              </Card>
            );
          })
      )}
      ;
      {fetchtasks &&
        fetchtasks
          .filter((task) => {
            const currentAmount = calculateCurrentAmount(task);
            const progress = (currentAmount / task.goal) * 100;
            return progress >= 100;
          })
          .map((task) => {
            const currentAmount = calculateCurrentAmount(task);
            const progress = (currentAmount / task.goal) * 100;
            return (
              <Card
                key={task.id}
                title={allMonths[Number(task.month) - 1] + " " + task.year}
                bordered={true}
              >
                <p className="my-1">Target: {task.goal} units</p>
                <div>{currentAmount.toLocaleString() + " / " + task.goal}</div>
                <Progress
                  percent={Math.round(progress)}
                  status={progress >= 100 ? "success" : "active"}
                  strokeColor={conicColors}
                />
                <Button
                  type="dashed"
                  onClick={() => deleteTask(task.id)}
                  style={{ marginTop: "10px" }}
                >
                  Delete
                </Button>
              </Card>
            );
          })}
    </>
  );
}
