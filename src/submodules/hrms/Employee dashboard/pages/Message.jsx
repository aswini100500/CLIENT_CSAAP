import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../../hooks/useAuth";

const MyMessage = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const slug = user?.slug;
  const companyId = user?.company_id ?? user?.id;

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.employee_id) {
        console.error("Missing employee_id");
        setError("Employee ID not found");
        setLoading(false);
        return;
      }

      if (!companyId) {
        console.error("Missing company_id");
        setError("Company ID not found");
        setLoading(false);
        return;
      }

      if (!slug) {
        console.error("Missing slug");
        setError("Slug not found");
        setLoading(false);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_HRMS_BASE_URL}/api/messages/employee`;
      const params = {
        employee_id: user?.employee_id,
        company_id: companyId,
        slug: slug,
      };

      const res = await axios.get(apiUrl, { params });

      let messagesData = [];
      if (res.data?.data && Array.isArray(res.data.data)) {
        messagesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        messagesData = res.data;
      } else if (res.data?.messages && Array.isArray(res.data.messages)) {
        messagesData = res.data.messages;
      } else {
        console.warn("Unexpected response structure:", res.data);
        messagesData = [];
      }

      setMessages(messagesData);
    } catch (err) {
      console.error("Error fetching messages:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);

      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Response data:", err.response.data);
        setError(
          `API Error: ${err.response.status} - ${err.response.data?.message || err.message}`,
        );
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.employee_id && companyId && slug) {
      fetchMessages();
    } else {
    }
  }, [user?.employee_id, companyId, slug]);

  const filteredMessages = messages.filter(
    (msg) =>
      msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Message</h1>
        </div>

        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Loading messages...
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-300 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-700">Search:</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b">
                    Sent Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b">
                    Heading
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b">
                    Attachment
                  </th>
                </tr>
              </thead>

              <tbody>
                {!loading && filteredMessages.length === 0 && !error && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No messages found
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredMessages.slice(0, entriesPerPage).map((msg) => (
                    <tr key={msg.id || msg._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {msg.created_at
                          ? new Date(msg.created_at).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {msg.subject || "No Subject"}
                      </td>
                      <td className="px-4 py-3">
                        {msg.message ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: msg.message }}
                          />
                        ) : (
                          "No description"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {msg.attachment ? (
                          <a
                            href={`${import.meta.env.VITE_HRMS_BASE_URL}/uploads/messages/${msg.attachment}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            View
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white px-4 py-3 border-t border-gray-300">
            <div className="text-sm text-gray-700">
              Showing {filteredMessages.length} entries
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyMessage;
