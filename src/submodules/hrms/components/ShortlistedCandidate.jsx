

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Swal from "sweetalert2";

// import {
//   Search, Mail, Phone, Download, Send, CheckCircle, XCircle, Clock,
//   User,
//   Edit,
//   Delete,
//   DeleteIcon,
//   LucideDelete,
//   Trash
// } from 'lucide-react';
// import { useAppSelector } from '../redux/hooks';
// import { useParams } from 'react-router-dom';

// // Stats Card Component
// const StatsCard = ({ icon, title, count, bgColor }) => (
//   <div className="bg-white rounded-lg shadow p-6">
//     <div className="flex items-center">
//       <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
//       <div className="ml-4">
//         <p className="text-sm font-medium text-gray-600">{title}</p>
//         <p className="text-2xl font-bold text-gray-900">{count}</p>
//       </div>
//     </div>
//   </div>
// );

// // Edit Candidate Modal
// const EditCandidateModal = ({ candidate, onSave, onCancel }) => {
// const user = useAppSelector((state) => state.user);
// const company_id = user.id; 
//  const [editingCandidate, setEditingCandidate] = useState(candidate);

//   const handleChange = (key, value) => setEditingCandidate(prev => ({ ...prev, [key]: value }));

//  const handleSave = async () => {   
//   try {
//     // ✅ SEND ONLY STATUS
//     const response = await axios.put(
//       `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/interview/${editingCandidate.id}/${company_id}`,
//       {
//         status: editingCandidate.status
//       }
//     );

//     if (response.status === 200) {
// Swal.fire({
//   icon: "success",
//   title: "Updated!",
//   text: "Candidate status updated successfully!",
// });

//       // update UI locally
//       onSave({
//         ...editingCandidate,
//         status: editingCandidate.status
//       });
//     } else {
//       alert("Failed to update candidate.");
//     }
//   } catch (error) {
//     console.error("Error updating candidate:", error);
//     alert("Error updating candidate. Please try again.");
//   }
// };


//   return (
//     <div className="min-h-screen  bg-gray-50 p-6 flex items-center justify-center">
//       <div className="max-w-2xl w-screen mx-auto bg-white rounded-lg shadow p-6">
//         <h2 className="text-2xl font-bold mb-6">Edit Candidate</h2>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Name</label>
//             <input
//               type="text"
//               value={editingCandidate.name}
//               onChange={e => handleChange('name', e.target.value)}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Position</label>
//             <input
//               type="text"
//               value={editingCandidate.position}
//               onChange={e => handleChange('position', e.target.value)}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <input
//               type="email"
//               value={editingCandidate.email}
//               onChange={e => handleChange('email', e.target.value)}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Phone</label>
//             <input
//               type="tel"
//               value={editingCandidate.phone}
//               onChange={e => handleChange('phone', e.target.value)}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Status</label>
//             <select
//               value={editingCandidate.status || ""}
//               onChange={(e) => handleChange("status", e.target.value)}
//               className="mt-1 block w-full border border-gray-300 rounded-md p-2"
//             >
//               <option value="">Select Status</option>
//               <option value="approved">Approved</option>
//               <option value="rejected">Rejected</option>
//               <option value="pending">Pending</option>
//             </select>
//           </div>

//           <div className="flex space-x-4 mt-4">
//             <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
//               Save Changes
//             </button>
//             <button onClick={onCancel} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Delete Confirmation Modal
// const DeleteModal = ({ candidate, onConfirm, onCancel }) => (
//   <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
//     <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
//       <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h3>
//       <p className="text-gray-600 mb-4">
//         Are you sure you want to remove {candidate.name} from shortlisted candidates?
//       </p>
//       <div className="flex justify-end space-x-3">
//         <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
//         <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Delete</button>
//       </div>
//     </div>
//   </div>
// );

