import sarabunFont from "@/app/font/thaiSaraban";
import jsPDF from "jspdf";
import { createStyles, useTheme } from "antd-style";
import "jspdf-autotable";
import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  ConfigProvider,
  Modal,
  Space,
  Popconfirm,
  MenuProps,
  Dropdown,
  Button,
} from "antd";
import { useCounterStore } from "@/app/providers/app-store-provider";
import { Order } from "../store/app-store";

// types/jspdf-autotable.d.ts

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: { finalY: number };
  }
}

interface OrderTableProps {
  onEditOrder: (id: string) => void;
}

const useStyle = createStyles(({ token }) => ({
  "my-modal-body": {
    background: token.blue1,
    padding: token.paddingSM,
  },
  "my-modal-mask": {
    boxShadow: `inset 0 0 15px #fff`,
  },
  "my-modal-header": {
    borderBottom: `1px dotted ${token.colorPrimary}`,
  },
  "my-modal-footer": {
    color: token.colorPrimary,
  },
  "my-modal-content": {
    border: "1px solid #333",
  },
}));

const OrderTable: React.FC<OrderTableProps> = ({ onEditOrder }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { order, createOrder } = useCounterStore((state) => state);
  const [isLoading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState("");
  const [Id, setId] = useState("");
  const { styles } = useStyle();
  const token = useTheme();

  const classNames = {
    body: styles["my-modal-body"],
    mask: styles["my-modal-mask"],
    header: styles["my-modal-header"],
    footer: styles["my-modal-footer"],
    content: styles["my-modal-content"],
  };

  const modalStyles = {
    header: {
      borderLeft: `5px solid ${token.colorPrimary}`,
      borderRadius: 0,
      paddingInlineStart: 5,
    },
    body: {
      boxShadow: "inset 0 0 5px #999",
      borderRadius: 5,
    },
    mask: {
      backdropFilter: "blur(10px)",
    },
    footer: {
      borderTop: "1px solid #333",
    },
    content: {
      boxShadow: "0 0 30px #999",
    },
  };

  const pdfOnModel = (invoiceData: any) => {
    console.log(invoiceData);
    generatePDF(invoiceData);
    setIsModalVisible(true);
  };

  const generatePDF = (invoiceData: any) => {
    const doc = new jsPDF();
    doc.addFileToVFS("Sarabun-Regular.ttf", sarabunFont);
    doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
    doc.setFontSize(14);
    doc.setFont("Sarabun");

    doc.text("SP AUTOMATION AND SOFTWARE ENGINEER CO., LTD", 14, 20);
    doc.setFontSize(10);
    doc.text("276/36 Phetkasam 4 Watthapra Bangkokyai Bangkok 10600", 14, 25);
    doc.text("Tax ID: 0-1055-67090-24-1 (Head Office)", 14, 30);
    doc.text("Tel: 097-453-5296 | sp.automationsoftware.co@gmail.com", 14, 35);

    doc.text("Customer ID:", 14, 50);
    doc.text(invoiceData.customerId || "", 50, 50);
    doc.text("Customer Name:", 14, 55);
    doc.text(invoiceData.customerName || "", 50, 55);
    doc.text("Date:", 14, 60);
    doc.text(invoiceData.Date || "", 50, 60);

    doc.autoTable({
      startY: 70,
      head: [["No.", "Code", "Collection", "Unit Price", "Quantity", "Amount"]],
      body: invoiceData.orders.map((item: any, index: number) => [
        index + 1,
        item.itemId,
        item.collection,
        item.price.toFixed(2),
        item.piece,
        item.amount.toFixed(2),
      ]),
    });

    if (doc.lastAutoTable) {
      const finalY = doc.lastAutoTable.finalY + 10;

      const rightMargin = 200;
      const currencyWidth = doc.getTextWidth(" THB");

      doc.text("Quantity :", 155, finalY + 10);
      doc.text(
        `${invoiceData.number}`,
        rightMargin - doc.getTextWidth(`${invoiceData.number}`) - currencyWidth,
        finalY + 10
      );
      doc.text("Total :", 160.5, finalY + 20);
      doc.text(
        `${invoiceData.total.toFixed(2)}`,
        rightMargin -
          doc.getTextWidth(`${invoiceData.total.toFixed(2)}`) -
          currencyWidth,
        finalY + 20
      );
    }

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfUrl);
  };

  const deleleOrder = async (id: number) => {
    console.log("ID", id);
    const newOrder = order.filter((e) => Number(e.id) != id);
    createOrder(newOrder);
    try {
      const response = await fetch(`/api/addorder/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
      }
    } catch (error) {
      console.log(error);
    }
  };

  const clickToDelete = (e: any) => {
    deleleOrder(e);
  };

  const clickToSetStatus = async (status: string) => {
    const updatedStatus = status;
    const updatedOrder = order.map((item) =>
      item.id === Id ? { ...item, status } : item
    );
    createOrder(updatedOrder);
    try {
      const response = await fetch(`/api/addorder/${Id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: updatedStatus }),
      });

      if (response.ok) {
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  useEffect(() => {
    async function getAllOrder() {
      try {
        const response = await fetch("/api/addorder", {
          method: "GET",
        });
        if (response.ok) {
          const orders = await response.json();
          console.log(orders);
          const transferData = orders
            .map((order: Order) => ({
              key: order.id,
              id: order.id,
              Date: new Date(order.createdAt).toLocaleDateString(),
              customerId: order.customerId,
              createdAt: order.createdAt,
              customerName: order.customerName,
              orders: order.orders,
              status: order.status,
              total: order.total,
              number: order.number,
              edit: false,
              IdAndName: order.customerId + " - " + order.customerName,
            }))
            .sort((a: any, b: any) => b.id - a.id);
          createOrder(transferData);
          console.log("data", transferData);
          setLoading(false);
        } else {
          throw new Error("Cannot get order");
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (order.length == 0 && isLoading) {
      getAllOrder();
      setLoading(false);
    }
  }, [order]);

  const statusMenu: MenuProps["items"] = [
    {
      key: "1",
      label: "IN PROGRESS",
      onClick: () => clickToSetStatus("IN PROGRESS"),
    },
    {
      key: "2",
      label: "SUCCESS",
      onClick: () => clickToSetStatus("SUCCESS"),
    },
  ];

  const columns = [
    {
      title: "Date",
      dataIndex: "Date",
      key: "Date",
    },
    {
      title: "Customer",
      dataIndex: "IdAndName",
      key: "customerName",
    },
    {
      title: "Status",
      key: "Status",
      dataIndex: "status",
      render: (tag: string) => {
        let color = "volcano";
        if (!tag) {
          return <Tag color="volcano">IN PROGRESS</Tag>;
        }
        if (tag === "success" || tag === "SUCCESS") {
          color = "green";
        }
        return <Tag color={color}>{tag.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (order: Order) => (
        <Space>
          <Button className="m-2" onClick={() => onEditOrder(order.id)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete the Order"
            description="Are you sure to delete this Order?"
            onConfirm={() => clickToDelete(order.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button>Delete</Button>
          </Popconfirm>
          <Dropdown
            menu={{ items: statusMenu }}
            placement="top"
            arrow={{ pointAtCenter: true }}
          >
            <Button className="m-2" onClick={() => setId(order.id)}>
              Set Status
            </Button>
          </Dropdown>
          <Button type="primary" onClick={() => pdfOnModel(order)}>
            Export
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={order || []}
        style={{
          marginTop: 20,
        }}
      />
      <ConfigProvider
        modal={{
          classNames,
          styles: modalStyles,
        }}
      >
        <Modal
          title="Invoice Preview"
          open={isModalVisible}
          onOk={() => setIsModalVisible(false)}
          onCancel={() => setIsModalVisible(false)}
          width={1000}
          footer={[
            <Button
              key="download"
              type="primary"
              onClick={() => {
                const link = document.createElement("a");
                link.href = pdfUrl;
                link.download = `Invoice_${Id}.pdf`;
                link.click();
              }}
            >
              Download PDF
            </Button>,
            <Button key="cancel" onClick={() => setIsModalVisible(false)}>
              Close
            </Button>,
          ]}
          style={{
            maxWidth: "90%",
            top: 20,
          }}
        >
          <div className="mt-4">
            <iframe
              src={pdfUrl || "about:blank"}
              width="100%"
              height="600px"
              style={{
                border: "1px solid #ccc",
                display: pdfUrl ? "block" : "none",
              }}
            ></iframe>
            {!pdfUrl && <p>Generating PDF, please wait...</p>}
          </div>
        </Modal>
      </ConfigProvider>
    </>
  );
};

export default OrderTable;
