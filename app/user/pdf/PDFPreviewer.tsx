import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Button, ConfigProvider, Modal, Space } from "antd";
import { createStyles, useTheme } from "antd-style";
import sarabunFont from "@/app/font/thaiSaraban";


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

const PDFPreviewer = ({ invoiceData, showModal }) => {
  const [pdfUrl, setPdfUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState([false, false]);
  const { styles } = useStyle();
  const token = useTheme();

  const toggleModal = (idx: number, target: boolean) => {
    if (target) {
      generatePDF(() => {
        setIsModalOpen((prev) => {
          prev[idx] = target;
          return [...prev];
        });
      });
    } else {
      setIsModalOpen((prev) => {
        prev[idx] = target;
        return [...prev];
      });
    }
  };

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

  const generatePDF = (callback) => {
    const doc = new jsPDF();
    doc.addFileToVFS("Sarabun-Regular.ttf", sarabunFont);
    doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
    doc.setFontSize(14);
    doc.setFont("Sarabun");
    doc.text("สวัสดีชาวโลก", 10, 10); // Thai text
    doc.save("example.pdf");

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
    if (callback) callback();
  };

  return (
    <>
      <Button type="primary" onClick={() => toggleModal(1, true)}>
        export
      </Button>
      <ConfigProvider
        modal={{
          classNames,
          styles: modalStyles,
        }}
      >
        <Modal
          title="Basic Modal"
          open={showModal}
          onOk={() => toggleModal(1, false)}
          onCancel={() => toggleModal(1, false)}
          width={1000}
          footer={[
            <Button
              key="download"
              type="primary"
              onClick={() => {
                const link = document.createElement("a");
                link.href = pdfUrl;
                link.download = `Invoice_${invoiceData.invoiceNo}.pdf`;
                link.click();
              }}
            >
              Download PDF
            </Button>,
            <Button key="cancel" onClick={() => toggleModal(1, false)}>
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
    </>
  );
};

export default PDFPreviewer;
