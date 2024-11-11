import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const DocumentUpload = () => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const MAX_FILE_SIZE = 5000000; // 5 MB
  const UPLOAD_TIMEOUT = 15000; // 15 seconds timeout

  const handleAddFile = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter(
      (file) => file.type === "application/pdf"
    );

    const fileChecks = await Promise.all(
      validFiles.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) {
          return {
            file,
            status: "error",
            message: "File size exceeds the 5 MB limit.",
          };
        }
        if (!filePassedAntivirusCheck(file)) {
          return {
            file,
            status: "error",
            message: "Malware detected. Upload aborted.",
          };
        }
        const isCorrupted = await checkForCorruption(file);
        if (isCorrupted) {
          return {
            file,
            status: "error",
            message: "File appears to be corrupted.",
          };
        }
        return { file, status: "ready", message: "File is ready for upload." };
      })
    );

    setFiles((prevFiles) => [...prevFiles, ...fileChecks]);
  };

  const checkForCorruption = async (file) => {
    try {
      await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
      return false;
    } catch (error) {
      return true;
    }
  };

  const filePassedAntivirusCheck = (file) => {
    return Math.random() > 0.2; // Increased to 20% chance of failing antivirus check
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setSelectedFiles((prevSelected) => prevSelected.filter((i) => i !== index));
  };

  const handleSelectFile = (index) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((i) => i !== index)
        : [...prevSelected, index]
    );
  };

  const handleUploadFile = async (fileIndex) => {
    const fileToUpload = files[fileIndex];
    if (fileToUpload.status !== "ready") return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          const randomOutcome = Math.random();
          if (randomOutcome < 0.1) {
            reject(new Error("Upload error occurred"));
          } else if (randomOutcome < 0.2) {
            reject(new Error("Server error"));
          } else {
            resolve();
          }
        }, 2000);
      });
      clearTimeout(timeoutId);

      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[fileIndex] = {
          ...fileToUpload,
          status: "success",
          message: "File uploaded successfully!",
        };
        return updatedFiles;
      });
    } catch (error) {
      clearTimeout(timeoutId);
      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles];
        updatedFiles[fileIndex] = {
          ...fileToUpload,
          status: "error",
          message:
            error.name === "AbortError" ? "Upload timed out." : error.message,
        };
        return updatedFiles;
      });
    }
  };

  const handleUploadSelectedFiles = () => {
    selectedFiles.forEach((index) => handleUploadFile(index));
    setSelectedFiles([]);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-[400px] h-[420px] bg-white rounded-lg shadow-lg p-6 overflow-hidden">
        <h2 className="text-xl font-semibold mb-4">Document Upload</h2>

        <label className="cursor-pointer inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 mb-4">
          Click Here To Upload PDF Files
          <input
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleAddFile}
            className="hidden"
          />
        </label>

        {files.length > 0 && (
          <div className="h-[250px] overflow-y-auto space-y-2 border rounded-lg p-2 bg-gray-50 text-xs">
            {files.map(({ file, status, message }, index) => (
              <div
                key={index}
                className={`p-2 rounded flex items-center ${
                  status === "error"
                    ? "bg-red-100 text-red-500"
                    : status === "success"
                    ? "bg-green-100 text-green-500"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={status !== "ready"}
                  checked={selectedFiles.includes(index)}
                  onChange={() => handleSelectFile(index)}
                  className="mr-2"
                />
                <div className="flex-grow">
                  <p className="truncate font-semibold">{file.name}</p>
                  <p className="mt-1">{message}</p>
                </div>
                <button
                  onClick={() => handleUploadFile(index)}
                  disabled={status !== "ready"}
                  className={`ml-2 mr-1 text-blue-500 hover:text-blue-700 ${
                    status !== "ready" ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  ⬆️
                </button>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:text-red-700 text-xs ml-2"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && (
          <button
            onClick={handleUploadSelectedFiles}
            className="mt-4 px-3 py-1 w-full bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={selectedFiles.length === 0}
          >
            Upload Selected Files
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
