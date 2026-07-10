import { useState } from "react";

const AdvancePayment = () => {

  const [formData, setFormData] = useState({
    advanceAmount: "",
    duration: "",
    modeOfPayment: "",
    paymentDate: "",
  });


  const [advanceRecords, setAdvanceRecords] = useState([
    {
      id: 1,
      advanceAmount: "2,500.00",
      duration: "3 months",
      isClear: true,
      amountPending: "0.00",
      modeOfPayment: "Bank Transfer",
      paymentDate: "2024-03-15",
    },
    {
      id: 2,
      advanceAmount: "1,800.00",
      duration: "2 months",
      isClear: false,
      amountPending: "900.00",
      modeOfPayment: "Cash",
      paymentDate: "2024-04-10",
    },
  ]);


  const [searchTerm, setSearchTerm] = useState("");


  const [entriesPerPage, setEntriesPerPage] = useState(10);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  const handleSubmit = (e) => {
    e.preventDefault();


    const newRecord = {
      id: Date.now(),
      advanceAmount: parseFloat(formData.advanceAmount).toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      ),
      duration: formData.duration,
      modeOfPayment: formData.modeOfPayment,
      paymentDate: formData.paymentDate,
      isClear: false,
      amountPending: formData.advanceAmount,
    };


    setAdvanceRecords([...advanceRecords, newRecord]);


    setFormData({
      advanceAmount: "",
      duration: "",
      modeOfPayment: "",
      paymentDate: "",
    });

    alert("Advance payment saved successfully!");
  };


  const filteredRecords = advanceRecords.filter(
    (record) =>
      record.advanceAmount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.modeOfPayment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.duration.toLowerCase().includes(searchTerm.toLowerCase()),
  );


  const toggleClearance = (id) => {
    setAdvanceRecords(
      advanceRecords.map((record) =>
        record.id === id
          ? {
              ...record,
              isClear: !record.isClear,
              amountPending: record.isClear ? record.advanceAmount : "0.00",
            }
          : record,
      ),
    );
  };


  const deleteRecord = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setAdvanceRecords(advanceRecords.filter((record) => record.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        <header className="mb-6">
          <h2 className="text-2xl md:text-2xl font-bold text-gray-800">
            Advance Payment Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage employee advance payments efficiently
          </p>
        </header>


        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Advance Payment
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      name="advanceAmount"
                      value={formData.advanceAmount}
                      onChange={handleInputChange}
                      className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
                    placeholder="e.g., 3 months"
                    required
                  />
                </div>
              </div>


              <div className="space-y-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode of Payment
                  </label>
                  <select
                    name="modeOfPayment"
                    value={formData.modeOfPayment}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3"
                    required
                  />
                </div>
              </div>
            </div>


            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="w-full md:w-auto py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save
              </button>
            </div>
          </form>
        </div>


        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Advance Details
            </h2>
          </div>


          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md py-1 px-2 text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-gray-700 ml-2">entries</span>
            </div>

            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2"
              />
            </div>
          </div>


          <div className="overflow-x-auto rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Advance Amount
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount Pending
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment Method
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment Date
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.length > 0 ? (
                  filteredRecords.slice(0, entriesPerPage).map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${record.advanceAmount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${record.isClear ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          onClick={() => toggleClearance(record.id)}
                          title="Click to toggle status"
                        >
                          {record.isClear ? "Cleared" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        ${record.amountPending}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {record.modeOfPayment}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {record.duration}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {record.paymentDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => alert(`Edit record ${record.id}`)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => deleteRecord(record.id)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      <svg
                        className="w-12 h-12 mx-auto text-gray-300 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p>No advance payments recorded yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>


          <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-sm text-gray-700">
            <div>
              Showing{" "}
              <span className="font-medium">
                {filteredRecords.length > 0 ? 1 : 0}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(filteredRecords.length, entriesPerPage)}
              </span>{" "}
              of <span className="font-medium">{filteredRecords.length}</span>{" "}
              entries
            </div>
            <div className="mt-2 md:mt-0 flex space-x-2">
              <button className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300">
                Previous
              </button>
              <button className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancePayment;
