import React, { useState, useRef } from "react";

const AttachmentPage = () => {
  const [attachments, setAttachments] = useState([]);
  const [remark, setRemark] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Supported file types and their icons
  const fileIcons = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    xls: "📊",
    xlsx: "📊",
    ppt: "📽️",
    pptx: "📽️",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
    txt: "📃",
    zip: "📦",
    default: "📎"
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return fileIcons[extension] || fileIcons.default;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    // File size validation (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      alert("File size too large. Maximum size is 10MB.");
      return;
    }

    // File type validation
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("File type not supported. Please upload images, PDFs, documents, or text files.");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    if (!remark.trim()) {
      alert("Please add a remark for the file.");
      return;
    }

    simulateUpload();

    // Simulate API call completion
    setTimeout(() => {
      const newAttachment = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedOn: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        remark: remark.trim(),
        url: URL.createObjectURL(file)
      };
      
      setAttachments(prev => [newAttachment, ...prev]);
      setFile(null);
      setRemark("");
      setUploadProgress(0);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 1200);
  };

  const handleDelete = (attachmentId) => {
    if (window.confirm("Are you sure you want to delete this attachment?")) {
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    }
  };

  const filteredAttachments = attachments.filter(att =>
    att.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    att.remark.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "size":
        return a.size - b.size;
      case "date":
      default:
        return new Date(b.uploadedOn) - new Date(a.uploadedOn);
    }
  });

  const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Attachments</h2>
          <p className="text-gray-600">Upload and manage project files</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="max-w-md mx-auto">
              <div className="text-4xl mb-4">📁</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop your files here
              </p>
              <p className="text-gray-500 text-sm mb-4">
                or click to browse (Max: 10MB, Supported: Images, PDF, Documents)
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>
          </div>

          {/* File Preview & Upload Controls */}
          {(file || isUploading) && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              {file && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(file.name)}</span>
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              )}

              {isUploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Add a remark or description..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isUploading}
                />
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !file || !remark.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600">
            {attachments.length} files • {formatFileSize(totalSize)} total
          </div>
          
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>
          </div>
        </div>

        {/* Attachments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredAttachments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">File</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Size</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Uploaded On</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Remark</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAttachments.map((att) => (
                    <tr key={att.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getFileIcon(att.name)}</span>
                          <span className="font-medium text-gray-800">{att.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatFileSize(att.size)}</td>
                      <td className="px-6 py-4 text-gray-600">{att.uploadedOn}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{att.remark}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <a
                            href={att.url}
                            download={att.name}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Download"
                          >
                            ⬇️
                          </a>
                          <button
                            onClick={() => handleDelete(att.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-gray-500 text-lg mb-2">
                {attachments.length === 0 ? "No attachments yet" : "No files match your search"}
              </p>
              <p className="text-gray-400 text-sm">
                {attachments.length === 0 
                  ? "Upload your first file to get started" 
                  : "Try adjusting your search terms"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentPage;