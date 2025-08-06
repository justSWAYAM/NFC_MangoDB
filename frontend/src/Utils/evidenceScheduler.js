import { db } from "../../firebase";
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";

/**
 * Check for overdue scheduled evidence submissions and automatically share them
 * This function should be called periodically (e.g., daily) or when the app starts
 */
export const checkOverdueEvidence = async () => {
  try {
    const now = new Date();
    const complaintsRef = collection(db, "complaints");
    
    // Query for complaints with scheduled evidence that hasn't been submitted and is overdue
    const overdueQuery = query(
      complaintsRef,
      where("evidenceSchedule.submitted", "==", false),
      where("evidenceSchedule.scheduledDate", "<=", now.toISOString().split('T')[0])
    );
    
    const overdueSnapshot = await getDocs(overdueQuery);
    
    if (overdueSnapshot.empty) {
      console.log("No overdue evidence submissions found");
      return;
    }
    
    console.log(`Found ${overdueSnapshot.size} overdue evidence submissions`);
    
    // Process each overdue submission
    const updatePromises = overdueSnapshot.docs.map(async (docSnapshot) => {
      const complaint = docSnapshot.data();
      const complaintId = docSnapshot.id;
      
      try {
        // Update the complaint to mark evidence as automatically shared
        await updateDoc(doc(db, "complaints", complaintId), {
          "evidenceSchedule.submitted": true,
          "evidenceSchedule.submittedAt": serverTimestamp(),
          "evidenceSchedule.autoShared": true,
          "evidenceSchedule.autoSharedAt": serverTimestamp(),
          lastUpdate: `Evidence automatically shared with ${complaint.ngo ? 'NGO' : 'HR'} on ${now.toLocaleDateString()}`,
          status: complaint.status === "pending" ? "under investigation" : complaint.status
        });
        
        // Add a response history entry indicating automatic sharing
        const responseEntry = {
          action: `Evidence automatically shared with ${complaint.ngo ? 'NGO' : 'HR'}`,
          response: `Evidence was automatically shared with ${complaint.ngo ? 'NGO' : 'HR'} as the scheduled submission date (${complaint.evidenceSchedule.scheduledDate}) has passed.`,
          date: now.toLocaleDateString(),
          autoShared: true
        };
        
        // Update response history
        const currentHistory = complaint.responseHistory || [];
        await updateDoc(doc(db, "complaints", complaintId), {
          responseHistory: [...currentHistory, responseEntry]
        });
        
        console.log(`Automatically shared evidence for complaint ${complaintId}`);
        
      } catch (error) {
        console.error(`Error processing overdue evidence for complaint ${complaintId}:`, error);
      }
    });
    
    await Promise.all(updatePromises);
    console.log("Completed processing overdue evidence submissions");
    
  } catch (error) {
    console.error("Error checking overdue evidence:", error);
  }
};

/**
 * Get evidence schedule status for a specific complaint
 */
export const getEvidenceScheduleStatus = (complaint) => {
  if (!complaint.evidenceSchedule) {
    return { hasSchedule: false };
  }
  
  const { scheduledDate, submitted, submittedAt } = complaint.evidenceSchedule;
  const now = new Date();
  const scheduled = new Date(scheduledDate);
  
  return {
    hasSchedule: true,
    scheduledDate: scheduledDate,
    submitted: submitted,
    submittedAt: submittedAt,
    isOverdue: !submitted && scheduled < now,
    daysUntilDue: submitted ? 0 : Math.ceil((scheduled - now) / (1000 * 60 * 60 * 24))
  };
};

/**
 * Format evidence schedule information for display
 */
export const formatEvidenceSchedule = (complaint) => {
  const status = getEvidenceScheduleStatus(complaint);
  
  if (!status.hasSchedule) {
    return null;
  }
  
  if (status.submitted) {
    return {
      type: 'submitted',
      message: 'Evidence submitted',
      date: status.submittedAt?.toDate ? 
        status.submittedAt.toDate().toLocaleDateString() : 
        new Date(status.submittedAt).toLocaleDateString(),
      color: 'green'
    };
  }
  
  if (status.isOverdue) {
    return {
      type: 'overdue',
      message: 'Evidence overdue - will be automatically shared',
      date: status.scheduledDate,
      color: 'red'
    };
  }
  
  return {
    type: 'scheduled',
    message: `Evidence scheduled for submission`,
    date: status.scheduledDate,
    daysLeft: status.daysUntilDue,
    color: 'blue'
  };
};

/**
 * Initialize the evidence scheduler
 * Call this when the app starts to check for overdue evidence
 */
export const initializeEvidenceScheduler = () => {
  // Check for overdue evidence when the app starts
  checkOverdueEvidence();
  
  // Set up periodic checking (every 6 hours)
  setInterval(checkOverdueEvidence, 6 * 60 * 60 * 1000);
  
  console.log("Evidence scheduler initialized");
}; 