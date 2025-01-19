"use client";
import { useState } from "react";
import { Button, ConfigProvider, Modal, Space } from "antd";
import sarabunFont from "@/app/font/thaiSaraban";
import jsPDF from "jspdf";
import { createStyles, useTheme } from "antd-style";
import "jspdf-autotable";

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

export default function Pdf() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
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
  const pdfOnModel = (invoiceData) => {
    generatePDF();
    setIsModalVisible(true);
  };
  const invoiceData = {
    id: 300001,
    customerId: "NB0007 ",
    customerName: "บุษบาการแว่น (BUSABAKANWAEN)",
    orders: [
      {
        amount: 1700,
        collection: "2016",
        itemId: "BL3001 A10",
        piece: 1,
        price: 1700,
      },
    ],
    remark: "",
    createdAt: "2025-01-17T23:40:25.006Z",
    status: "in progress",
    total: 1700,
    edit: true,
  };
  const generatePDF = () => {
    console.log(invoiceData);
    const doc = new jsPDF();
    doc.addFileToVFS("Sarabun-Regular.ttf", sarabunFont);
    doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
    doc.setFontSize(14);
    doc.setFont("Sarabun");

    // Company Header

    doc.text("SP AUTOMATION AND SOFTWARE ENGINEER CO., LTD", 14, 20);
    doc.setFontSize(10);
    doc.text("276/36 Phetkasam 4 Watthapra Bangkokyai Bangkok 10600", 14, 25);
    doc.text("Tax ID: 0-1055-67090-24-1 (Head Office)", 14, 30);
    doc.text("Tel: 097-453-5296 | sp.automationsoftware.co@gmail.com", 14, 35);

    // Customer Details
    doc.text("Customer ID:", 14, 50);
    doc.text(invoiceData.customerId || "", 50, 50);
    doc.text("Customer Name:", 14, 55);
    doc.text(invoiceData.customerName || "", 50, 55);
    doc.text("Date:", 14, 60);
    doc.text(
      new Date(invoiceData.createdAt).toLocaleDateString() || "",
      50,
      60
    );

    // Table of Items
    doc.autoTable({
      startY: 70,
      head: [["No.", "Code", "Collection", "Unit Price", "Quantity", "Amount"]],
      body: invoiceData.orders.map((item, index) => [
        index + 1,
        item.itemId,
		item.collection,
        item.piece,
        item.price.toFixed(2),
        item.amount.toFixed(2),
      ]),
    });

    // Summary
    const finalY = doc.lastAutoTable.finalY + 10;
    const rightMargin = 200;
    const currencyWidth = doc.getTextWidth(" THB");

    doc.text("Total :", 160.5, finalY + 10);
    doc.text(
      `${invoiceData.total.toFixed(2)}`,
      rightMargin -
        doc.getTextWidth(`${invoiceData.total.toFixed(2)}`) -
        currencyWidth,
      finalY + 10
    );

    // Footer

    // Generate Blob URL for preview
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfUrl);
  };

  return (
    <div className="bg-white">
      <Button type="primary" onClick={(invoiceData) => pdfOnModel(invoiceData)}>
        Open PDF Preview
      </Button>
      <ConfigProvider
        modal={{
          classNames,
          styles: modalStyles,
        }}
      >
        <Modal
          title="Basic Modal"
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
                link.download = `Invoice_${invoiceData.customerId}.pdf`;
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
                display: pdfUrl ? "block" : "none", // Hide iframe if no PDF
              }}
            ></iframe>
            {!pdfUrl && <p>Generating PDF, please wait...</p>}
          </div>
        </Modal>
      </ConfigProvider>
    </div>
  );
}
