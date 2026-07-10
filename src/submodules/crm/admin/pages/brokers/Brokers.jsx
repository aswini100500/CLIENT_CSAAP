import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useSWR, { mutate } from 'swr';
import { Plus, Search, SearchX, Edit3, Trash2, X, Users, CheckCircle2, Eye } from 'lucide-react';
import client from '../../../../../api/client';
import BrokerDetailsModal from '../../components/BrokerDetailsModal';

const fetcher = (url) => client.get(url).then((res) => res.data.brokers || res.data.data);

const Brokers = () => {
  const API_ENDPOINT = '/api/tenant/broker';


  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [contentVisible, setContentVisible] = useState(false);
  const [activeDetailsBroker, setActiveDetailsBroker] = useState(null);


  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');


  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setContentVisible(true);
    }, 40);
    return () => clearTimeout(revealTimer);
  }, []);


  const swrKey = searchTerm.trim()
    ? `${API_ENDPOINT}/search/${searchTerm}`
    : API_ENDPOINT;

  const { data: brokers = [], error, isLoading } = useSWR(swrKey, fetcher);


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    alt_phone: '',
    joined_date: '',
    commission: ''
  });


  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedBroker) {
        await client.put(`${API_ENDPOINT}/${selectedBroker.id}`, formData);
        triggerToast('Broker updated successfully!');
      } else {
        await client.post(API_ENDPOINT, formData);
        triggerToast('Broker added successfully!');
      }
      mutate(swrKey);
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this broker?')) return;
    try {
      await client.delete(`${API_ENDPOINT}/${id}`);
      mutate(swrKey);
      triggerToast('Broker removed successfully!');
    } catch (err) {
      alert('Delete failed');
    }
  };

  const openEditModal = (broker) => {
    setSelectedBroker(broker);
    setFormData({
      name: broker.name,
      email: broker.email,
      phone: broker.phone,
      alt_phone: broker.alt_phone || '',
      joined_date: broker.joined_date?.split('T')[0] || '',
      commission: broker.commission
    });
    setShowAddForm(true);
  };

  const closeModal = () => {
    setShowAddForm(false);
    setSelectedBroker(null);
    setFormData({ name: '', email: '', phone: '', alt_phone: '', joined_date: '', commission: '' });
  };

  return (
    <div
      className={`app-shell p-4 transition-all duration-400 ease-out ${
        contentVisible
          ? 'opacity-100 blur-0 translate-y-0'
          : 'opacity-0 blur-sm translate-y-2'
      }`}
    >

      {showToast && (
        <div className="fixed top-20 right-8 z-50 transform transition-all duration-300 flex items-center gap-3 bg-white border border-(--border-strong) shadow-(--shadow-float) px-4 py-3 rounded-xl animate-in fade-in slide-in-from-top-4">
          <div className="bg-(--brand-soft) rounded-lg p-1.5 border border-(--border-soft)">
            <CheckCircle2 className="size-4 text-(--brand)" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-(--text-strong) leading-tight">{toastMessage}</p>
            <p className="text-[10px] text-(--brand) font-bold uppercase tracking-widest mt-0.5">Live Sync Successful</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">

        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="app-title">Brokers</h1>
            <p className="app-subtitle mt-1">Manage your company's high-impact partners.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Brokers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="app-input w-full pl-9 pr-3 py-2 text-[13px]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-faint) size-3.5" />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="app-btn-primary flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
            >
              <Plus className="size-4" />
              Add Broker
            </button>
          </div>
        </header>


        <div className="app-panel overflow-hidden">
          <div className="app-section-bar px-4 py-3 flex items-center justify-between">
            <h3 className="app-heading">All Brokers ({isLoading ? '...' : brokers.length})</h3>
          </div>

          {isLoading ? (
            <div className="px-4 py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-(--brand) mx-auto mb-3"></div>
              <p className="text-[12px] text-(--text-soft) font-bold uppercase tracking-widest">Fetching Data...</p>
            </div>
          ) : brokers.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="w-16 h-16 bg-(--brand-soft) rounded-2xl flex items-center justify-center mb-4 mx-auto border border-(--border-soft)">
                <SearchX className="w-8 h-8 text-(--brand)" />
              </div>
              <h3 className="text-[16px] font-bold text-(--text-strong)">
                {searchTerm ? `No results found for "${searchTerm}"` : 'No brokers onboarded yet'}
              </h3>
              <p className="text-[12px] mt-1 text-(--text-soft)">
                {searchTerm ? 'Try adjusting your search query.' : 'Get started by onboarding your first broker partner.'}
              </p>
              <button
                onClick={() => (searchTerm ? setSearchTerm('') : setShowAddForm(true))}
                className="mt-4 app-btn-secondary py-1.5 px-4 active:scale-[0.98] inline-flex items-center gap-1.5 text-[13px] cursor-pointer"
              >
                {searchTerm ? 'Clear Search' : 'Onboard First Broker'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white border-b border-(--border-soft)">
                    <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Partner Information
                    </th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Commission
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Joined Date
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-extrabold uppercase tracking-widest text-(--text-soft)">
                      Control
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-(--bg-subtle)">
                  {brokers.map((broker) => (
                    <tr key={broker.id} className="hover:bg-(--bg-subtle)/70 transition-colors duration-200">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="size-9 rounded-xl flex items-center justify-center shrink-0 bg-(--brand-soft) border border-(--border-soft) text-(--brand) font-extrabold text-[14px]">
                            {broker.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-[14px] font-bold tracking-[-0.02em] text-(--text-strong)">
                              {broker.name}
                            </div>
                            <div className="text-[12px] font-medium text-(--text-faint) flex items-center gap-1.5 mt-0.5">
                              <span>{broker.email}</span>
                              <span className="inline-block size-1 rounded-full bg-slate-300" />
                              <span className="font-semibold text-(--text-soft)">{broker.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="bg-(--bg-subtle) text-(--brand) px-2.5 py-1 rounded-lg font-mono font-bold text-[12px] border border-(--border-strong)">
                          {broker.commission}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] font-semibold text-(--text-body)">
                        {broker.joined_date ? new Date(broker.joined_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActiveDetailsBroker(broker)}
                            className="p-1.5 text-(--text-soft) hover:text-(--brand) hover:bg-(--brand-soft) rounded-lg transition-colors border border-transparent hover:border-(--border-soft) cursor-pointer"
                            title="View Leads & Customers"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(broker)}
                            className="p-1.5 text-(--text-soft) hover:text-(--brand) hover:bg-(--brand-soft) rounded-lg transition-colors border border-transparent hover:border-(--border-soft) cursor-pointer"
                            title="Edit Broker"
                          >
                            <Edit3 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(broker.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
                            title="Delete Broker"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>


      {showAddForm && createPortal(
        <div className="app-modal-backdrop fixed inset-0 flex items-center justify-center p-4 z-9999">
          <div className="app-modal w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-(--border-soft) flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-(--brand-soft) border border-(--border-soft) flex items-center justify-center">
                  <Users className="size-5 text-(--brand)" />
                </div>
                <div>
                  <h2 className="modal-title">{selectedBroker ? 'Update Partner' : 'New Onboarding'}</h2>
                  <p className="modal-subtitle mt-0.5">Enter broker credentials and details below.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="app-icon-button p-1.5 text-(--text-faint) hover:text-(--text-soft) hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="modal-label">Full Name <span className="text-rose-500">*</span></label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    className="app-input w-full px-3.5 py-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="modal-label">Email <span className="text-rose-500">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. john@domain.com"
                      className="app-input w-full px-3.5 py-2"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="modal-label">Phone <span className="text-rose-500">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 98765 43210"
                      className="app-input w-full px-3.5 py-2"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="modal-label">Commission (%) <span className="text-rose-500">*</span></label>
                    <input
                      name="commission"
                      value={formData.commission}
                      onChange={handleInputChange}
                      type="number"
                      step="0.01"
                      placeholder="e.g. 2.5"
                      className="app-input w-full px-3.5 py-2 text-(--brand) font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="modal-label">Joined Date <span className="text-rose-500">*</span></label>
                    <input
                      name="joined_date"
                      value={formData.joined_date}
                      onChange={handleInputChange}
                      type="date"
                      className="app-input w-full px-3.5 py-2"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-(--border-soft) flex justify-end gap-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="app-btn-secondary px-4 py-2 flex items-center justify-center text-[13px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary px-5 py-2 flex items-center justify-center text-[13px] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Syncing...' : selectedBroker ? 'Update Partner' : 'Onboard Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {activeDetailsBroker && (
        <BrokerDetailsModal
          broker={activeDetailsBroker}
          onClose={() => setActiveDetailsBroker(null)}
          isSubmodule={true}
        />
      )}
    </div>
  );
};

export default Brokers;
