import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';

// Replace with the actual path to your logo image
import clientLogo from './assets/client-logo.png';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const DocumentUpload = () => {
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const MAX_FILE_SIZE = 5000000; // 5 MB
  const UPLOAD_TIMEOUT = 15000; // 15 seconds timeout

  // Functionality code here ...

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gray-100">
      {/* Logo positioned in the top-left corner */}
      <img src={clientLogo} alt="Client Logo" className="absolute top-4 left-4 w-20 h-auto" />

      <div className="w-[400px] h-[500px] bg-white rounded-lg shadow-lg p-6 overflow-hidden">
        <h2 className="text-xl font-semibold mb-4">Document Upload</h2>
        
        {/* File Upload Section and Additional Code */}
      </div>
    </div>
  );
};

export default DocumentUpload;
