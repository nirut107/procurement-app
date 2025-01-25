"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useCounterStore } from "@/app/providers/app-store-provider";
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Space,
  AutoComplete,
  message,
} from "antd";

interface OrderItem {
  itemId: string;
  price: number;
  piece: number;
  collection: string;
  amount: number;
  number: number;
}

interface Item {
  searchstring: string;
  price: number;
  version: string;
}

interface Customer {
  customerCode: String;
  customerName: String;
}
interface FormValues {
  customerId: string;
  customerName: string;
  orders: OrderItem[];
  remark?: string;
  total: number;
}

function AddOrder() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [number, setNumber] = useState(0);
  const { customer, createCustomer } = useCounterStore((state) => state);
  const { item, createStock } = useCounterStore((state) => state);
  const { openOrder, setOpenOrder } = useCounterStore((state) => state);
  const { editOrder, createEditOrder } = useCounterStore((state) => state);
  const [forms] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

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
    if (status === "unauthenticated") {
      router.push("/login");
    } else {
      console.log("sesstion", session);
      const newTotal = orders.reduce(
        (sum, order) => sum + (order.amount || 0),
        0
      );
      const newNumber = orders.reduce(
        (sum, order) => sum + (order.piece || 0),
        0
      );

      setTotal(newTotal);
      setNumber(newNumber);
      if (editOrder && editOrder.edit) {
        setTotal(editOrder.total);
        setCustomerId(editOrder.customerId);
        setCustomerName(editOrder.customerName);
        setOrders(editOrder.orders);
        setNumber(editOrder.number || 0);
        const setEditFalse = { ...editOrder, edit: false };
        createEditOrder(setEditFalse);
        forms.setFieldsValue({
          customerId: editOrder.customerId + " - " + editOrder.customerName,
          orders: editOrder.orders,
          remark: editOrder.remark,
        });
      }
      if (customer.length == 0) {
        fetchCustomerData();
      }
      if (item.length == 0) {
        fetchStockData();
      }
    }
  }, [
    customer,
    item,
    customerId,
    customerName,
    orders,
    editOrder,
    createCustomer,
    createEditOrder,
    createStock,
    forms,
    status,
    router,
  ]);

  const showDrawer = () => {
    const editorder = {
      key: "",
      edit: false,
      customerId: "",
      customerName: "",
      orders: [],
      total: 0,
      number: 0,
      remark: "",
    };
    createEditOrder(editOrder);
    forms.setFieldsValue({
      customerId: "",
      customerName: "",
      orders: [],
      remark: "",
    });
    createEditOrder(editorder);
    setOpenOrder(true);
  };

  const onClose = () => {
    clearData();
  };

  //   ----------------------------- customer -------------------------
  const handleCustomerIdChange = (value: string) => {
    setCustomerId(value);
  };

  const filterCustomerData = (searchText: string) => {
    if (!customer || !searchText) {
      return [];
    }
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
    const ID = value.split("-")[0];
    const name = value.split("-")[1];
    setCustomerId(ID);
    setCustomerName(name);
  };

  //   ----------------------------- order -------------------------

  const handleOrderChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const updatedOrders = [...orders];
    updatedOrders[index] = {
      ...updatedOrders[index],
      [field]: value,
      amount:
        field === "price"
          ? (updatedOrders[index].price || 0) *
            (updatedOrders[index].piece || 0)
          : field == "piece"
          ? (updatedOrders[index].price || 0) * (value as number)
          : updatedOrders[index].amount,
    };
    forms.setFieldsValue({
      orders: updatedOrders,
    });
    setOrders(updatedOrders);
  };

  const filterOrderData = (searchText: string) => {
    return item
      ? item
          .filter(
            (product: any) =>
              searchText &&
              product.searchstring
                ?.toLowerCase()
                .includes(searchText.toLowerCase())
          )
          .map((product: any) => ({
            value: product.searchstring,
            label: product.searchstring,
          }))
      : [];
  };

  const handleOrderSelect = (value: string, index: number) => {
    const selectedItem = item.find((prod: any) => prod.searchstring === value);
    if (selectedItem) {
      const updatedOrders = [...orders];
      const currentPiece = updatedOrders[index]?.piece || 0;
      updatedOrders[index] = {
        ...updatedOrders[index],
        itemId: selectedItem.searchstring,
        price: selectedItem.price,
        piece: currentPiece === 0 ? 1 : currentPiece,
        amount:
          Number(selectedItem.price) * (currentPiece === 0 ? 1 : currentPiece),
        collection: selectedItem.version,
      };
      setOrders(updatedOrders);
      forms.setFieldsValue({
        orders: updatedOrders,
      });
    }
  };

  //   ---------------------- add order in DB -------------------------
  const { order, createOrder } = useCounterStore((state) => state);
  const key = "updatable";
  const onFinish = async (values: FormValues) => {
    if (editOrder && editOrder.id) {
      try {
        messageApi.open({
          key,
          type: "loading",
          content: "Saving",
        });
        const response = await fetch(`/api/addorder/${editOrder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: customerId,
            customerName: customerName,
            orders: values.orders,
            remark: values.remark,
            total: total,
            number: number,
          }),
        });

        if (response.ok) {
          forms.resetFields();
          clearData();
          messageApi.open({
            key,
            type: "success",
            content: "Success",
            duration: 2,
          });
          setOpenOrder(false);
        } else {
          throw new Error("Failed to submit order");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        messageApi.open({
          key,
          type: "loading",
          content: "Saving",
        });
        const response = await fetch("/api/addorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: customerId,
            customerName: customerName,
            orders: values.orders,
            remark: values.remark,
            total: total,
            number: number,
          }),
        });

        if (response.ok) {
          const responseData = await response.json();
          const newVaule = {
            ...values,
            Date: new Date(Date.now()).toLocaleDateString(),
            customerId: customerId,
            customerName: customerName,
            orders: values.orders,
            remark: values.remark,
            createdAt: responseData.createdAt,
            total: total,
            number: number,
            id: responseData.id,
            status: "IN PROGRESS",
            IdAndName: customerId + " - " + customerName,
          };
          const newOrder = [newVaule, ...order];
          createOrder(newOrder);
          forms.resetFields();
          clearData();
          messageApi.open({
            key,
            type: "success",
            content: "Success",
            duration: 2,
          });
          setOpenOrder(false);
        } else {
          throw new Error("Failed to submit order");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const clearData = () => {
    handleCustomerIdChange("");

    const clearedOrders: OrderItem[] = [];
    setOrders(clearedOrders);
    const editorder = {
      key: "",
      edit: false,
      customerId: "",
      customerName: "",
      orders: [],
      total: 0,
      number: 0,
      remark: "",
    };
    createEditOrder(editorder);

    forms.setFieldsValue({
      customerId: "",
      customerName: "",
      orders: clearedOrders,
      remark: "",
    });
    forms.resetFields();
    setOpenOrder(false);
  };
  return (
    <>
      {contextHolder}
      <Button type="primary" onClick={showDrawer} icon={<PlusOutlined />}>
        AddOrder
      </Button>
      <Drawer
        title="AddOrder"
        width={"100%"}
        onClose={onClose}
        open={openOrder}
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
            <Col span={16}>
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
          <div className="order-header pb-2 flex gap-3">
            <div className="w-5/12 font-bold">Item ID</div>
            <div className="w-3/12 font-bold">Price</div>
            <div className="w-2/12 font-bold">Quantity</div>
            <div className="w-1/12 font-bold">Amount</div>
            <div className="w-1/12"></div>
          </div>

          <Form.List name="orders" initialValue={orders}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <div key={key} className="flex gap-x-3 mb-0 p-0">
                    <div className="w-5/12">
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
                          className="m-0"
                        />
                      </Form.Item>
                    </div>
                    <div className="w-3/12">
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
                    </div>
                    <div className="w-2/12">
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
                              "piece",
                              Number(e.target.value)
                            )
                          }
                        />
                      </Form.Item>
                    </div>
                    <div className="w-1/12  text-black">
                      <Form.Item {...restField} name={[name, "amount"]}>
                        {orders[index]?.amount || 0}
                      </Form.Item>
                    </div>
                    <div className="w-1/12">
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
                        <MinusCircleOutlined className="text-2xl" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-start mt-0">
                  <Button
                    type="primary"
                    onClick={() => {
                      add();
                      const updatedOrders = [
                        ...orders,
                        {
                          itemId: "",
                          price: 0,
                          piece: 0,
                          amount: 0,
                          collection: "",
                          number: 0,
                        },
                      ];
                      setOrders(updatedOrders);
                      forms.setFieldsValue({
                        orders: updatedOrders,
                      });
                    }}
                    icon={<PlusOutlined />}
                  >
                    Add Order
                  </Button>
                </div>
              </>
            )}
          </Form.List>
          {orders.length > 0 && (
            <>
              <Row gutter={16}>
                <Col span={12}></Col>
                <Col span={4}>
                  <div>
                    <strong>Quantity</strong>
                  </div>
                </Col>
                <Col span={4}>
                  <Form.Item name="number">
                    <div>{number}</div>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}></Col>
                <Col span={4}>
                  <div>
                    <strong>Total</strong>
                  </div>
                </Col>
                <Col span={4}>
                  <Form.Item name="total">
                    <div>{total}</div>
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
          <Row gutter={16} className="mt-5">
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

export default AddOrder;
