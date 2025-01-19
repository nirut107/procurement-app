"use client";
import React, { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useCounterStore } from "@/app/providers/app-store-provider";
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  AutoComplete,
} from "antd";
import { combine } from "zustand/middleware";
import EditOrder from "./AddOrder/[id]/editOrder";

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

function eidtOrder() {
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const { customer, createCustomer } = useCounterStore((state) => state);
  const { item, createStock } = useCounterStore((state) => state);

  useEffect(() => {
    const fetchCustomerData = () => {
      fetch("/api/uploadCustomer", { method: "GET" })
        .then((response) => response.json())
        .then((customerDB) => createCustomer(customerDB))
        .catch((error) =>
          console.error("Failed to fetch customer data", error)
        );
    };
    const fetchStockData = () => {
      fetch("/api/uploadStock", { method: "GET" })
        .then((response) => response.json())
        .then((stockDB) => createStock(stockDB))
        .catch((error) => console.error("Failed to fetch stock data", error));
    };

    if (!customer) {
      fetchCustomerData();
    }
    if (!item) {
      fetchStockData();
    }
  }, [customer, item, createCustomer, createStock]);

  const [forms] = Form.useForm();
  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    clearData();
    forms.resetFields();
    setOpen(false);
  };

  //   ----------------------------- customer -------------------------
  const handleCustomerIdChange = (value: string) => {
    setCustomerId(value);
  };

  const handleCustomerNameChange = (value: string) => {
    setCustomerName(value);
  };

  const filterCustomerData = (searchText: string) => {
    return customer
      ? customer
          .filter(
            (cust: any) =>
              cust.customerCode
                .toLowerCase()
                .includes(searchText.toLowerCase()) ||
              cust.customerName.toLowerCase().includes(searchText.toLowerCase())
          )
          .map((cust: any) => ({
            value: `${cust.customerCode} - ${cust.customerName}`,
            label: `${cust.customerCode} - ${cust.customerName}`,
          }))
      : [];
  };
  const handleCustomerSelect = (value: string) => {
    const ID = value.split(" - ")[0];
    setCustomerId(ID);
    const selectedCustomer = customer.find(
      (cust: any) => cust.customerCode === ID
    );
    if (selectedCustomer) {
      setCustomerName(selectedCustomer.customerName);
    }
    console.log(ID, customerName);
  };

  //   ----------------------------- order -------------------------

  const handleOrderChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    console.log("onchange", index, field, value);
    const updatedOrders = [...orders];
    updatedOrders[index] = {
      ...updatedOrders[index],
      [field]: value,
    };
    console.log("ud", updatedOrders);
    setOrders(updatedOrders);
  };

  const filterOrderData = (searchText: string) => {
    return item
      ? item
          .filter(
            (product: any) =>
              searchText &&
              product.productcode
                ?.toLowerCase()
                .includes(searchText.toLowerCase())
          )
          .map((product: any) => ({
            value: product.productcode,
            label: product.productcode,
          }))
      : [];
  };

  const handleOrderSelect = (value: string, index: number) => {
    const selectedItem = item.find((prod: any) => prod.productcode === value);

    if (selectedItem) {
      const updatedOrders = [...orders];
      updatedOrders[index] = {
        ...updatedOrders[index],
        itemId: selectedItem.productcode,
        price: selectedItem.price,
      };
      setOrders(updatedOrders);
      forms.setFieldsValue({
        orders: updatedOrders,
      });
    }
  };

  //   ---------------------- add order in DB -------------------------
  const { order, createOrder } = useCounterStore((state) => state);
  const onFinish = async (values: FormValues) => {
    console.log("Form values: }", values, customerId, customerName);
    try {
      const response = await fetch("/api/addorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId,
          customerName: customerName,
          orders: values.orders,
          remark: values.remark,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        const newVaule = {
          ...values,
          Date: new Date(Date.now()).toLocaleDateString(),
          Customer: customerName,
          key: responseData.id,
          status: "IN PROGRESS",
        };
        const newOrder = [...order, newVaule];
        createOrder(newOrder);
		forms.resetFields();
        clearData();
        setOpen(false);
      } else {
        throw new Error("Failed to submit order");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const clearData = () => {
    handleCustomerIdChange("");
    handleCustomerNameChange("");

    const clearedOrders: OrderItem[] = [];
    setOrders(clearedOrders);

    forms.setFieldsValue({
      customerId: "",
      customerName: "",
      orders: clearedOrders,
      remark: "",
    });
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
                <AutoComplete
                  placeholder="Customer ID"
                  onChange={handleCustomerIdChange}
                  onSelect={(value) => handleCustomerSelect(value)}
                  options={filterCustomerData(customerId)}
                />
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
          <Form.List name="orders" initialValue={orders}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <Row gutter={16} key={key}>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "itemId"]}
                        rules={[
                          { required: true, message: "Please select an item" },
                        ]}
                      >
                        <AutoComplete
                          placeholder="Select Item"
                          value={orders[index]?.itemId || ""}
                          onChange={(value) =>
                            handleOrderChange(index, "itemId", value)
                          }
                          options={filterOrderData(orders[index]?.itemId || "")}
                          onSelect={(value) => handleOrderSelect(value, index)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "price"]}
                        rules={[{ required: true, message: "Enter price" }]}
                      >
                        <Input
                          type="number"
                          value={orders[index]?.price}
                          onChange={(e) =>
                            handleOrderChange(
                              index,
                              "price",
                              Number(e.target.value)
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "piece"]}
                        rules={[{ required: true, message: "Enter quantity" }]}
                      >
                        <Input
                          type="number"
                          onChange={(e) =>
                            handleOrderChange(
                              index,
                              "price",
                              Number(e.target.value)
                            )
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Button
                        type="link"
                        danger
                        onClick={() => {
                          remove(name);
                          const updatedOrders = orders.filter(
                            (_, i) => i !== index
                          );
                          setOrders(updatedOrders);
                        }}
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button
                  type="primary"
                  onClick={() => {
                    add();
                    const updatedOrders = [
                      ...orders,
                      { itemId: "", price: 0, piece: 1 },
                    ];
                    setOrders(updatedOrders);
                    forms.setFieldsValue({
                      orders: updatedOrders,
                    });
                  }}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Order
                </Button>
              </>
            )}
          </Form.List>

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
