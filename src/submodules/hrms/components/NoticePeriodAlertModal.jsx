import React from "react";
import { X, UserMinus, RotateCcw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const NoticePeriodAlertModal = ({ 
  isOpen, 
  onClose, 
  alerts, 
  onAction, 
  actionLoading 
}) => {
  const [extendingId, setExtendingId] = React.useState(null);
  const [extraDays, setExtraDays] = React.useState("7");

  if (!isOpen || alerts.length === 0) return null;

  const handleAction = (item, action) => {
    if (action === "extend") {
      if (extendingId === item.id) {
        onAction(item, action, Number.parseInt(extraDays, 10));
        setExtendingId(null);
      } else {
        setExtendingId(item.id);
      }
    } else {
      onAction(item, action);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Notice Period Action Required</h3>
              <p className="text-sm text-gray-500">
                {alerts.length} employee{alerts.length === 1 ? "" : "s"} need immediate action.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>


        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {alerts.map((item) => {
            const loadingKeyPrefix = `${item.source}-${item.id}`;
            const isExtending = extendingId === item.id;
            
            return (
              <div 
                key={`${item.source}-${item.id}`}
                className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.designation || "Employee"}{item.department ? ` • ${item.department}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      Notice ends on: {item.noticeEndDate ? new Date(item.noticeEndDate).toLocaleDateString("en-IN") : "-"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!isExtending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction(item, "extend")}
                          disabled={actionLoading.startsWith(loadingKeyPrefix)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50 transition-colors"
                        >
                          <RotateCcw size={16} />
                          Extend
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(item, "regularise")}
                          disabled={actionLoading.startsWith(loadingKeyPrefix)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle size={16} />
                          Regularise
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(item, "reject")}
                          disabled={actionLoading.startsWith(loadingKeyPrefix)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isExtending && (
                  <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl animate-in slide-in-from-top-2 duration-200">
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase font-bold text-blue-600 mb-1">Extension Days</label>
                      <input 
                        type="number"
                        value={extraDays}
                        onChange={(e) => setExtraDays(e.target.value)}
                        className="w-full bg-white border border-blue-100 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2 self-end">
                      <button
                        onClick={() => setExtendingId(null)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAction(item, "extend")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                      >
                        Confirm Extension
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>


        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      

    </div>
  );
};

export default NoticePeriodAlertModal;
