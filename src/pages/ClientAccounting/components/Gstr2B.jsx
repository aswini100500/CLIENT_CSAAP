import React, { useState, useEffect } from 'react';
import { HiRefresh, HiSearch, HiDownload, HiCheckCircle, HiExclamationCircle, HiQuestionMarkCircle } from 'react-icons/hi';
import { Printer } from 'lucide-react';
import axios from 'axios';
import { useCompany } from '../context/CompanyContext';

const API = import.meta.env.VITE_ACCOUNTING_URL;
const fmt = n => '₹' + parseFloat(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtDate = ds => { try { return new Date(ds).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); } catch { return ds||''; }};
const getFY = ds => { const d=new Date(ds),m=d.getMonth(),y=d.getFullYear(); return m>=3?`${y}-${y+1}`:`${y-1}-${y}`; };

const STATUS = {
  MATCHED:           { label:'Matched',          cls:'bg-green-100 text-green-800',  Icon:HiCheckCircle },
  PARTIAL:           { label:'Partial',          cls:'bg-yellow-100 text-yellow-800',Icon:HiExclamationCircle },
  MISSING_IN_PORTAL: { label:'Missing in Portal',cls:'bg-orange-100 text-orange-800',Icon:HiQuestionMarkCircle },
  MISMATCH:          { label:'Mismatch',         cls:'bg-red-100 text-red-800',      Icon:HiExclamationCircle },
};

const TABS = ['ITC Available','ITC Unavailable','Supplier-wise','All Purchases'];

