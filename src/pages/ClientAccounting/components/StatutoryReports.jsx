
import React, { useState } from 'react';
import {
  HiChartBar,
  HiDocumentReport,
  HiShoppingCart,
  HiShoppingBag,
} from 'react-icons/hi';
import { BiListOl, BiRefresh, BiReceipt } from 'react-icons/bi';
import { MdPayments } from 'react-icons/md';

import Card from '../components/common/Card';
import GSTActivities from './TrackGSTActivities';
import GSTR1 from './GSTR1';
import GSTR3B from './GSTR3B';
import E_wayBill from './E_wayBill';
import Gstr2B from './Gstr2B';


const StatutoryReports = () => {
  const [activeModule, setActiveModule] = useState('dashboard');


  const modules = [
    {
      id: 'track-gst',
      title: 'Track GST Activities',
      description: 'Monitor all GST return filing statuses and activities',
      icon: <HiChartBar className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200',
      component: <GSTActivities />,
    },
    {
      id: 'gstr-1',
      title: 'GSTR-1 (Sales)',
      description: 'File outward supplies / sales returns',
      icon: <HiShoppingCart className="w-8 h-8 text-green-600" />,
      color: 'bg-green-50 border-green-200',
      component: <GSTR1 />,
    },
    {
      id: 'gstr-2b',
      title: 'GSTR-2b',
      description: 'View auto-populated purchase returns',
      icon: <HiShoppingBag className="w-8 h-8 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200',
      component: <Gstr2B />,
    },
    {
      id: 'gstr-3b',
      title: 'GSTR-3B',
      description: 'View auto-populated purchase returns',
      icon: <HiShoppingBag className="w-8 h-8 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200',
      component: <GSTR3B />,
    },

    {
      id: 'e-way-bill',
      title: 'e-Way Bill',
      description: 'Generate and manage e-way bills',
      icon: <BiListOl className="w-8 h-8 text-red-600" />,
      color: 'bg-red-50 border-red-200',
      component: <E_wayBill />,
    },


    {
      id: 'gst-portal',
      title: 'Open GST Portal',
      description: 'Open official GST government website',
      icon: <HiDocumentReport className="w-8 h-8 text-orange-600" />,
      color: 'bg-orange-50 border-orange-200',
      external: true,
      url: 'https://services.gst.gov.in/services/login/',
    },
  ];


  const renderModuleContent = () => {
    if (activeModule === 'dashboard') {
      return (
        <div className="space-y-6">

          <div className="bg-white rounded-xl p-6 border">
            <h1 className="text-2xl font-bold text-gray-800">
              Statutory Reports Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all GST filings and compliance activities
            </p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  if (module.external && module.url) {
                    window.open(module.url, '_blank', 'noopener,noreferrer');
                  } else {
                    setActiveModule(module.id);
                  }
                }}
                className={`${module.color} border rounded-xl p-6 text-left hover:shadow-md transition`}
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-white border">
                    {module.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {module.description}
                    </p>
                    <p className="text-blue-600 text-sm mt-3 font-medium">
                      {module.external ? 'Open in new tab →' : 'Click to open →'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }


    const module = modules.find((m) => m.id === activeModule);

    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveModule('dashboard')}
          className="text-gray-600 hover:text-blue-600"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-xl  p-1">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-white border rounded-lg">
              {module.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {module.title}
              </h2>
              <p className="text-gray-600">{module.description}</p>
            </div>
          </div>

          {module.component}
        </div>
      </div>
    );
  };

  return <div className="max-w-7xl mx-auto">{renderModuleContent()}</div>;
};

export default StatutoryReports;
