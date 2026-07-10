import React, { useEffect, useState } from "react";
import axios from "axios";
import useAuth from "../../../../hooks/useAuth";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Award,
  Heart,
  Droplet,
  Globe,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit2,
  Camera,
  Save,
  X,
  ChevronRight,
  Users,
  FileText,
  CreditCard,
  Home,
  Smartphone,
  UserCheck,
  CalendarDays,
  Sparkles,
  Star,
  TrendingUp,
  Plus
} from 'lucide-react';

const EmployeeProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: ""
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const { user, token } = useAuth();
  const employeeId = user?.employee_id;
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `https://csaapnodeapi.csaap.com/api/tenant/hrms/get-employee/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedImage) return alert("Please select image");

    const formData = new FormData();
    formData.append("profile_photo", selectedImage);
    formData.append("employee_id", employeeId);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/employees/upload-profile-photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Profile photo updated!");
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_CSAAP_URL}/api/tenant/hrms/change-password`,
        {
          email: profile.email,
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || "Password changed successfully");
      setPasswordData({ oldPassword: "", newPassword: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };


  const getEducationData = () => {

    if (!profile.education) return [];
    

    if (Array.isArray(profile.education)) {
      return profile.education;
    }
    

    if (typeof profile.education === 'object') {

      if (profile.education.data && Array.isArray(profile.education.data)) {
        return profile.education.data;
      }

      return [profile.education];
    }
    
    return [];
  };


  const renderEducationFields = (education, index) => {
    const fields = [];
    

    if (education.qualification || education.degree || education.education) {
      fields.push({
        icon: GraduationCap,
        label: "Qualification",
        value: education.qualification || education.degree || education.education
      });
    }
    if (education.course || education.stream || education.major) {
      fields.push({
        icon: FileText,
        label: "Course/Stream",
        value: education.course || education.stream || education.major
      });
    }
    if (education.specialization) {
      fields.push({
        icon: Award,
        label: "Specialization",
        value: education.specialization
      });
    }
    if (education.board || education.university) {
      fields.push({
        icon: Shield,
        label: "Board/University",
        value: education.board || education.university
      });
    }
    if (education.institute || education.college || education.school) {
      fields.push({
        icon: Building2,
        label: "Institute",
        value: education.institute || education.college || education.school
      });
    }
    if (education.passingYear || education.year_of_passing || education.year) {
      fields.push({
        icon: Calendar,
        label: "Passing Year",
        value: education.passingYear || education.year_of_passing || education.year
      });
    }
    if (education.percentage || education.cgpa || education.grade) {
      fields.push({
        icon: TrendingUp,
        label: "Percentage/CGPA",
        value: education.percentage || education.cgpa || education.grade
      });
    }
    
    return fields;
  };

  if (loading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No profile found</p>
        </div>
      </div>
    );
  }

  const infoCards = [
    { icon: Mail, label: "Email", value: profile.email, color: "bg-blue-500" },
    { icon: Phone, label: "Phone", value: profile.phone, color: "bg-green-500" },
    { icon: Calendar, label: "Date of Birth", value: profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided', color: "bg-purple-500" },
    { icon: Droplet, label: "Blood Group", value: profile.blood_group || 'Not provided', color: "bg-red-500" },
    { icon: Globe, label: "Nationality", value: profile.nationality || 'Not provided', color: "bg-teal-500" },
    { icon: Users, label: "Gender", value: profile.gender || 'Not provided', color: "bg-pink-500" },
  ];

  const jobCards = [
    { icon: Briefcase, label: "Employee ID", value: profile.id || profile.employee_id, color: "bg-indigo-500" },
    { icon: Building2, label: "Department", value: profile.department, color: "bg-cyan-500" },
    { icon: Award, label: "Designation", value: profile.designation, color: "bg-amber-500" },
    { icon: Clock, label: "Shift", value: profile.employeeShift || profile.shift, color: "bg-orange-500" },
    { icon: CalendarDays, label: "Join Date", value: profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'Not provided', color: "bg-emerald-500" },
    { icon: CheckCircle, label: "Status", value: profile.employeeStatus || profile.status, color: (profile.employeeStatus === 'Active' || profile.status === 'Active') ? "bg-green-500" : "bg-red-500" },
  ];

  const educationArray = getEducationData();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="relative mb-8">
          <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden">

            <div className="h-32 bg-green-700"></div>


            <div className="px-8 pb-4 relative">
              <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 mb-6">
                <div className="relative group">
                  <img
                    src={
                      selectedImage
                        ? URL.createObjectURL(selectedImage)
                        : profile.profile_photo ||
                          "https://ui-avatars.com/api/?background=16a34a&color=fff&name=" +
                            encodeURIComponent(profile.name)
                    }
                    alt="profile"
                    className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="uploadPhoto"
                  />
                  <label
                    htmlFor="uploadPhoto"
                    className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <Camera className="h-4 w-4 text-gray-600" />
                  </label>
                </div>

                {selectedImage && (
                  <button
                    onClick={handleUploadPhoto}
                    className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg ml-0 md:ml-3"
                  >
                    Upload Photo
                  </button>
                )}

                <div className="md:ml-6 text-center md:text-left flex-1 mt-4 md:mt-0">
                  <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                    <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      (profile.employeeStatus === 'Active' || profile.status === 'Active')
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {profile.employeeStatus || profile.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mt-4 justify-center md:justify-start">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                      <Briefcase className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">Designation:</span> {profile.designation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                      <Building2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">Department:</span> {profile.department}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 justify-center md:justify-start">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Mail className="h-4 w-4" />
                      {profile.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl shadow-md border border-gray-200 w-fit">
          {[
            { id: 'personal', icon: User, label: 'Personal Info' },
            { id: 'job', icon: Briefcase, label: 'Job Details' },
            { id: 'education', icon: GraduationCap, label: 'Education' },
            { id: 'address', icon: Home, label: 'Address' },
            { id: 'security', icon: Lock, label: 'Security' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>


        {activeTab === 'personal' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-600 rounded-xl">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {infoCards.map((card, idx) => (
                  <div key={idx} className="group bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${card.color} shadow-sm`}>
                        <card.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                        <p className="text-sm font-semibold text-gray-800">{card.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {activeTab === 'job' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-600 rounded-xl">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Job Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobCards.map((card, idx) => (
                  <div key={idx} className="group bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${card.color} shadow-sm`}>
                        <card.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                        <p className="text-sm font-semibold text-gray-800">{card.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {activeTab === 'education' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-600 rounded-xl">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Education Details</h2>
              </div>
              
              {educationArray.length > 0 ? (
                <div className="space-y-6">
                  {educationArray.map((education, index) => {
                    const educationFields = renderEducationFields(education, index);
                    

                    if (educationFields.length === 0 && typeof education === 'object') {
                      return (
                        <div key={index} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                              <GraduationCap className="h-4 w-4 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800">
                              {education.degree || education.qualification || `Education ${index + 1}`}
                            </h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(education).map(([key, value]) => (
                              value && typeof value !== 'object' && (
                                <div key={key} className="bg-gray-50 rounded-lg p-2">
                                  <p className="text-xs text-gray-500 font-medium capitalize">
                                    {key.replace(/_/g, ' ')}
                                  </p>
                                  <p className="text-sm font-semibold text-gray-800">{value}</p>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                        {educationArray.length > 1 && (
                          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                            <div className="p-1.5 bg-green-100 rounded-lg">
                              <GraduationCap className="h-4 w-4 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-800">
                              {education.degree || education.qualification || `Education ${index + 1}`}
                            </h3>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {educationFields.map((field, fieldIdx) => (
                            <div key={fieldIdx} className="bg-gray-50 rounded-xl p-3">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-green-100 rounded-lg">
                                  <field.icon className="h-3.5 w-3.5 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium">{field.label}</p>
                                  <p className="text-sm font-semibold text-gray-800">{field.value}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No education details available</p>
                </div>
              )}
            </div>
          </div>
        )}


        {activeTab === 'address' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-600 rounded-xl">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Permanent Address</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Address Line</p>
                    <p className="text-sm text-gray-800">{profile.permanentAddress1 || profile.permanent_address || 'Not provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">District</p>
                      <p className="text-sm text-gray-800">{profile.permanentDistrict || profile.permanent_district || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">State</p>
                      <p className="text-sm text-gray-800">{profile.permanentState || profile.permanent_state || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Country</p>
                      <p className="text-sm text-gray-800">{profile.permanentCountry || profile.permanent_country || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Zip Code</p>
                      <p className="text-sm text-gray-800">{profile.permanentZipCode || profile.permanent_zipcode || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>


              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-600 rounded-xl">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Present Address</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Address Line</p>
                    <p className="text-sm text-gray-800">{profile.presentAddress1 || profile.present_address || 'Not provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">District</p>
                      <p className="text-sm text-gray-800">{profile.presentDistrict || profile.present_district || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">State</p>
                      <p className="text-sm text-gray-800">{profile.presentState || profile.present_state || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Country</p>
                      <p className="text-sm text-gray-800">{profile.presentCountry || profile.present_country || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Zip Code</p>
                      <p className="text-sm text-gray-800">{profile.presentZipCode || profile.present_zipcode || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'security' && (
          <div className="animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-600 rounded-xl">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Update your password to keep your account secure</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, oldPassword: e.target.value })
                      }
                      className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-gray-50 focus:bg-white transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Password must be at least 8 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {passwordLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {passwordLoading ? "Updating Password..." : "Update Password"}
                </button>
              </form>


              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Security Tips</p>
                    <ul className="text-xs text-amber-700 mt-1 space-y-1">
                      <li>• Use a strong password with letters, numbers, and symbols</li>
                      <li>• Never share your password with anyone</li>
                      <li>• Enable two-factor authentication for extra security</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default EmployeeProfile;