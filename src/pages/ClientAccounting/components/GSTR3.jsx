import React, { useState } from 'react';
import { HiCalculator, HiDownload, HiCheckCircle, HiCurrencyRupee } from 'react-icons/hi';

const GSTR3 = () => {
  const [selectedMonth, setSelectedMonth] = useState('dec2023');

  const taxLiability = {
    outwardTax: '₹3,37,500',
    inwardTax: '₹4,41,000',
    reverseCharge: '₹12,500',
    interest: '₹0',
    penalty: '₹0',
    totalPayable: '₹0',
    totalRefund: '₹1,03,500'
  };

  const sections = [
    { id: 3.1, name: 'Outward taxable supplies', value: '₹18,75,000', tax: '₹3,37,500' },
    { id: 4, name: 'Inward supplies liable to reverse charge', value: '₹69,444', tax: '₹12,500' },
    { id: 5, name: 'Non-GST inward supplies', value: '₹2,50,000', tax: '₹0' },
    { id: 6.1, name: 'ITC Available', value: '₹4,41,000', tax: '₹4,41,000' },
    { id: 6.2, name: 'ITC Reversed', value: '₹15,000', tax: '₹15,000' }
  ];

  const paymentMethods = [
    { method: 'ITC Utilization', amount: '₹3,37,500' },
    { method: 'Cash Ledger', amount: '₹0' },
    { method: 'Credit/Debit Card', amount: '₹0' },
    { method: 'Net Banking', amount: '₹0' }
  ];

  return (
    <div className="space-y-6">

      <div className="bg-linear-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-orange-800">GSTR-3B Monthly Return</h3>
            <p className="text-orange-600">Summary of outward supplies and tax liability</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-orange-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="dec2023">December 2023 (Due: 20 Jan 2024)</option>
              <option value="nov2023">November 2023 (Due: 20 Dec 2023)</option>
              <option value="oct2023">October 2023 (Due: 20 Nov 2023)</option>
            </select>
            
            <button className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center">
              <HiCalculator className="w-5 h-5 mr-2" />
              Calculate Liability
            </button>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Outward Tax</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">{taxLiability.outwardTax}</p>
            </div>
            <HiCurrencyRupee className="w-10 h-10 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Input Tax Credit</p>
              <p className="text-3xl font-bold text-green-700 mt-2">{taxLiability.inwardTax}</p>
            </div>
            <HiCalculator className="w-10 h-10 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Net Tax Payable</p>
              <p className="text-3xl font-bold text-red-700 mt-2">{taxLiability.totalPayable}</p>
            </div>
            <HiCurrencyRupee className="w-10 h-10 text-red-400" />
          </div>
        </div>
        
        <div className="bg-white border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Refund Amount</p>
              <p className="text-3xl font-bold text-purple-700 mt-2">{taxLiability.totalRefund}</p>
            </div>
            <HiCheckCircle className="w-10 h-10 text-purple-400" />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Tax Computation</h4>
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="flex justify-between items-center py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-700">{section.name}</p>
                  <p className="text-sm text-gray-500">Section {section.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{section.value}</p>
                  <p className="text-sm text-gray-500">Tax: {section.tax}</p>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-gray-800">Total Tax Liability</span>
                <span className="font-bold text-blue-700">{taxLiability.outwardTax}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-gray-800">Total ITC Available</span>
                <span className="font-bold text-green-700">{taxLiability.inwardTax}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-semibold text-gray-800">Reverse Charge Tax</span>
                <span className="font-bold text-orange-700">{taxLiability.reverseCharge}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-gray-50 p-3 rounded-lg mt-2">
                <span className="font-bold text-gray-800">Net Tax Payable/(Refund)</span>
                {taxLiability.totalPayable === '₹0' ? (
                  <span className="font-bold text-green-700">Refund: {taxLiability.totalRefund}</span>
                ) : (
                  <span className="font-bold text-red-700">Payable: {taxLiability.totalPayable}</span>
                )}
              </div>
            </div>
          </div>
        </div>


        <div className="space-y-6">

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h4>
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <span className="text-gray-600">{method.method}</span>
                  <span className="font-medium text-gray-900">{method.amount}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-800">Total Payment</span>
                <span className="font-bold text-blue-700">{taxLiability.totalPayable}</span>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Make Payment
              </button>
            </div>
          </div>


          <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-green-800 mb-4">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-white border border-green-300 text-green-700 p-4 rounded-lg hover:bg-green-50 transition-colors flex flex-col items-center">
                <HiDownload className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Draft JSON</span>
              </button>
              <button className="bg-white border border-blue-300 text-blue-700 p-4 rounded-lg hover:bg-blue-50 transition-colors flex flex-col items-center">
                <HiCheckCircle className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Preview</span>
              </button>
              <button className="bg-white border border-purple-300 text-purple-700 p-4 rounded-lg hover:bg-purple-50 transition-colors flex flex-col items-center">
                <HiCalculator className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Re-calculate</span>
              </button>
              <button className="bg-white border border-orange-300 text-orange-700 p-4 rounded-lg hover:bg-orange-50 transition-colors flex flex-col items-center">
                <HiDownload className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Save PDF</span>
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-green-200">
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                Submit GSTR-3B
              </button>
              <p className="text-xs text-green-600 text-center mt-2">
                After submission, ARN will be generated
              </p>
            </div>
          </div>
        </div>
      </div>


      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-yellow-800 mb-3">Important Notes</h4>
        <ul className="space-y-2 text-yellow-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Ensure all data from GSTR-1 and GSTR-2B is reconciled before filing GSTR-3B</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Payment must be made before filing the return</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Late filing attracts interest @18% p.a. and late fees</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Refund claims will be processed separately after return filing</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GSTR3;