"use client";

import { useEffect, useState } from "react";

export default function AgentDeskPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const response = await fetch(`${baseUrl}/api/admin/agent-requests`);
      if (!response.ok) {
        throw new Error("Failed to fetch agent requests");
      }
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const response = await fetch(`${baseUrl}/api/admin/agent-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req))
      );
      
      setToastMessage("Status updated successfully!");
      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "contacted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-app-sky p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-3xl border border-app-border bg-white/75 p-6 backdrop-blur">
          <h1 className="text-3xl font-extrabold text-app-slate">Agent Request Desk</h1>
          <p className="mt-2 text-sm text-app-muted">
            Manage incoming itinerary customizations and user agent requests.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-app-border bg-white/75 shadow-sm backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-app-slate">
              <thead className="bg-white/50 text-xs uppercase tracking-wider text-app-muted border-b border-app-border">
                <tr>
                  <th scope="col" className="px-6 py-5 font-semibold">Date Requested</th>
                  <th scope="col" className="px-6 py-5 font-semibold">User</th>
                  <th scope="col" className="px-6 py-5 font-semibold">Trip Destination</th>
                  <th scope="col" className="px-6 py-5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-app-muted">Loading requests...</td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-app-muted">No agent requests found.</td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="transition hover:bg-white/90">
                      <td className="whitespace-nowrap px-6 py-5">
                        {req.createdAt ? new Date(req.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "Unknown"}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-app-slate">{req.user?.name}</div>
                        <div className="mt-0.5 text-xs text-app-muted">{req.user?.email}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-app-slate">{req.trip?.destination}</div>
                        <div className="mt-0.5 text-xs text-app-muted">
                          {req.trip?.startDate ? new Date(req.trip.startDate).toLocaleDateString("en-US", { dateStyle: "medium" }) : "No date"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value)}
                          className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-app-slate/30 transition-colors cursor-pointer ${getStatusColor(req.status)}`}
                        >
                          <option value="pending" className="bg-white text-slate-900 normal-case tracking-normal">Pending</option>
                          <option value="contacted" className="bg-white text-slate-900 normal-case tracking-normal">Contacted</option>
                          <option value="resolved" className="bg-white text-slate-900 normal-case tracking-normal">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {toastMessage && (
          <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-4 shadow-lg text-emerald-800 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            <span className="font-semibold text-sm">{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
