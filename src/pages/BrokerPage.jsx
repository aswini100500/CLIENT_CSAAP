import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import client from '../api/client'; 
import BrokerPageDetailsModal from './BrokerPageDetailsModal'; 


const fetcher = (url) => client.get(url).then((res) => res.data.brokers || res.data.data);

const BrokerPage = () => {
  const API_ENDPOINT = '/api/tenant/broker';
  

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [activeDetailsBroker, setActiveDetailsBroker] = useState(null);
  

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');



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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedBroker) {
        await client.put(`${API_ENDPOINT}/${selectedBroker.id}`, formData);
        triggerToast("Broker updated successfully!");
      } else {
        await client.post(API_ENDPOINT, formData);
        triggerToast("Broker added successfully!");
      }
      mutate(swrKey); 
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Error processing request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this broker?")) return;
    try {
      await client.delete(`${API_ENDPOINT}/${id}`);
      mutate(swrKey);
      triggerToast("Broker removed successfully!");
    } catch (err) {
      alert("Delete failed");
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 relative overflow-hidden font-sans">


      <div className={`fixed top-20 right-8 z-999 transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center gap-4 bg-white border border-blue-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] px-6 py-4 rounded-2xl ${showToast ? 'translate-x-0 opacity-100' : '-translate-x-32 opacity-0 pointer-events-none'}`}>
        <div className="bg-blue-600 rounded-full p-1.5 shadow-lg shadow-blue-200">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-black text-slate-900 leading-tight">{toastMessage}</p>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">Live Sync Successful</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Brokers</h1>
            <p className="text-slate-500 font-medium text-md">Manage your company's high-impact partners.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <input 
                type="text"
                placeholder="Search Brokers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border-none rounded-2xl px-6 py-4 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-600 font-medium"
              />
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl shadow-green-200 transition-all active:scale-95"
            >
              + Add Brokers
            </button>
          </div>
        </header>


        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] min-h-125 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
                <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Fetching Data</p>
              </div>
            </div>
          ) : brokers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100">
                <svg className="w-14 h-14 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {searchTerm ? `No results found for "${searchTerm}"` : 'The company has no brokers yet'}
              </h3>
              <button 
                onClick={() => searchTerm ? setSearchTerm('') : setShowAddForm(true)}
                className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                {searchTerm ? 'Clear Search' : 'Create First Entry'}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-[11px] uppercase text-slate-400 font-black tracking-[0.2em]">
                    <th className="px-10 py-6">Partner Information</th>
                    <th className="px-6 py-6 text-center">Commission</th>
                    <th className="px-6 py-6">Joined Date</th>
                    <th className="px-10 py-6 text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {brokers.map(broker => (
                    <tr key={broker.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
                            {broker.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-md leading-tight">{broker.name}</div>
                            <div className="text-sm text-slate-400 font-medium">{broker.email}</div>
                            <div className="text-xs text-slate-400 font-bold mt-1">{broker.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-7 text-center">
                        <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-2xl font-mono font-black text-base border border-blue-100">
                          {broker.commission}%
                        </span>
                      </td>
                      <td className="px-6 py-7 font-bold text-slate-500">
                        {new Date(broker.joined_date).toLocaleDateString()}
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setActiveDetailsBroker(broker)} className="p-3 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-xl transition-all shadow-sm" title="View Leads & Customers">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button onClick={() => openEditModal(broker)} className="p-3 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-xl transition-all shadow-sm" title="Edit Broker">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(broker.id)} className="p-3 bg-white border border-rose-100 text-rose-400 hover:text-rose-600 rounded-xl transition-all shadow-sm" title="Delete Broker">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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


      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-500 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedBroker ? 'Update Partner' : 'New Onboarding'}</h2>
              <p className="text-slate-400 font-medium">Enter broker credentials and details below.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" required />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Commission (%)</label>
                  <input name="commission" value={formData.commission} onChange={handleInputChange} type="number" step="0.01" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-600" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date</label>
                  <input name="joined_date" value={formData.joined_date} onChange={handleInputChange} type="date" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" required />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-8">
                <button type="button" onClick={closeModal} className="px-6 py-2 text-slate-400 font-bold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl disabled:bg-slate-300">
                  {isSubmitting ? 'Syncing...' : (selectedBroker ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {activeDetailsBroker && (
        <BrokerPageDetailsModal
          broker={activeDetailsBroker}
          onClose={() => setActiveDetailsBroker(null)}
        />
      )}
    </div>
  );
};

export default BrokerPage;