// const ShortlistedCandidates = () => {
//   const user = useAppSelector((state) => state.user);
//   const id = user.id;
//   const [candidates, setCandidates] = useState([]);
//   const [filteredCandidates, setFilteredCandidates] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filters, setFilters] = useState({ position: '', status: '', experience: '', location: '', acceptance: '' });
//   const [sortBy, setSortBy] = useState('date');
//   const [editingCandidate, setEditingCandidate] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [candidateToDelete, setCandidateToDelete] = useState(null);

//   const [currentPage, setCurrentPage] = useState(1);
//   const candidatesPerPage = 5; // Number of candidates per page

//   // Fetch shortlisted candidates
//   useEffect(() => {
//     const fetchCandidates = async () => {
//       if (!id) return;
//       try {
//         const { data } = await axios.get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/getShortlistedApplicant/${id}`);
//         const applicants = (data.applicants || []).map(a => ({
//           id: a.id,
//           name: a.candidate_name || '',
//           position: a.position_applied || a.job_title || '',
//           email: a.email || '',
//           phone: a.phone || '',
//           resume_url: a.resume_url || null,
//           experience: a.Experience || '',
//           location: a.department || a.company || '',
//           status: a.status || 'Pending',
//           acceptance: a.acceptance || 'pending',
//           // preserve any job id from the API so updates can include it
//           job_id: a.job_id ?? a.job_posting_id ?? a.jobposting_id ?? (a.job_posting && a.job_posting.id) ?? (a.job && a.job.id),
//           // keep raw response for fallback when constructing update payloads
//           raw: a,
//           skills: a.skills ? JSON.parse(a.skills) : [],
//           notes: a.notes || ''
//         }));

//         setCandidates(applicants);
//         setFilteredCandidates(applicants);
//       } catch (error) {
//         console.error('Error fetching candidates:', error);
//       }
//     };
//     fetchCandidates();
//   }, [id]);

// //   useEffect(() => {
// //   const staticCandidates = [
// //     { id: 1, name: "Abhijit Malla", position: "Software Engineer", email: "abhijit@example.com", phone: "9876543210", status: "pending", acceptance: "pending" },
// //     { id: 2, name: "Sneha Sharma", position: "Frontend Developer", email: "sneha@example.com", phone: "9123456780", status: "selected", acceptance: "approved" },
// //     { id: 3, name: "Rahul Verma", position: "Backend Developer", email: "rahul@example.com", phone: "9988776655", status: "rejected", acceptance: "rejected" },
// //     { id: 4, name: "Pooja Singh", position: "UI/UX Designer", email: "pooja@example.com", phone: "9871234560", status: "pending", acceptance: "pending" },
// //     { id: 5, name: "Amit Kumar", position: "DevOps Engineer", email: "amit@example.com", phone: "9012345678", status: "selected", acceptance: "approved" },
// //   ];
// //   setCandidates(staticCandidates);
// //   setFilteredCandidates(staticCandidates);
// // }, []);


//   // Filtering & Sorting
//   useEffect(() => {
//     let result = candidates.filter(candidate => {
//       const matchesSearch = candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                             candidate.position?.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesPosition = !filters.position || candidate.position === filters.position;
//       const matchesStatus = !filters.status || candidate.status === filters.status;
//       const matchesExperience = !filters.experience || candidate.experience === filters.experience;
//       const matchesLocation = !filters.location || candidate.location?.includes(filters.location);
//       const matchesAcceptance = !filters.acceptance || candidate.acceptance === filters.acceptance;

//       return matchesSearch && matchesPosition && matchesStatus && matchesExperience && matchesLocation && matchesAcceptance;
//     });

//     result.sort((a, b) => {
//       switch (sortBy) {
//         case 'name': return a.name.localeCompare(b.name);
//         case 'experience': return parseInt(b.experience || 0) - parseInt(a.experience || 0);
//         default: return 0;
//       }
//     });

