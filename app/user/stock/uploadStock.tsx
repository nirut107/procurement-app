import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { useCounterStore } from "@/app/providers/app-store-provider";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { message, Upload } from "antd";

const { Dragger } = Upload;

export default function UploadStock() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { item, createStock } = useCounterStore((state) => state);
  const [file, setFile] = useState<File | null>(null);
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
        console.log(info.file, info.fileList);
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
    const fetchStockData = () => {
      fetch("/api/uploadStock", { method: "GET" })
        .then((response) => response.json())
        .then((stockDB) => createStock(stockDB))
        .catch((error) => console.error("Failed to fetch stock data", error));
    };
    if (status === "unauthenticated") {
      router.push("/login");
    } else {
      if (item.length == 0 || file) {
        fetchStockData();
        setIsLoaded(true);
      }
      if (item && item.length > 0) {
        setIsLoaded(true);
      }
    }
  }, [item, createStock, status, router]);

  function previewData() {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target && e.target.result instanceof ArrayBuffer) {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetNames = workbook.SheetNames;
            console.log("Sheet Names:", sheetNames);

            const workSheet = workbook.Sheets["Bolon"];
            console.log("Raw Worksheet Data:", workSheet);

            const json = XLSX.utils.sheet_to_json(workSheet, {
              raw: false,
              defval: "",
              skipHidden: true,
              range: "A1:Z1000",
            });
            const jsons = json.map((row) => {
              const cleanedRow: Record<string, any> = {};
              for (const key in row as Record<string, any>) {
                const value = (row as Record<string, any>)[key];
                if (typeof value === "string" && value.includes(",")) {
                  cleanedRow[key] = parseFloat(value.replace(/,/g, ""));
                } else {
                  cleanedRow[key] = value;
                }
              }
              return cleanedRow;
            });
            console.log("Sanitized JSON:", jsons);
            createStock(jsons);

            // Post data to the server
            const res = await fetch("/api/uploadStock", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(jsons),
            });

            if (res.ok) {
              console.log("Data successfully uploaded!");
            } else {
              console.error("Failed to upload data");
            }

            setIsLoaded(true);
          } catch (error) {
            console.error("Error processing Excel file:", error);
          }
        } else {
          console.error("File reading error: No valid result found");
        }
      };

      reader.readAsArrayBuffer(file); // Use ArrayBuffer
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
          {item && item.length > 0 && (
            <table className="w-full text-sm text-left rtl:text-right text-black">
              {/* Dynamically render the headers */}
              <thead>
                <tr>
                  {Object.keys(item[0]).map((key) => (
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
                {item.map((row: any, rowIndex: number) => (
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
