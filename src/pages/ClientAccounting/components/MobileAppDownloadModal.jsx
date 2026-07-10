import React from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MobileAppDownloadModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full relative animate-in overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-indigo-500 rounded-xl blur-lg opacity-30" />
              <div className="relative w-16 h-16 bg-linear-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.5 1H6.5C5.67 1 5 1.67 5 2.5V22c0 .83.67 1 1.5 1h11c.83 0 1.5-.17 1.5-1V2.5C19 1.67 18.33 1 17.5 1Z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Create a new account
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                and experience the future of accounting on finger tips!
              </span>
            </h2>
            <p className="text-sm text-gray-600">
              Manage your accounting on the go, anytime, anywhere
            </p>
          </div>

          <div className="space-y-2 mb-3">
            <button
              onClick={() => navigate("/login")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-medium text-sm"
            >
              Sign Up /Login
            </button>
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppDownloadModal;
