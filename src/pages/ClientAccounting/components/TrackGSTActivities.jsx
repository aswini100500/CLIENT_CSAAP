import React, { useState } from 'react';
import { 
  HiCheckCircle, 
  HiClock, 
  HiExclamationCircle,
  HiDownload,
  HiEye 
} from 'react-icons/hi';

const TrackGSTActivities = () => {
  const [timePeriod, setTimePeriod] = useState('currentQuarter');

  const activities = [
    {
      id: 1,
      returnType: 'GSTR-3B',
      period: 'Dec 2023',
      dueDate: '20 Jan 2024',
      status: 'filed',
      filedDate: '18 Jan 2024',
      arn: 'ARN1234567890'
    },
    {
      id: 2,
      returnType: 'GSTR-1',
      period: 'Dec 2023',
      dueDate: '11 Jan 2024',
      status: 'filed',
      filedDate: '10 Jan 2024',
      arn: 'ARN1234567891'
    },
    {
      id: 3,
      returnType: 'GSTR-2B',
      period: 'Dec 2023',
      dueDate: '15 Jan 2024',
      status: 'pending',
      filedDate: '-',
      arn: '-'
    },
    {
      id: 4,
      returnType: 'GSTR-3B',
      period: 'Jan 2024',
      dueDate: '20 Feb 2024',
      status: 'upcoming',
      filedDate: '-',
      arn: '-'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'filed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'filed': return <HiCheckCircle className="w-5 h-5" />;
      case 'pending': return <HiExclamationCircle className="w-5 h-5" />;
      case 'upcoming': return <HiClock className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select 
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="currentQuarter">Current Quarter (Oct-Dec 2023)</option>
          <option value="previousQuarter">Previous Quarter (Jul-Sep 2023)</option>
          <option value="financialYear">Financial Year 2023-24</option>
        </select>
        
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Refresh Status
        </button>
      </div>

      {/* Activities Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Return Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filed Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ARN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{activity.returnType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {activity.period}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {activity.dueDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                    <span className="ml-2 capitalize">{activity.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {activity.filedDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {activity.arn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <HiEye className="w-5 h-5" />
                    </button>
                    {activity.status === 'filed' && (
                      <button className="text-green-600 hover:text-green-800">
                        <HiDownload className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Filed Returns</p>
              <p className="text-3xl font-bold text-green-700 mt-2">2</p>
            </div>
            <HiCheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Pending Filings</p>
              <p className="text-3xl font-bold text-red-700 mt-2">1</p>
            </div>
            <HiExclamationCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Upcoming Due</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">1</p>
            </div>
            <HiClock className="w-12 h-12 text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackGSTActivities;