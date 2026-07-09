import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api";
import useAuth from "../../../../../../hooks/useAuth";
import {
  X,
  UserCog,
  MapPin,
  CreditCard,
  Heart,
  Briefcase,
  Save,
  CheckCircle,
  Loader2,
  Upload,
  FileText,
  Trash2,
  Eye,
} from "lucide-react";

const CustomerProfileSetupModal = ({ lead, onClose, onSaveSuccess }) => {
  const queryClient = useQueryClient();
  const { user, companyId } = useAuth();

  const [form, setForm] = useState({
    full_address: "",
    city: "",
    state: "",
    pincode: "",
    pan_number: "",
    aadhaar_number: "",
    date_of_birth: "",
    occupation: "",
    company_name: "",
    nominee_name: "",
    nominee_relation: "",
    nominee_phone: "",
    notes: "",
  });

  const [newFiles, setNewFiles] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingDoc = (index) => {
    setExistingDocs((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch existing profile if any
  const { data: existingProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ["customer-profile", lead.id, companyId],
    queryFn: async () => {
      try {
        const res = await api.get(`/api/customers/profile/${lead.id}`, {
          params: { company_id: companyId },
        });
        return res.data.data || null;
      } catch {
        return null;
      }
    },
    enabled: !!lead.id && !!companyId,
  });

  useEffect(() => {
    if (existingProfile) {
      setForm({
        full_address: existingProfile.full_address || "",
        city: existingProfile.city || "",
        state: existingProfile.state || "",
        pincode: existingProfile.pincode || "",
        pan_number: existingProfile.pan_number || "",
        aadhaar_number: existingProfile.aadhaar_number || "",
        date_of_birth: existingProfile.date_of_birth
          ? existingProfile.date_of_birth.split("T")[0]
          : "",
        occupation: existingProfile.occupation || "",
        company_name: existingProfile.company_name || "",
        nominee_name: existingProfile.nominee_name || "",
        nominee_relation: existingProfile.nominee_relation || "",
        nominee_phone: existingProfile.nominee_phone || "",
        notes: existingProfile.notes || "",
      });
      setExistingDocs(existingProfile.documents || []);
      setNewFiles([]);
    }
  }, [existingProfile]);

  const saveMutation = useMutation({
    mutationFn: (data) => api.post("/api/customers/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["leads"]);
      queryClient.invalidateQueries(["customer-profile"]);
      onSaveSuccess?.();
      alert("Profile saved successfully!");
      onClose();
    },
    onError: (error) => {
      alert(
        `Error saving profile: ${error.response?.data?.message || error.message}`
      );
    },
  });

  const handleSave = () => {
    const formData = new FormData();
    formData.append("company_id", companyId);
    formData.append("lead_id", lead.id);
    
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key] || "");
    });

    formData.append("existing_docs", JSON.stringify(existingDocs));

    newFiles.forEach((file) => {
      formData.append("files", file);
    });

    saveMutation.mutate(formData);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isEditing = !!existingProfile;

  return createPortal(
    <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999">
      <div className="app-modal w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-(--border-soft) flex items-center justify-between shrink-0">
          <div className="flex items-start gap-3.5 min-w-0 pr-4">
            <div className="size-11 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100 shrink-0">
              <UserCog className="size-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h2 className="modal-title truncate">
                {isEditing ? "Update" : "Setup"} Customer Profile
              </h2>
              <p className="modal-subtitle mt-0.5">
                {lead.name} — {lead.phone}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="app-icon-button p-2 text-(--text-faint) hover:text-(--text-soft) hover:bg-(--bg-subtle) transition-all active:scale-[0.98] shrink-0"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {loadingProfile ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-(--text-soft)">
                Loading profile...
              </span>
            </div>
          ) : (
            <>
              {/* Address Section */}
              <div className="space-y-4">
                <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                  <MapPin className="size-4 text-blue-600" />
                  <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                    Address Details
                  </h4>
                </div>

                <div>
                  <label className="modal-label block mb-1">Full Address</label>
                  <textarea
                    value={form.full_address}
                    onChange={(e) =>
                      updateField("full_address", e.target.value)
                    }
                    placeholder="House no, street, locality..."
                    rows={2}
                    className="app-input w-full bg-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="modal-label block mb-1">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="e.g. Hyderabad"
                      className="app-input w-full bg-white"
                    />
                  </div>
                  <div>
                    <label className="modal-label block mb-1">State</label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      placeholder="e.g. Telangana"
                      className="app-input w-full bg-white"
                    />
                  </div>
                  <div>
                    <label className="modal-label block mb-1">Pincode</label>
                    <input
                      type="text"
                      value={form.pincode}
                      onChange={(e) => updateField("pincode", e.target.value)}
                      placeholder="e.g. 500001"
                      maxLength={6}
                      className="app-input w-full bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Identity Section */}
              <div className="space-y-4">
                <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                  <CreditCard className="size-4 text-emerald-600" />
                  <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                    Identity & Personal
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="modal-label block mb-1">PAN Number</label>
                    <input
                      type="text"
                      value={form.pan_number}
                      onChange={(e) =>
                        updateField(
                          "pan_number",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="e.g. ABCDE1234F"
                      maxLength={10}
                      className="app-input w-full bg-white uppercase"
                    />
                  </div>
                  <div>
                    <label className="modal-label block mb-1">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      value={form.aadhaar_number}
                      onChange={(e) =>
                        updateField("aadhaar_number", e.target.value)
                      }
                      placeholder="e.g. 1234 5678 9012"
                      maxLength={14}
                      className="app-input w-full bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="modal-label block mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={form.date_of_birth}
                      onChange={(e) =>
                        updateField("date_of_birth", e.target.value)
                      }
                      className="app-input w-full bg-white"
                    />
                  </div>
                  <div>
                    <label className="modal-label block mb-1">Occupation</label>
                    <input
                      type="text"
                      value={form.occupation}
                      onChange={(e) =>
                        updateField("occupation", e.target.value)
                      }
                      placeholder="e.g. Business Owner"
                      className="app-input w-full bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="modal-label block mb-1 items-center gap-1.5">
                    <Briefcase className="size-3.5 text-slate-400" />
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={(e) =>
                      updateField("company_name", e.target.value)
                    }
                    placeholder="e.g. ABC Corporation"
                    className="app-input w-full bg-white"
                  />
                </div>
              </div>

              {/* Nominee Section */}
              <div className="space-y-4">
                <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                  <Heart className="size-4 text-rose-500" />
                  <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                    Nominee Details
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="modal-label block mb-1">
                      Nominee Name
                    </label>
                    <input
                      type="text"
                      value={form.nominee_name}
                      onChange={(e) =>
                        updateField("nominee_name", e.target.value)
                      }
                      placeholder="Full name"
                      className="app-input w-full bg-white"
                    />
                  </div>
                  <div>
                    <label className="modal-label block mb-1">Relation</label>
                    <select
                      value={form.nominee_relation}
                      onChange={(e) =>
                        updateField("nominee_relation", e.target.value)
                      }
                      className="app-input w-full bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Select relation</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="modal-label block mb-1">
                      Nominee Phone
                    </label>
                    <input
                      type="tel"
                      value={form.nominee_phone}
                      onChange={(e) =>
                        updateField("nominee_phone", e.target.value)
                      }
                      placeholder="+91 ..."
                      className="app-input w-full bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="modal-label block mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Any additional remarks..."
                  rows={2}
                  className="app-input w-full bg-white resize-none"
                />
              </div>

              {/* Documents Section */}
              <div className="space-y-4">
                <div className="border-b border-(--border-soft) pb-1.5 flex items-center gap-2">
                  <Upload className="size-4 text-purple-600" />
                  <h4 className="text-[12px] font-bold text-(--text-strong) uppercase tracking-widest">
                    Documents & Attachments
                  </h4>
                </div>

                {/* Existing Documents */}
                {existingDocs.length > 0 && (
                  <div className="space-y-2">
                    <label className="modal-label block">Uploaded Documents</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {existingDocs.map((doc, idx) => {
                        const fileName = doc.split("/").pop();
                        const fileUrl = `${import.meta.env.VITE_CRM_BASE_URL}/${doc}`;
                        return (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="size-4 text-purple-600 shrink-0" />
                              <span className="text-xs text-slate-700 truncate font-medium">
                                {fileName}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded transition-all"
                                title="View"
                              >
                                <Eye className="size-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => removeExistingDoc(idx)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-all"
                                title="Delete"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* New Files Pending Upload */}
                {newFiles.length > 0 && (
                  <div className="space-y-2">
                    <label className="modal-label block text-emerald-700">New Files to Upload</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {newFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="size-4 text-emerald-600 shrink-0" />
                            <span className="text-xs text-emerald-800 truncate font-medium">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNewFile(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-all"
                            title="Remove"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Input */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50/30 hover:bg-slate-50 hover:border-slate-300 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="size-6 text-slate-400 mb-1.5" />
                      <p className="text-xs text-slate-500">
                        <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop files
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG (Max 10MB)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-(--border-soft) flex items-center justify-between shrink-0">
          {isEditing && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <CheckCircle className="size-3.5" />
              Profile already exists — editing
            </span>
          )}
          {!isEditing && <span />}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="app-btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveMutation.isPending || loadingProfile}
              className="app-btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              {isEditing ? "Update Profile" : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CustomerProfileSetupModal;