//     setFilteredCandidates(result);
//     setCurrentPage(1); // Reset page to 1 on filter/search change
//   }, [candidates, searchTerm, filters, sortBy]);

//   // Pagination calculations
//   const indexOfLastCandidate = currentPage * candidatesPerPage;
//   const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
//   const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate);
//   const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const editCandidate = (candidate) => setEditingCandidate(candidate);

//   const saveCandidate = (updated) => {
//     setCandidates(prev => prev.map(c => (c.id === updated.id ? updated : c)));
//     setEditingCandidate(null);
//   };

//   const deleteCandidate = (candidate) => {
//     setCandidateToDelete(candidate);
//     setShowDeleteModal(true);
//   };

//   const confirmDelete = async () => {
//     try {
//       await axios.delete(`${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/deleteShortlistedApplicant/${candidateToDelete.id}`);
//       setCandidates(prev => prev.filter(c => c.id !== candidateToDelete.id));
// Swal.fire({
//   icon: "success",
//   title: "Deleted!",
//   text: "Candidate deleted successfully!",
// });
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete candidate.");
//     } finally {
//       setShowDeleteModal(false);
//       setCandidateToDelete(null);
//     }
//   };

//   if (editingCandidate)
//     return (
//       <EditCandidateModal
//         candidate={editingCandidate}
//         onSave={saveCandidate}
//         onCancel={() => setEditingCandidate(null)}
//       />
//     );

//   return (
//     <div className="bg-gray-50">
//       <div className="max-w-7xl mx-auto">
   

//         {/* Search */}
//         <div className="flex items-center mb-4 space-x-2">
//           <input
//             type="text"
//             placeholder="Search Candidates"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//           />
//           <button
//             onClick={() => {
//               setFilteredCandidates(
//                 candidates.filter(candidate =>
//                   candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                   candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
//                 )
//               );
//             }}
//             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
//           >
//             Search
//           </button>
//         </div>

//         {/* Candidates Table */}
//         <div className="bg-white rounded-lg shadow overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-4 py-3 text-left">Name</th>
//                 <th className="px-4 py-3 text-left">Position</th>
//                 <th className="px-4 py-3 text-left">Email</th>
//                 <th className="px-4 py-3 text-left">Phone</th>
//                 <th className="px-4 py-3 text-left">Status</th>
//                 <th className="px-4 py-3 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {currentCandidates.map(candidate => (
//                 <tr key={candidate.id}>
//                   <td className="px-4 py-2">{candidate.name}</td>
//                   <td className="px-4 py-2">{candidate.position}</td>
//                   <td className="px-4 py-2">{candidate.email}</td>
//                   <td className="px-4 py-2">{candidate.phone}</td>
//                   <td className="px-4 py-2">{candidate.status}</td>
//                   <td className="px-4 py-2 flex space-x-2">
//                     <button onClick={() => editCandidate(candidate)} className="text-yellow-600 hover:underline"> <Edit /></button>
//                     <button onClick={() => deleteCandidate(candidate)} className="text-red-600 hover:underline"><Trash /> </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {filteredCandidates.length === 0 && (
//             <p className="text-center p-4 text-gray-500">No candidates found.</p>
//           )}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex justify-center mt-4 space-x-2">
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//               <button
//                 key={page}
//                 onClick={() => paginate(page)}
//                 className={`px-3 py-1 rounded-md border ${
//                   currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
//                 }`}
//               >
//                 {page}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {showDeleteModal && (
//         <DeleteModal
//           candidate={candidateToDelete}
//           onConfirm={confirmDelete}
//           onCancel={() => setShowDeleteModal(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default ShortlistedCandidates;



import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Swal from "sweetalert2";

import {
  Search, Mail, Phone, Download, Send, CheckCircle, XCircle, Clock,
  User,
  Edit,
  Delete,
  DeleteIcon,
  LucideDelete,
  Trash
} from 'lucide-react';
import useAuth from '../../../hooks/useAuth';
import { useParams } from 'react-router-dom';
import { usePermission } from '../../../hooks/usePermission';

