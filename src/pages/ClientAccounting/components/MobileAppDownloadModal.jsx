// import React from 'react'
// import { X } from 'lucide-react'

// const MobileAppDownloadModal = ({ isOpen, onClose }) => {
//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative animate-in">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
//         >
//           <X size={24} />
//         </button>

//         <div className="p-8 text-center">
//           <div className="mb-4">
//             <div className="inline-block p-3 bg-blue-100 rounded-full">
//               <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M10.5 1.5H9.5C9.05 1.5 8.5 2.05 8.5 2.5V18.5C8.5 18.95 9.05 19.5 9.5 19.5H10.5C10.95 19.5 11.5 18.95 11.5 18.5V2.5C11.5 2.05 10.95 1.5 10.5 1.5Z" />
//               </svg>
//             </div>
//           </div>

//           <h2 className="text-2xl font-bold text-gray-900 mb-2">
           
//           </h2>
//           <p className="text-gray-600 mb-6">
//             Get instant access to your accounting data on the go. Available for iOS and Android.
//           </p>

//           <div className="flex flex-col gap-3 mb-6">
          

//             <a
//               href="#"
//               className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
//             >
//               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M3.5 7.5l8.5 9 8.5-9M4 5h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2z" />
//               </svg>
//               Google Play
//             </a>
//           </div>

//           <button
//             onClick={onClose}
//             className="text-gray-600 hover:text-gray-900 font-medium transition"
//           >
//             Maybe Later
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default MobileAppDownloadModal

import React from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

const MobileAppDownloadModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null
     const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full relative animate-in overflow-hidden">
        {/* Decorative Header Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          {/* Icon Section */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-indigo-500 rounded-xl blur-lg opacity-30" />
              <div className="relative w-16 h-16 bg-linear-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.5 1H6.5C5.67 1 5 1.67 5 2.5V22c0 .83.67 1 1.5 1h11c.83 0 1.5-.17 1.5-1V2.5C19 1.67 18.33 1 17.5 1Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Header */}
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

          {/* Action Buttons */}
          <div className="space-y-2 mb-3">
             <button
              onClick={() => navigate('/login')}
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
  )
}

export default MobileAppDownloadModal ;