"use client";
import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useCounterStore } from "@/app/providers/app-store-provider";
import { Button, Col, Drawer, Form, Input, Row, Select, Space } from "antd";
import { useRouter } from "next/navigation";

interface OrderItem {
  itemId: string;
  price: number;
  piece: number;
}

interface FormValues {
  customerId: string;
  customerName: string;
  orders: OrderItem[];
  remark?: string;
}

function EditOrder() {
  const [open, setOpen] = useState(false);
  const [forms] = Form.useForm();
  const router = useRouter();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    forms.resetFields();
  };

  //   ---------------------- add order in DB -------------------------
  const { order, createOrder } = useCounterStore((state) => state);
  const onFinish = async (values: FormValues) => {
    console.log("Form values: }", values);
    try {
      const response = await fetch("/api/addorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: values.customerId,
          customerName: values.customerName,
          orders: values.orders,
          remark: values.remark,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const newVaule = {
          ...values,
          Date: new Date(Date.now()).toLocaleDateString(),
          Customer: values.customerName,
          key: responseData.id,
          status: "in progress",
        };
        const newOrder = [...order, newVaule];
        createOrder(newOrder);
        setOpen(false);
        forms.resetFields();
      } else {
        throw new Error("Failed to submit order");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
        AddOrder
      </Button>
      <Drawer
        title="AddOrder"
        width={720}
        onClose={onClose}
        open={open}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              form="orderForm"
              key="submit"
              htmlType="submit"
              type="primary"
            >
              Submit
            </Button>
          </Space>
        }
      >
        <Form
          id="orderForm"
          form={forms}
          layout="vertical"
          hideRequiredMark
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="custumer ID"
                rules={[
                  { required: true, message: "Please enter customer ID" },
                ]}
              >
                <Input placeholder="customer ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customerName"
                label="customer name"
                rules={[
                  { required: true, message: "Please enter customer name" },
                ]}
              >
                <Input placeholder="customer name" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16} className=" pb-2">
            <Col span={8}>
              <strong>Item ID</strong>
            </Col>
            <Col span={4}>
              <strong>Price</strong>
            </Col>
            <Col span={4}>
              <strong>Piece</strong>
            </Col>
            <Col span={4}></Col>
          </Row>
          <Row gutter={16}>
            <Form.List name="orders">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row gutter={16} key={key}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "itemId"]}
                          rules={[
                            { required: true, message: "Please enter Item ID" },
                          ]}
                        >
                          <Input placeholder="Item ID" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, "price"]}
                          rules={[
                            { required: true, message: "Please enter price" },
                          ]}
                        >
                          <Input placeholder="Price" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, "piece"]}
                          rules={[
                            { required: true, message: "Please enter piece" },
                          ]}
                        >
                          <Input placeholder="Piece" type="number" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Button type="link" danger onClick={() => remove(name)}>
                          Remove
                        </Button>
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Order
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="remark" label="remark">
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </>
  );
}

export default EditOrder;