// Stats Card Component
const StatsCard = ({ icon, title, count, bgColor }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{count}</p>
      </div>
    </div>
  </div>
);

// Edit Candidate Modal
const EditCandidateModal = ({ candidate, onSave, onCancel }) => {
  const { user } = useAuth();
  const { has } = usePermission();
  const company_id = user.company_id; 
  const [editingCandidate, setEditingCandidate] = useState(candidate);

  const handleChange = (key, value) => setEditingCandidate(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {   
    if (!has("hrms.job.shortlisted.action")) {
      Swal.fire("Access Denied", "You do not have permission to perform candidate actions.", "error");
      return;
    }
    try {
      // ✅ SEND ONLY STATUS
      const response = await axios.put(
        `${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/interview/${editingCandidate.id}/${company_id}`,
        {
          status: editingCandidate.status
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Candidate status updated successfully!",
        });

        // update UI locally
        onSave({
          ...editingCandidate,
          status: editingCandidate.status
        });
      } else {
        alert("Failed to update candidate.");
      }
    } catch (error) {
      console.error("Error updating candidate:", error);
      alert("Error updating candidate. Please try again.");
    }
  };

  return (
    <div className=" p-6 flex items-center justify-center">
      <div className="max-w-2xl w-screen mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Candidate</h2>
        <div className="space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={editingCandidate.name}
              onChange={e => handleChange('name', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              value={editingCandidate.position}
              onChange={e => handleChange('position', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={editingCandidate.email}
              onChange={e => handleChange('email', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={editingCandidate.phone}
              onChange={e => handleChange('phone', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={editingCandidate.status || ""}
              onChange={(e) => handleChange("status", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex space-x-4 mt-4">
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Save Changes
            </button>
            <button onClick={onCancel} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ candidate, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h3>
      <p className="text-gray-600 mb-4">
        Are you sure you want to remove {candidate.name} from shortlisted candidates?
      </p>
      <div className="flex justify-end space-x-3">
        <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Delete</button>
      </div>
    </div>
  </div>
);

const ShortlistedCandidates = () => {
  const { user } = useAuth();
  const { has } = usePermission();
  const id = user.company_id;
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [postFilter, setPostFilter] = useState('All'); // NEW: department/post filter
  const [filters, setFilters] = useState({ position: '', status: '', experience: '', location: '', acceptance: '' });
  const [sortBy, setSortBy] = useState('date');
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 5;

  // Extract unique positions for dropdown
  const uniquePositions = useMemo(() => {
    if (!Array.isArray(candidates)) return ['All'];
    const positions = candidates.map(c => c.position).filter(Boolean);
    return ['All', ...new Set(positions)];
  }, [candidates]);

  // Fetch shortlisted candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!id) return;
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/getShortlistedApplicant/${id}`);
        const applicants = (data.applicants || []).map(a => ({
          id: a.id,
          name: a.candidate_name || '',
          position: a.position_applied || a.job_title || '',
          email: a.email || '',
          phone: a.phone || '',
          experience: a.Experience || '',
          location: a.department || a.company || '',
          status: a.status || 'Pending',
          acceptance: a.acceptance || 'pending',
          job_id: a.job_id ?? a.job_posting_id ?? a.jobposting_id ?? (a.job_posting && a.job_posting.id) ?? (a.job && a.job.id),
          raw: a,
          skills: a.skills ? JSON.parse(a.skills) : [],
          resume_url: a.resume_url || null,
          notes: a.notes || ''
        }));

        setCandidates(applicants);
        setFilteredCandidates(applicants);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
    };
    fetchCandidates();
  }, [id]);

  // Filtering & Sorting (including postFilter)
  useEffect(() => {
    let result = candidates.filter(candidate => {
      const matchesSearch = candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            candidate.position?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = !filters.position || candidate.position === filters.position;
      const matchesStatus = !filters.status || candidate.status === filters.status;
      const matchesExperience = !filters.experience || candidate.experience === filters.experience;
      const matchesLocation = !filters.location || candidate.location?.includes(filters.location);
      const matchesAcceptance = !filters.acceptance || candidate.acceptance === filters.acceptance;
      
      // NEW: filter by post/department
      const matchesPost = postFilter === 'All' || candidate.position === postFilter;

      return matchesSearch && matchesPosition && matchesStatus && matchesExperience && matchesLocation && matchesAcceptance && matchesPost;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'experience': return parseInt(b.experience || 0) - parseInt(a.experience || 0);
        default: return 0;
      }
    });

    setFilteredCandidates(result);
    setCurrentPage(1); // Reset page on filter change
  }, [candidates, searchTerm, postFilter, filters, sortBy]);

  // Pagination calculations
  const indexOfLastCandidate = currentPage * candidatesPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate);
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const editCandidate = (candidate) => {
    if (!has("hrms.job.shortlisted.action")) {
      Swal.fire("Access Denied", "You do not have permission to perform candidate actions.", "error");
      return;
    }
    setEditingCandidate(candidate);
  };

  const saveCandidate = (updated) => {
    setCandidates(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    setEditingCandidate(null);
  };

  const deleteCandidate = (candidate) => {
    if (!has("hrms.job.shortlisted.action")) {
      Swal.fire("Access Denied", "You do not have permission to perform candidate actions.", "error");
      return;
    }
    setCandidateToDelete(candidate);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!has("hrms.job.shortlisted.action")) {
      Swal.fire("Access Denied", "You do not have permission to perform candidate actions.", "error");
      return;
    }
    try {
      await axios.delete(`${import.meta.env.VITE_HRMS_BASE_URL}/api/applicant/deleteShortlistedApplicant/${candidateToDelete.id}`);
      setCandidates(prev => prev.filter(c => c.id !== candidateToDelete.id));
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Candidate deleted successfully!",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to delete candidate.");
    } finally {
      setShowDeleteModal(false);
      setCandidateToDelete(null);
    }
  };

  if (editingCandidate)
    return (
      <EditCandidateModal
        candidate={editingCandidate}
        onSave={saveCandidate}
        onCancel={() => setEditingCandidate(null)}
      />
    );

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Search and Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-50 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          
          {/* NEW: Department/Post dropdown filter */}
          <select
            value={postFilter}
            onChange={(e) => setPostFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500"
          >
            {uniquePositions.map(pos => (
              <option key={pos} value={pos}>
                {pos === 'All' ? 'All Posts' : pos}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              // Trigger search (already handled by useEffect, but we keep for UX)
              setSearchTerm(searchTerm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {/* Candidates Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Resume</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCandidates.map(candidate => (
                <tr key={candidate.id}>
                  <td className="px-4 py-2">{candidate.name}</td>
                  <td className="px-4 py-2">{candidate.position}</td>
                  <td className="px-4 py-2">{candidate.email}</td>
                  <td className="px-4 py-2">{candidate.phone}</td>
                  <td className="px-4 py-2">{candidate.status}</td>
                  <td className="px-4 py-2 text-center">
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
                  <td className="px-4 py-2 flex space-x-2">
                    {has("hrms.job.shortlisted.action") && (
                      <button onClick={() => editCandidate(candidate)} className="text-yellow-600 hover:underline"><Edit /></button>
                    )}
                    {has("hrms.job.shortlisted.action") && (
                      <button onClick={() => deleteCandidate(candidate)} className="text-red-600 hover:underline"><Trash /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCandidates.length === 0 && (
            <p className="text-center p-4 text-gray-500">No candidates found.</p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => paginate(page)}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <DeleteModal
          candidate={candidateToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default ShortlistedCandidates;