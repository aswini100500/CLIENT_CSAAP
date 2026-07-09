// import React, { useState } from 'react';
// import { Search, Filter, Mail, Phone, Edit, Trash2, Download, Send } from 'lucide-react';

// const SelectedCandidate = () => {
//   const [candidates, setCandidates] = useState([
//     {
//       id: 1,
//       appliedFor: 'Software Developer',
//       name: 'John Doe',
//       contactNo: '123-456-7890',
//       mailId: 'john.doe@example.com',
//       gender: 'Male',
//       status: 'Selected',
//       applicationDate: '2023-10-15'
//     },
//     {
//       id: 2,
//       appliedFor: 'UX Designer',
//       name: 'Jane Smith',
//       contactNo: '098-765-4321',
//       mailId: 'jane.smith@example.com',
//       gender: 'Female',
//       status: 'Selected',
//       applicationDate: '2023-10-16'
//     },
//     {
//       id: 3,
//       appliedFor: 'Project Manager',
//       name: 'Robert Johnson',
//       contactNo: '555-123-4567',
//       mailId: 'robert.j@example.com',
//       gender: 'Male',
//       status: 'Offer Sent',
//       applicationDate: '2023-10-17'
//     },
//     {
//       id: 4,
//       appliedFor: 'Software Developer',
//       name: 'Emily Davis',
//       contactNo: '444-987-6543',
//       mailId: 'emily.d@example.com',
//       gender: 'Female',
//       status: 'Selected',
//       applicationDate: '2023-10-18'
//     },
//     {
//       id: 5,
//       appliedFor: 'Data Analyst',
//       name: 'Michael Wilson',
//       contactNo: '777-555-1234',
//       mailId: 'michael.w@example.com',
//       gender: 'Male',
//       status: 'Offer Accepted',
//       applicationDate: '2023-10-19'
//     },
//     {
//       id: 6,
//       appliedFor: 'QA Engineer',
//       name: 'Sarah Brown',
//       contactNo: '333-222-1111',
//       mailId: 'sarah.b@example.com',
//       gender: 'Female',
//       status: 'Selected',
//       applicationDate: '2023-10-20'
//     }
//   ]);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('All');
//   const [genderFilter, setGenderFilter] = useState('All');

//   // Filter candidates based on search term and filters
//   const filteredCandidates = candidates.filter(candidate => {
//     const matchesSearch = 
//       candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       candidate.appliedFor.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       candidate.mailId.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesStatus = statusFilter === 'All' || candidate.status === statusFilter;
//     const matchesGender = genderFilter === 'All' || candidate.gender === genderFilter;
    
//     return matchesSearch && matchesStatus && matchesGender;
//   });

//   // Handle delete candidate
//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to remove this candidate from the selected list?')) {
//       setCandidates(candidates.filter(candidate => candidate.id !== id));
//     }
//   };

//   // Handle send offer
//   const handleSendOffer = (candidate) => {
//     // In a real application, this would trigger an email or notification
//     alert(`Offer will be sent to ${candidate.name} at ${candidate.mailId}`);
//   };

//   // Handle download details
//   const handleDownload = (candidate) => {
//     // In a real application, this would generate a PDF or download data
//     alert(`Downloading details for ${candidate.name}`);
//   };

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Selected Candidates</h2>
//           <p className="text-gray-600 mb-6">Manage candidates who have been selected for various positions</p>
          
//           {/* Search and Filter Section */}
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//             <div className="relative flex-1">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Search className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search candidates by name, position or email..."
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
            
//             <div className="flex flex-wrap gap-3">
//               <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
//                 <Filter className="h-4 w-4 text-gray-400 mr-2" />
//                 <select
//                   className="bg-transparent focus:outline-none text-sm"
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                 >
//                   <option value="All">All Status</option>
//                   <option value="Selected">Selected</option>
//                   <option value="Offer Sent">Offer Sent</option>
//                   <option value="Offer Accepted">Offer Accepted</option>
//                 </select>
//               </div>
              
//               <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
//                 <Filter className="h-4 w-4 text-gray-400 mr-2" />
//                 <select
//                   className="bg-transparent focus:outline-none text-sm"
//                   value={genderFilter}
//                   onChange={(e) => setGenderFilter(e.target.value)}
//                 >
//                   <option value="All">All Genders</option>
//                   <option value="Male">Male</option>
//                   <option value="Female">Female</option>
//                 </select>
//               </div>
//             </div>
//           </div>
          
