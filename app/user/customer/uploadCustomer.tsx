"use client";
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCounterStore } from "@/app/providers/app-store-provider";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { message, Upload } from "antd";

const { Dragger } = Upload;

export default function UploadCustomer() {
  // file
  const [file, setFile] = useState<File | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { customer, createCustomer } = useCounterStore((state) => state);
  const { data: session, status } = useSession();
  const router = useRouter();

  const draggerProps: UploadProps = {
    name: "file",
    beforeUpload(file) {
      setFile(file);
      return false;
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log("file", info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
      previewData();
    },
    onDrop(e) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  useEffect(() => {
    const fetchCustomerData = () => {
      fetch("/api/uploadCustomer", { method: "GET" })
        .then((response) => response.json())
        .then((customerDB) => createCustomer(customerDB))
        .catch((error) =>
          console.error("Failed to fetch customer data", error)
        );
    };
	console.log("session",session)
    if (status === "unauthenticated") {
      router.push("/login");
    } else {
      if (customer.length == 0 || file) {
        setIsLoaded(false);
        fetchCustomerData();
        setIsLoaded(true);
      }
      if (customer && customer.length > 0) {
        setIsLoaded(true);
      }
    }
  }, [customer, file, createCustomer, status, router]);

  function previewData() {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          console.log("SN", sheetName);
          const workSheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(workSheet);
		  
          const sanitized = json.map((obj) => {
            const sanitizedObj : Record<string, any> = {};
            for (const key in obj as Record<string, any>) {
              const sanitizedKey = key.replace(/[.\s]/g, "_");
              sanitizedObj[sanitizedKey] = (obj as Record<string, any>)[key];
            }
            return sanitizedObj;
          });
          console.log(sanitized);
          createCustomer(sanitized);
          try {
            const res = await fetch("/api/uploadCustomer", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(sanitized),
            });

            if (res.ok) {
              console.log("Data successfully uploaded!");
            } else {
              console.error("Failed to upload data");
            }
            setIsLoaded(true);
          } catch (error) {
            console.error("Error:", error);
          }
        }
      };
      reader.readAsBinaryString(file);
    }
  }
  return (
    <div className="py-8 space-y-8">
      <Dragger {...draggerProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
      </Dragger>
      {!isLoaded ? (
        <p>Saving Data please wait...</p>
      ) : (
        <div className="relative overflow-x-auto">
          {customer && customer.length > 0 && (
            <table className="w-full text-sm text-left rtl:text-right text-black">
              {/* Dynamically render the headers */}
              <thead>
                <tr>
                  {Object.keys(customer[0]).map((key) => (
                    <th
                      key={key}
                      scope="col"
                      className="px-6 py-4 bg-gray-200 dark:bg-gray-700 dark:text-white"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customer.map((row: any, rowIndex: number) => (
                  <tr
                    key={rowIndex}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 font-medium whitespace-nowrap dark:text-white"
                  >
                    {Object.keys(row).map((key) => (
                      <td key={key} className="px-6 py-4">
                        {row[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
