import React from "react";

const TrackCasesModal = ({ open, onClose, complaints }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl z-10 p-8 flex flex-col">
        <button className="absolute top-3 right-3 text-orange-500 hover:text-orange-700 text-xl font-bold z-20" onClick={onClose}>×</button>
        <h2 className="text-2xl font-bold text-[#273F4F] mb-6">Your Cases</h2>
        <div className="space-y-4">
          {(!complaints || complaints.length === 0) && <div className="text-[#447D9B]">No cases filed yet.</div>}
          {complaints && complaints.map((c) => (
            <div key={c.id} className="border border-[#D7D7D7] rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between bg-white shadow-sm">
              <div>
                <div className="font-semibold text-[#273F4F]">{c.incidentType}</div>
                <div className="text-sm text-[#447D9B]">{c.description}</div>
                <div className="text-xs text-gray-500 mt-1">Filed on: {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : ''}</div>
              </div>
              <div className="mt-2 md:mt-0 flex flex-col items-end">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.status === 'solved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{c.status === 'solved' ? 'Solved' : 'Pending'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackCasesModal;