//           {/* Results Count */}
//           <div className="mb-4">
//             <p className="text-sm text-gray-600">
//               Showing {filteredCandidates.length} of {candidates.length} candidates
//             </p>
//           </div>
          
//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Applied For
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Contact
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Email
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Gender
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredCandidates.length > 0 ? (
//                   filteredCandidates.map((candidate) => (
//                     <tr key={candidate.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">{candidate.appliedFor}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center text-sm text-gray-500">
//                           <Phone size={14} className="mr-1" />
//                           {candidate.contactNo}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center text-sm text-gray-500">
//                           <Mail size={14} className="mr-1" />
//                           {candidate.mailId}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{candidate.gender}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
//                           ${candidate.status === 'Selected' ? 'bg-blue-100 text-blue-800' : 
//                             candidate.status === 'Offer Sent' ? 'bg-yellow-100 text-yellow-800' : 
//                             'bg-green-100 text-green-800'}`}>
//                           {candidate.status}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <div className="flex items-center space-x-3">
//                           <button 
//                             onClick={() => handleSendOffer(candidate)}
//                             className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
//                             title="Send Offer"
//                           >
//                             <Send size={16} />
//                           </button>
//                           <button 
//                             onClick={() => handleDownload(candidate)}
//                             className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
//                             title="Download Details"
//                           >
//                             <Download size={16} />
//                           </button>
//                           <button 
//                             onClick={() => handleDelete(candidate.id)}
//                             className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
//                             title="Remove Candidate"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
//                       No candidates found matching your search criteria
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
          
//           {/* Pagination (optional) */}
//           {filteredCandidates.length > 0 && (
//             <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
//               <div className="text-sm text-gray-700">
//                 Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredCandidates.length}</span> of{' '}
//                 <span className="font-medium">{filteredCandidates.length}</span> results
//               </div>
//               <div className="flex space-x-2">
//                 <button
//                   disabled
//                   className="px-3 py-1 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
//                 >
//                   Previous
//                 </button>
//                 <button
//                   className="px-3 py-1 rounded-md bg-blue-600 text-white"
//                 >
//                   1
//                 </button>
//                 <button
//                   disabled
//                   className="px-3 py-1 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SelectedCandidate;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Search, Filter, Mail, Phone, Send, Download, Trash2 } from 'lucide-react';

// const SelectedCandidate = () => {
//   const [candidates, setCandidates] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch selected candidates from the API
//   const fetchCandidates = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('http://localhost:5000/api/applicant/getselectedCandidates/all');
//       console.log('API Response:', response.data);

//       // Extract candidates from response.data.data and map fields
//       const data = Array.isArray(response.data.data)
//         ? response.data.data.map(candidate => ({
//             id: candidate.id,
//             candidate_id: candidate.candidate_id,
//             name: candidate.name,
//             mailId: candidate.email, // Map email to mailId
//             contactNo: candidate.phone, // Map phone to contactNo
//             status: candidate.status,
//             applicationDate: candidate.selected_at,
//             appliedFor: candidate.position|| 'N/A', // Default if not provided
//             gender: candidate.gender || 'N/A' // Default if not provided
//           }))
//         : [];
//       setCandidates(data);
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching candidates:', err);
//       setError('Failed to fetch candidates');
//       setCandidates([]);
//       setLoading(false);
//     }
//   };

//   // Fetch candidates on component mount
//   useEffect(() => {
//     fetchCandidates();
//   }, []);

//   // Filter candidates based on search term and status
// const filteredCandidates = Array.isArray(candidates)
//     ? candidates.filter(candidate => {
//         const matchesSearch =
//           (candidate.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
//           (candidate.appliedFor?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
//           (candidate.mailId?.toLowerCase() || '').includes(searchTerm.toLowerCase());

//         const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;

//         return matchesSearch && matchesStatus;
//       })
//     : [];

//   // Handle delete candidate
//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to remove this candidate from the selected list?')) {
//       try {
//         await axios.delete(`http://localhost:5000/api/applicant/remove/${id}`);
//         setCandidates(candidates.filter(candidate => candidate.id !== id));
//       } catch (err) {
//         console.error('Error deleting candidate:', err);
//         alert('Failed to delete candidate');
//       }
//     }
//   };

//   // Handle send offer
//   const handleSendOffer = async (candidate) => {
//     try {
//       await axios.put(`http://localhost:5000/api/applicant/update/${candidate.id}`, {
//         ...candidate,
//         status: 'offer sent' // Match API's lowercase status
//       });
//       alert(`Offer sent to ${candidate.name} at ${candidate.mailId}`);
//       fetchCandidates(); // Refresh candidates
//     } catch (err) {
//       console.error('Error sending offer:', err);
//       alert('Failed to send offer');
//     }
//   };

//   // Handle download details
//   const handleDownload = (candidate) => {
//     alert(`Downloading details for ${candidate.name}`);
//   };

//   if (loading) {
//     return <div className="p-6 text-center">Loading...</div>;
//   }

//   if (error) {
//     return <div className="p-6 text-center text-red-500">{error}</div>;
//   }

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Selected Candidates</h2>
//           <p className="text-gray-600 mb-6">Manage candidates who have been selected for various positions</p>

//           {/* Search and Filter Section */}
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
//             <div className="relative flex-1">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Search className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search candidates by name, position or email..."
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>

//             <div className="flex flex-wrap gap-3">
//               <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
//                 <Filter className="h-4 w-4 text-gray-400 mr-2" />
//                 <select
//                   className="bg-transparent focus:outline-none text-sm"
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                 >
//                   <option value="all">All Status</option>
//                   <option value="selected">Selected</option>
//                   <option value="offer sent">Offer Sent</option>
//                   <option value="offer accepted">Offer Accepted</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Results Count */}
//           <div className="mb-4">
//             <p className="text-sm text-gray-600">
//               Showing {filteredCandidates.length} of {candidates.length || 0} candidates
//             </p>
//           </div>

//           {/* Table */}
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Applied For
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Contact
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Email
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {filteredCandidates.length > 0 ? (
//                   filteredCandidates.map((candidate) => (
//                     <tr key={candidate.id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">{candidate.appliedFor}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center text-sm text-gray-500">
//                           <Phone size={14} className="mr-1" />
//                           {candidate.contactNo}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center text-sm text-gray-500">
//                           <Mail size={14} className="mr-1" />
//                           {candidate.mailId}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span
//                           className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                             candidate.status === 'selected'
//                               ? 'bg-blue-100 text-blue-800'
//                               : candidate.status === 'offer sent'
//                               ? 'bg-yellow-100 text-yellow-800'
//                               : 'bg-green-100 text-green-800'
//                           }`}
//                         >
//                           {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <div className="flex items-center space-x-3">
//                           <button
//                             onClick={() => handleSendOffer(candidate)}
//                             className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
//                             title="Send Offer"
//                           >
//                             <Send size={16} />
//                           </button>
//                           <button
//                             onClick={() => handleDownload(candidate)}
//                             className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
//                             title="Download Details"
//                           >
//                             <Download size={16} />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(candidate.id)}
//                             className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
//                             title="Remove Candidate"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
//                       No candidates found matching your search criteria
//                     </td>
//                     <td>
//                       + Add Interview Report
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination (optional) */}
//           {filteredCandidates.length > 0 && (
//             <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
//               <div className="text-sm text-gray-700">
//                 Showing <span className="font-medium">1</span> to{' '}
//                 <span className="font-medium">{filteredCandidates.length}</span> of{' '}
//                 <span className="font-medium">{filteredCandidates.length}</span> results
//               </div>
//               <div className="flex space-x-2">
//                 <button
//                   disabled
//                   className="px-3 py-1 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
//                 >
//                   Previous
//                 </button>
//                 <button className="px-3 py-1 rounded-md bg-blue-600 text-white">1</button>
//                 <button
//                   disabled
//                   className="px-3 py-1 rounded-md bg-gray-200 text-gray-400 cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SelectedCandidate;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, Mail, Phone, Send, Download, Trash2, FilePlus2 } from "lucide-react";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const SelectedCandidate = () => {
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
    console.log("Current user:", user);
    const id = user.company_id
    console.log(id);
    
    
  // Fetch selected candidates from API
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      // const response = await axios.get("http://localhost:5000/api/applicant/getselectedCandidates/all");
       const response = await axios.get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/getSelectedCandidatesByCompany/${id}`);

       console.log(response);
       console.log("hii");
       
      const data = Array.isArray(response.data.data)
        ? response.data.data.map((c) => ({
            id: c.id,
            candidate_id: c.candidate_id,
            name: c.name,
            mailId: c.email,
            contactNo: c.phone,
            status: c.status,
            appliedFor: c.position || "N/A",
            gender: c.gender || "N/A",
            resume_url: c.resume_url || null,
            selectedAt: c.selected_at,
          }))
        : [];
      setCandidates(data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Failed to fetch candidates. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.appliedFor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mailId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ Handle sending offer
  const handleSendOffer = async (candidate) => {
    console.log(candidate);
    
    const confirm = await Swal.fire({
      title: "Send Offer?",
      text: `Do you want to send an offer to ${candidate.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      confirmButtonText: "Yes, send it!",
    });
    if (!confirm.isConfirmed) return;

    try {
   await axios.put(
  `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/update/${id}/${candidate.candidate_id}`,
  { status: "offer_sent" }
);

console.log(confirm);

      Swal.fire("Offer Sent!", `Offer sent to ${candidate.name}`, "success");
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidate.id ? { ...c, status: "offer_sent" } : c))
      );
    } catch (err) {
      Swal.fire("Error", "Failed to send offer.", "error");
    }
  };

  // ✅ Handle deleting candidate
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Remove Candidate?",
      text: "This will remove the candidate from the list.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, remove",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/remove/${id}`);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      Swal.fire("Removed!", "Candidate has been removed.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to delete candidate.", "error");
    }
  };

  // ✅ Handle download details (as PDF)
  const handleDownload = async (candidate) => {
    const content = `
