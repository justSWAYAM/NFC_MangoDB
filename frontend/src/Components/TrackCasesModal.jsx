import React, { useState } from "react";
import { ArrowUpCircle, AlertTriangle, Eye, X, Clock, FileText, CheckCircle } from "lucide-react";

const TrackCasesModal = ({ open, onClose, complaints, onEscalate, onInvestigate }) => {
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCaseDetails, setShowCaseDetails] = useState(false);

  if (!open) return null;

  const handleViewDetails = (complaint) => {
    setSelectedCase(complaint);
    setShowCaseDetails(true);
  };

  const handleEscalate = (complaintId) => {
    if (onEscalate) {
      onEscalate(complaintId);
    }
  };

  const handleInvestigate = (complaintId) => {
    if (onInvestigate) {
      onInvestigate(complaintId);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper function to check if scheduled date has passed
  const isScheduledDatePassed = (scheduledDate) => {
    if (!scheduledDate) return false;
    const scheduled = new Date(scheduledDate);
    const now = new Date();
    return scheduled < now;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl z-10 p-8 flex flex-col max-h-[90vh] overflow-y-auto">
        <button className="absolute top-3 right-3 text-orange-500 hover:text-orange-700 text-xl font-bold z-20" onClick={onClose}>×</button>
        <h2 className="text-2xl font-bold text-[#273F4F] mb-6">Your Cases</h2>
        
        <div className="space-y-4">
          {(!complaints || complaints.length === 0) && (
            <div className="text-[#447D9B] text-center py-8">No cases filed yet.</div>
          )}
          
          {complaints && complaints.map((c) => (
            <div key={c.id} className="border border-[#D7D7D7] rounded-lg p-4 bg-white shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="font-semibold text-[#273F4F]">{c.incidentType}</div>
                    {c.priority && (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        c.priority === 'High' ? 'bg-red-100 text-red-700' :
                        c.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {c.priority} Priority
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[#447D9B] line-clamp-2">{c.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Filed on: {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : c.createdAt}
                  </div>
                  {c.lastUpdate && (
                    <div className="text-xs text-gray-500">
                      Last updated: {c.lastUpdate}
                    </div>
                  )}
                  
                  {/* Evidence Status */}
                  {c.evidenceSchedule && (
                    <div className="mt-2">
                      {c.evidenceSchedule.submitted ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Evidence submitted</span>
                          {c.evidenceSchedule.submittedAt && (
                            <span className="text-xs text-gray-500">
                              on {c.evidenceSchedule.submittedAt?.toDate ? 
                                c.evidenceSchedule.submittedAt.toDate().toLocaleDateString() : 
                                formatDate(c.evidenceSchedule.submittedAt)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-blue-600 font-medium">
                            Evidence scheduled for {formatDate(c.evidenceSchedule.scheduledDate)}
                          </span>
                          {isScheduledDatePassed(c.evidenceSchedule.scheduledDate) && (
                            <span className="text-xs text-red-600 font-medium">(Overdue)</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Quick Response Summary */}
                  {c.responseHistory && c.responseHistory.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-green-600">✓</span>
                        <span className="text-xs text-green-600">
                          {c.responseHistory.length} response{c.responseHistory.length > 1 ? 's' : ''} received
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Latest: {c.responseHistory[c.responseHistory.length - 1]?.action || 'Update'}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 md:mt-0 flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    c.status === 'solved' || c.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                    c.status === 'escalated' ? 'bg-red-100 text-red-700' :
                    c.status === 'under investigation' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {c.status === 'solved' || c.status === 'resolved' ? 'Resolved' : 
                     c.status === 'escalated' ? 'Escalated' :
                     c.status === 'under investigation' ? 'Under Investigation' :
                     c.status || 'Pending'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(c)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs flex items-center"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </button>
                    
                    {c.status !== 'escalated' && (
                      <button
                        onClick={() => handleEscalate(c.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs flex items-center"
                      >
                        <ArrowUpCircle className="h-3 w-3 mr-1" />
                        Escalate
                      </button>
                    )}
                    
                    {c.status !== 'under investigation' && c.status !== 'escalated' && (
                      <button
                        onClick={() => handleInvestigate(c.id)}
                        className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs flex items-center"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Investigate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Case Details Modal */}
        {showCaseDetails && selectedCase && (
          <div className="fixed inset-0 z-60 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCaseDetails(false)}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl z-10 p-6 max-h-[80vh] overflow-y-auto">
              <button 
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold z-20" 
                onClick={() => setShowCaseDetails(false)}
              >
                <X className="h-6 w-6" />
              </button>
              
              <h3 className="text-xl font-bold text-[#273F4F] mb-4">Case Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800">Incident Type</h4>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-600">{selectedCase.incidentType}</p>
                    {selectedCase.priority && (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedCase.priority === 'High' ? 'bg-red-100 text-red-700' :
                        selectedCase.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedCase.priority} Priority
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800">Description</h4>
                  <p className="text-gray-600">{selectedCase.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800">Location</h4>
                  <p className="text-gray-600">{selectedCase.location}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800">Date</h4>
                  <p className="text-gray-600">{selectedCase.date}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800">Status</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedCase.status === 'solved' || selectedCase.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                    selectedCase.status === 'escalated' ? 'bg-red-100 text-red-700' :
                    selectedCase.status === 'under investigation' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {selectedCase.status === 'solved' || selectedCase.status === 'resolved' ? 'Resolved' : 
                     selectedCase.status === 'escalated' ? 'Escalated' :
                     selectedCase.status === 'under investigation' ? 'Under Investigation' :
                     selectedCase.status || 'Pending'}
                  </span>
                </div>

                {/* Evidence Information */}
                {selectedCase.evidenceSchedule && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-600" />
                      Evidence Submission
                    </h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {selectedCase.evidenceSchedule.submitted ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Evidence Submitted</span>
                          </div>
                          {selectedCase.evidenceSchedule.submittedAt && (
                            <p className="text-xs text-gray-600">
                              Submitted on: {selectedCase.evidenceSchedule.submittedAt?.toDate ? 
                                selectedCase.evidenceSchedule.submittedAt.toDate().toLocaleString() : 
                                formatDate(selectedCase.evidenceSchedule.submittedAt)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Scheduled Evidence Submission</span>
                          </div>
                          <p className="text-xs text-gray-600">
                            Scheduled for: {formatDate(selectedCase.evidenceSchedule.scheduledDate)}
                          </p>
                          {isScheduledDatePassed(selectedCase.evidenceSchedule.scheduledDate) && (
                            <div className="p-2 bg-red-50 border border-red-200 rounded">
                              <p className="text-xs text-red-700 font-medium">
                                ⚠️ Scheduled date has passed. Evidence will be automatically shared with HR/NGO.
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            If not submitted by the scheduled date, evidence will be automatically shared with HR or NGO.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* NGO/HR Responses */}
                {selectedCase.responseHistory && selectedCase.responseHistory.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mr-2">Responses</span>
                      NGO/HR Responses & Updates
                    </h4>
                    <div className="space-y-3">
                      {selectedCase.responseHistory.map((response, index) => (
                        <div key={index} className={`p-4 rounded-lg border-l-4 ${
                          response.action?.includes('NGO') ? 'bg-green-50 border-green-400' :
                          response.action?.includes('HR') ? 'bg-blue-50 border-blue-400' :
                          response.action?.includes('Escalated') ? 'bg-red-50 border-red-400' :
                          response.action?.includes('Investigation') ? 'bg-purple-50 border-purple-400' :
                          'bg-gray-50 border-gray-400'
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                response.action?.includes('NGO') ? 'bg-green-100 text-green-800' :
                                response.action?.includes('HR') ? 'bg-blue-100 text-blue-800' :
                                response.action?.includes('Escalated') ? 'bg-red-100 text-red-800' :
                                response.action?.includes('Investigation') ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {response.action?.includes('NGO') ? 'NGO Response' :
                                 response.action?.includes('HR') ? 'HR Response' :
                                 response.action?.includes('Escalated') ? 'Escalation' :
                                 response.action?.includes('Investigation') ? 'Investigation' :
                                 'Update'}
                              </span>
                              <span className="text-sm font-medium text-gray-700">{response.action}</span>
                            </div>
                            <span className="text-xs text-gray-500">{response.date}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">{response.response}</p>
                          {(response.responder || response.escalatedBy || response.requestedBy) && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                              <span className="font-medium">By:</span>
                              <span className="ml-1">{response.responder || response.escalatedBy || response.requestedBy}</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!selectedCase.responseHistory || selectedCase.responseHistory.length === 0) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div className="text-yellow-800 font-medium mb-1">No Responses Yet</div>
                    <div className="text-yellow-600 text-sm">Your case is being reviewed by our team. You'll receive updates here once there are responses from NGOs or HR.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackCasesModal;
