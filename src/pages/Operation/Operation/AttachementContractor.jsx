import React, { useState } from "react";
import { FaDownload, FaTrash, FaPlusCircle } from "react-icons/fa";

const AttachementContractor = () => {
  const [attachments, setAttachments] = useState([
    {
      id: 1,
      name: "Electrical - Agreement Copy.pdf",
      uploadedOn: "2025-07-08 12:32",
      size: "94.8 KB",
      remark: "Initial agreement copy",
    },
  ]);

  const [newFile, setNewFile] = useState(null);
  const [remark, setRemark] = useState("");

  const handleFileUpload = () => {
    if (!newFile) return alert("Please choose a file!");
    const newAttachment = {
      id: Date.now(),
      name: newFile.name,
      uploadedOn: new Date().toLocaleString(),
      size: `${(newFile.size / 1024).toFixed(1)} KB`,
      remark,
    };
    setAttachments([...attachments, newAttachment]);
    setNewFile(null);
    setRemark("");
  };

  const handleDelete = (id) =>
    setAttachments(attachments.filter((file) => file.id !== id));

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Attachments</h2>

      <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
        <input
          type="file"
          onChange={(e) => setNewFile(e.target.files[0])}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:w-1/3"
        />
        <input
          type="text"
          placeholder="Enter remark (optional)"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:w-1/3"
        />
        <div className="erp-root">
          <button
            onClick={handleFileUpload}
            className="app-btn-primary flex items-center gap-2"
          >
            <FaPlusCircle /> Upload
          </button>
        </div>
      </div>

      <table className="min-w-full border border-gray-200 text-sm text-left">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 border">File Name</th>
            <th className="px-4 py-2 border">Uploaded On</th>
            <th className="px-4 py-2 border">Size</th>
            <th className="px-4 py-2 border">Remark</th>
            <th className="px-4 py-2 border text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {attachments.map((file) => (
            <tr key={file.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{file.name}</td>
              <td className="px-4 py-2 border">{file.uploadedOn}</td>
              <td className="px-4 py-2 border">{file.size}</td>
              <td className="px-4 py-2 border">{file.remark}</td>
              <td className="px-4 py-2 border text-center space-x-3">
                <button className="text-green-600 hover:text-green-800">
                  <FaDownload />
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
          {attachments.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-gray-500 py-4">
                No attachments available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttachementContractor;