Candidate Details
-------------------------
Name: ${candidate.name}
Position: ${candidate.appliedFor}
Email: ${candidate.mailId}
Phone: ${candidate.contactNo}
Gender: ${candidate.gender}
Status: ${candidate.status}
Selected Date: ${candidate.selectedAt || "N/A"}
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${candidate.name}_details.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ✅ Add Interview Report
  const handleAddReport = (id) => {
    window.location.href = `/add-interview-report/${id}`;
  };

  if (loading)
    return <div className="p-10 text-center text-gray-600 text-lg font-medium">Loading candidates...</div>;

  if (error)
    return <div className="p-10 text-center text-red-600 text-lg font-medium">{error}</div>;

  return (
    <div className="">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Selected Candidates</h2>
          <p className="text-gray-500 mb-6">
            Manage candidates selected for various roles
          </p>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, position or email..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <select
                className="bg-transparent text-sm focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="selected">Selected</option>
                <option value="offer_sent">Offer Sent</option>
                <option value="offer accepted">Offer Accepted</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Applied For", "Name", "Contact", "Email", "Status", "Resume", "Actions"].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{candidate.appliedFor}</td>
                      <td className="px-6 py-3 font-medium text-gray-800">{candidate.name}</td>
                     {/* Contact */}
<td className="px-6 py-3 text-gray-600">
  <div className="flex items-center">
    <Phone size={14} className="mr-2 text-gray-500" />
    {candidate.contactNo}
  </div>
</td>

{/* Email */}
<td className="px-6 py-3 text-gray-600">
  <div className="flex items-center">
    <Mail size={14} className="mr-2 text-gray-500" />
    {candidate.mailId}
  </div>
</td>

{/* Status */}
<td className="px-6 py-3">
  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
    ${candidate.status === 'selected' ? 'bg-blue-100 text-blue-800' : 
      candidate.status === 'offer_sent' ? 'bg-yellow-100 text-yellow-800' : 
      'bg-green-100 text-green-800'}`}>
    {candidate.status && candidate.status.toUpperCase()}
  </span>
</td>

{/* Resume */}
<td className="px-6 py-3">
  {candidate.resume_url ? (
    <a
      href={`${import.meta.env.VITE_HRMS_BASE_URL}/uploads/${candidate.resume_url}`}
      download
      className="inline-flex items-center justify-center text-green-600 hover:text-green-800"
      title="Download Resume"
    >
      <Download size={18} />
    </a>
  ) : (
    <span className="text-gray-400 text-xs">N/A</span>
  )}
</td>

                      <td className="px-6 py-3 flex space-x-3">
                        <button
                          onClick={() => handleSendOffer(candidate)}
                          className="text-green-600 hover:text-green-800"
                          title="Send Offer"
                        >
                          <Send size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(candidate)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Download Details"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(candidate.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Candidate"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => handleAddReport(candidate.id)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Add Interview Report"
                        >
                          <FilePlus2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-6 text-center text-gray-500 text-sm"
                    >
                      No candidates found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
            Showing {filteredCandidates.length} of {candidates.length} total candidates
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedCandidate;