export default function Gstr2B() {
  const { companyId } = useCompany();
  const [tab,   setTab]   = useState('All Purchases');
  const [fy,    setFY]    = useState('');
  const [month, setMonth] = useState('');
  const [search,setSearch]= useState('');
  const [data,  setData]  = useState([]);
  const [supply,setSupply]= useState([]);
  const [summary,setSummary]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,  setError]  =useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const q = month ? `?month=${month}` : fy ? `?fy=${fy}` : '';
      const [r1,r2,r3] = await Promise.all([
        axios.get(`${API}/api/gstr2b/${companyId}${q}`),
        axios.get(`${API}/api/gstr2b/summary/${companyId}${q}`),
        axios.get(`${API}/api/gstr2b/supplier/${companyId}${q}`),
      ]);
      setData(r1.data.data||[]);
      setSummary(r2.data.data||null);
      setSupply(r3.data.data||[]);
      setError(null);
    } catch(e){ setError('Failed to load GSTR-2B data'); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{ fetchAll(); },[fy,month]);
  const fyList=[...new Set(data.map(v=>getFY(v.date)))].sort();
  useEffect(()=>{ if(!fy&&fyList.length) setFY(fyList[fyList.length-1]); },[fyList.length]);

  const q = search.toLowerCase();
  const filtered = data.filter(v=>{
    const matchTab = tab==='All Purchases' ? true
      : tab==='ITC Available'   ? v.matchStatus==='MATCHED'||v.matchStatus==='PARTIAL'
      : tab==='ITC Unavailable' ? v.matchStatus==='MISSING_IN_PORTAL'||v.matchStatus==='MISMATCH'
      : true;
    const matchSrch = !q||(v.supplierName||'').toLowerCase().includes(q)||(v.supplierGSTIN||'').toLowerCase().includes(q)||(v.supplierInvoiceNo||'').toLowerCase().includes(q);
    return matchTab&&matchSrch;
  });

  const exportCSV = () => {
    const cols=['supplierName','supplierGSTIN','supplierInvoiceNo','date','subtotal','cgst','sgst','igst','eligibleITC','matchStatus'];
    const rows=[cols.join(','),...filtered.map(v=>cols.map(c=>`"${v[c]||''}"`).join(','))];
    const blob=new Blob([rows.join('\n')],{type:'text/csv'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='GSTR2B.csv';a.click();
  };

  if(loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-blue-600"/><span className="ml-3 text-gray-500">Loading GSTR-2B…</span></div>;
  if(error)   return <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex justify-between"><p className="text-red-700">{error}</p><button onClick={fetchAll} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex gap-2 items-center"><HiRefresh/>Retry</button></div>;

  return (
    <div className="space-y-4">

      <div className="bg-linear-to-r from-indigo-700 to-indigo-500 rounded-xl p-5 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">GSTR-2B — ITC Reconciliation</h2>
            <p className="text-indigo-100 text-sm">Auto-generated from Purchase Vouchers · No manual entry needed</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select value={fy} onChange={e=>{setFY(e.target.value);setMonth('');}}
              className="bg-white/20 text-white border border-white/40 rounded-lg px-3 py-1.5 text-sm">
              {fyList.map(f=><option key={f} value={f} className="text-gray-800">FY {f}</option>)}
            </select>
            <input type="month" value={month} onChange={e=>setMonth(e.target.value)}
              className="bg-white/20 text-white border border-white/40 rounded-lg px-3 py-1.5 text-sm"/>
            <button onClick={fetchAll}  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm flex gap-1 items-center"><HiRefresh className="w-4 h-4"/>Refresh</button>
            <button onClick={exportCSV} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm flex gap-1 items-center"><HiDownload className="w-4 h-4"/>CSV</button>
            <button onClick={()=>window.print()} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm flex gap-1 items-center"><Printer className="w-4 h-4"/>Print</button>
          </div>
        </div>
      </div>


      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {l:'Total Invoices', v:summary.totalInvoices||0,     c:'gray',   fmt:false},
            {l:'Total ITC',      v:fmt(summary.totalITC),        c:'indigo', fmt:true },
            {l:'Eligible ITC',   v:fmt(summary.eligibleITC),     c:'green',  fmt:true },
            {l:'Ineligible ITC', v:fmt(summary.ineligibleITC),   c:'red',    fmt:true },
          ].map(x=>(
            <div key={x.l} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{x.l}</p>
              <p className={`text-xl font-bold mt-1 text-${x.c}-700`}>{x.v}</p>
            </div>
          ))}
        </div>
      )}


      <div className="flex border-b border-gray-200 overflow-x-auto">
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab===t?'border-indigo-600 text-indigo-700':'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>


      <div className="relative">
        <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search supplier, GSTIN, invoice no…"
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
      </div>


      {tab==='Supplier-wise' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Supplier-wise ITC Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100"><tr>
                {['Supplier','GSTIN','Invoices','Taxable','CGST','SGST','IGST','Total ITC'].map(h=>(
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {supply.length===0
                  ? <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No data</td></tr>
                  : supply.map((s,i)=>(
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.supplierName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.supplierGSTIN||'—'}</td>
                      <td className="px-4 py-3 text-center">{s.invoiceCount}</td>
                      <td className="px-4 py-3 text-right">{fmt(s.taxableValue)}</td>
                      <td className="px-4 py-3 text-right text-green-700">{fmt(s.cgst)}</td>
                      <td className="px-4 py-3 text-right text-green-700">{fmt(s.sgst)}</td>
                      <td className="px-4 py-3 text-right text-purple-700">{fmt(s.igst)}</td>
                      <td className="px-4 py-3 text-right font-bold text-indigo-700">{fmt(s.totalITC)}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}


      {tab!=='Supplier-wise' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0"><tr>
                {['Supplier / GSTIN','Supplier Inv No','Date','Place of Supply','Taxable','CGST','SGST','IGST','Eligible ITC','Status'].map(h=>(
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length===0
                  ? <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">No purchase records for this period</td></tr>
                  : filtered.map(v=>{
                    const st = STATUS[v.matchStatus]||STATUS.MATCHED;
                    return (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <p className="font-medium text-gray-900">{v.supplierName}</p>
                          {v.supplierGSTIN&&<p className="text-xs font-mono text-gray-400">{v.supplierGSTIN}</p>}
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-gray-600 whitespace-nowrap">{v.supplierInvoiceNo||'—'}</td>
                        <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{fmtDate(v.date)}</td>
                        <td className="px-3 py-3 text-xs text-gray-500">{v.placeOfSupply||'—'}</td>
                        <td className="px-3 py-3 text-right font-medium text-gray-900 whitespace-nowrap">{fmt(v.subtotal)}</td>
                        <td className="px-3 py-3 text-right text-green-700 whitespace-nowrap">{fmt(v.cgst)}</td>
                        <td className="px-3 py-3 text-right text-green-700 whitespace-nowrap">{fmt(v.sgst)}</td>
                        <td className="px-3 py-3 text-right text-purple-700 whitespace-nowrap">{fmt(v.igst)}</td>
                        <td className="px-3 py-3 text-right font-bold text-indigo-700 whitespace-nowrap">{fmt(v.eligibleITC)}</td>
                        <td className="px-3 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${st.cls}`}>
                            <st.Icon className="w-3 h-3"/>{st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                }
                {filtered.length>0&&(
                  <tr className="bg-gray-900 text-white">
                    <td colSpan={4} className="px-3 py-3 text-right text-xs font-bold uppercase tracking-widest">Total ({filtered.length})</td>
                    <td className="px-3 py-3 text-right font-bold">{fmt(filtered.reduce((s,v)=>s+parseFloat(v.subtotal||0),0))}</td>
                    <td className="px-3 py-3 text-right font-bold">{fmt(filtered.reduce((s,v)=>s+parseFloat(v.cgst||0),0))}</td>
                    <td className="px-3 py-3 text-right font-bold">{fmt(filtered.reduce((s,v)=>s+parseFloat(v.sgst||0),0))}</td>
                    <td className="px-3 py-3 text-right font-bold">{fmt(filtered.reduce((s,v)=>s+parseFloat(v.igst||0),0))}</td>
                    <td className="px-3 py-3 text-right font-bold">{fmt(filtered.reduce((s,v)=>s+parseFloat(v.eligibleITC||0),0))}</td>
                    <td/>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}