import React, { useState } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

const EmployeeForm = () => {
    const { token } = useAuth();
    // 1. State for all text fields (Matching your Backend Controller)
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'employee',
        postApplied: '', department: '', joinDate: '', employeeStatus: '',
        status: 'active', storeAssign: '', phone: '', officeEmail: '',
        dob: '', gender: '', maritalStatus: '', marriageDate: '',
        nationality: '', religion: '', caste: '', fatherName: '',
        fatherOccupation: '', aadharNo: '', panNo: '',
        permanentAddress1: '', permanentAddress2: '', permanentCountry: '',
        permanentState: '', permanentDistrict: '', permanentZipCode: '',
        presentAddress1: '', presentAddress2: '', presentCountry: '',
        presentState: '', presentDistrict: '', presentZipCode: '',
        course: '', board: '', passingYear: '', institute: '', graduationType: '',
        jobTitle: '', previousCompany: '', startDate: '', endDate: '',
        experienceDescription: ''
    });

    // 2. State for JSON Arrays (Education/Experience)
    const [education, setEducation] = useState([{ degree: '', year: '', institute: '' }]);
    const [experience, setExperience] = useState([{ company: '', role: '', duration: '' }]);

    // 3. State for Files
    const [files, setFiles] = useState({});

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    // Dynamic Array Handlers
    const addEducation = () => setEducation([...education, { degree: '', year: '', institute: '' }]);
    const handleEducationChange = (index, field, value) => {
        const updated = [...education];
        updated[index][field] = value;
        setEducation(updated);
    };

    const addExperience = () => setExperience([...experience, { company: '', role: '', duration: '' }]);
    const handleExperienceChange = (index, field, value) => {
        const updated = [...experience];
        updated[index][field] = value;
        setExperience(updated);
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // 1. Define fields that require special handling
    const dateFields = ['dob', 'marriageDate', 'joinDate', 'startDate', 'endDate', 'resignDate'];
    const integerFields = ['passingYear'];

    // 2. Loop through formData and sanitize
    Object.keys(formData).forEach(key => {
        const value = formData[key];

        // If a Date or Integer field is empty, do NOT append it to FormData
        if (dateFields.includes(key) || integerFields.includes(key)) {
            if (value !== "" && value !== null) {
                data.append(key, value);
            }
        } else {
            // Append regular text fields
            data.append(key, value);
        }
    });

    // 3. Append JSON Arrays
    data.append('education', JSON.stringify(education));
    data.append('experience', JSON.stringify(experience));

    // 4. Append Files
    Object.keys(files).forEach(key => {
        if (files[key]) data.append(key, files[key]);
    });

    try {
        const response = await axios.post('https://csaapnodeapi.csaap.com/api/tenant/hrms/add-employee', data, {
            headers: { 
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`
            }
        });
        alert('Employee Created Successfully!');
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Submission Error:", error.response?.data || error.message);
        alert(error.response?.data?.error || 'Check console for SQL errors');
    }
};
    return (
        <form onSubmit={handleSubmit} className="p-8 bg-white space-y-8 max-w-6xl mx-auto shadow-2xl border rounded-lg">
            <div className="border-b pb-4">
                <h2 className="text-3xl font-extrabold text-gray-800">Employee Management - Add New Employee</h2>
                <p className="text-gray-500">Fill in all profile and login details below.</p>
            </div>

            {/* --- SECTION 1: LOGIN & CORE --- */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600 underline">Account Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className="block text-sm font-medium">Full Name*</label><input className="w-full border rounded p-2 mt-1" name="name" onChange={handleInputChange} required /></div>
                    <div><label className="block text-sm font-medium">Email (Login)*</label><input className="w-full border rounded p-2 mt-1" type="email" name="email" onChange={handleInputChange} required /></div>
                    <div><label className="block text-sm font-medium">Password*</label><input className="w-full border rounded p-2 mt-1" type="password" name="password" onChange={handleInputChange} required /></div>
                </div>
            </section>

            {/* --- SECTION 2: JOB DETAILS --- */}
            <section className="space-y-4 bg-gray-50 p-6 rounded-md">
                <h3 className="text-lg font-semibold text-blue-600 underline">Job Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="block text-sm font-medium">Post Applied</label><input className="w-full border rounded p-2 mt-1" name="postApplied" onChange={handleInputChange} /></div>
                    <div><label className="block text-sm font-medium">Department</label><input className="w-full border rounded p-2 mt-1" name="department" onChange={handleInputChange} /></div>
                    <div><label className="block text-sm font-medium">Join Date</label><input className="w-full border rounded p-2 mt-1" type="date" name="joinDate" onChange={handleInputChange} /></div>
                    <div><label className="block text-sm font-medium">Employee Status</label>
                        <select className="w-full border rounded p-2 mt-1" name="employeeStatus" onChange={handleInputChange}>
                            <option value="">Select Status</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Probation">Probation</option>
                            <option value="Contract">Contract</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* --- SECTION 3: PERSONAL DETAILS --- */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-600 underline">Personal Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="block text-sm font-medium">Phone</label><input className="w-full border rounded p-2 mt-1" name="phone" onChange={handleInputChange} /></div>
                    <div><label className="block text-sm font-medium">Office Email</label><input className="w-full border rounded p-2 mt-1" name="officeEmail" onChange={handleInputChange} /></div>
                    <div><label className="block text-sm font-medium">DOB</label><input className="w-full border rounded p-2 mt-1" type="date" name="dob" onChange={handleInputChange} /></div>
                    <div><label className="block text-sm font-medium">Gender</label>
                        <select className="w-full border rounded p-2 mt-1" name="gender" onChange={handleInputChange}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="block text-sm font-medium">Aadhar Number</label><input className="w-full border rounded p-2 mt-1" name="aadharNo" onChange={handleInputChange} /></div>
                    <div><label className="block text-sm font-medium">PAN Number</label><input className="w-full border rounded p-2 mt-1" name="panNo" onChange={handleInputChange} /></div>
                    <div><label className="block text-sm font-medium">Father's Name</label><input className="w-full border rounded p-2 mt-1" name="fatherName" onChange={handleInputChange} /></div>
                    <div><label className="block text-sm font-medium">Nationality</label><input className="w-full border rounded p-2 mt-1" name="nationality" onChange={handleInputChange} /></div>
                </div>
            </section>

            {/* --- SECTION 4: ADDRESSES --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-4 border rounded bg-blue-50/30">
                    <h3 className="font-bold text-gray-700 mb-3">Permanent Address</h3>
                    <input className="w-full border rounded mb-2 p-2" placeholder="Address Line 1" name="permanentAddress1" onChange={handleInputChange} />
                    <input className="w-full border rounded mb-2 p-2" placeholder="Address Line 2" name="permanentAddress2" onChange={handleInputChange} />
                    <div className="grid grid-cols-2 gap-2">
                        <input className="border rounded p-2" placeholder="District" name="permanentDistrict" onChange={handleInputChange} />
                        <input className="border rounded p-2" placeholder="State" name="permanentState" onChange={handleInputChange} />
                    </div>
                </div>
                <div className="p-4 border rounded bg-green-50/30">
                    <h3 className="font-bold text-gray-700 mb-3">Present Address</h3>
                    <input className="w-full border rounded mb-2 p-2" placeholder="Address Line 1" name="presentAddress1" onChange={handleInputChange} />
                    <input className="w-full border rounded mb-2 p-2" placeholder="Address Line 2" name="presentAddress2" onChange={handleInputChange} />
                    <div className="grid grid-cols-2 gap-2">
                        <input className="border rounded p-2" placeholder="District" name="presentDistrict" onChange={handleInputChange} />
                        <input className="border rounded p-2" placeholder="State" name="presentState" onChange={handleInputChange} />
                    </div>
                </div>
            </div>

            {/* --- SECTION 5: EDUCATION (JSON Array) --- */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-blue-600">Education Background</h3>
                    <button type="button" onClick={addEducation} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded">+ Add Degree</button>
                </div>
                {education.map((edu, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 p-2 border-l-4 border-blue-400">
                        <input className="border p-2" placeholder="Degree" value={edu.degree} onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)} />
                        <input className="border p-2" placeholder="Year" value={edu.year} onChange={(e) => handleEducationChange(idx, 'year', e.target.value)} />
                        <input className="border p-2" placeholder="Institute" value={edu.institute} onChange={(e) => handleEducationChange(idx, 'institute', e.target.value)} />
                    </div>
                ))}
            </section>

            {/* --- SECTION 6: FILE UPLOADS --- */}
            <section className="p-6 bg-blue-50 rounded-lg border-2 border-dashed border-blue-200">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Documents & Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><label className="block text-xs font-bold uppercase text-gray-600">Profile Photo</label><input type="file" name="profile_photo" className="mt-1" onChange={handleFileChange} /></div>
                    <div><label className="block text-xs font-bold uppercase text-gray-600">CV / Resume (PDF)</label><input type="file" name="cv" className="mt-1" onChange={handleFileChange} /></div>
                    <div><label className="block text-xs font-bold uppercase text-gray-600">Aadhar Card</label><input type="file" name="aadhar" className="mt-1" onChange={handleFileChange} /></div>
                    <div><label className="block text-xs font-bold uppercase text-gray-600">PAN Card</label><input type="file" name="pan" className="mt-1" onChange={handleFileChange} /></div>
                    <div><label className="block text-xs font-bold uppercase text-gray-600">Experience Letter</label><input type="file" name="experienceCertificate" className="mt-1" onChange={handleFileChange} /></div>
                </div>
            </section>

            {/* --- LEGACY SPECIFICS (Education/Work) --- */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-100 p-4 rounded">
                <div><label className="text-xs font-bold">Start Date (Prev Job)</label><input type="date" name="startDate" className="w-full p-2 border" onChange={handleInputChange} /></div>
                <div><label className="text-xs font-bold">End Date (Prev Job)</label><input type="date" name="endDate" className="w-full p-2 border" onChange={handleInputChange} /></div>
                <div className="col-span-2"><label className="text-xs font-bold">Exp. Description</label><input name="experienceDescription" className="w-full p-2 border" onChange={handleInputChange} placeholder="Brief summary of roles..." /></div>
            </section>

            <div className="pt-6">
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                    REGISTER EMPLOYEE
                </button>
            </div>
        </form>
    );
};

export default EmployeeForm;
