export type RestorationType = 'Crown' | 'Bridge' | 'Veneer' | 'Inlay' | 'Implant Abutment' | 'Nightguard';
export type CaseType = 'Digital Scan' | 'Physical Impression';
export type CasePriority = 'Urgent' | 'High' | 'Standard' | 'Low';

export type ManufacturingStage =
  | 'Prescription received'
  | 'Design'
  | 'CAD'
  | 'CAM'
  | 'Milling'
  | 'Printing'
  | 'Sintering'
  | 'Staining'
  | 'Glazing'
  | 'Try-in'
  | 'Delivery'
  | 'Completion';

export interface FileAttachment {
  id: string;
  name: string;
  type: 'STL' | 'PLY' | 'OBJ' | 'DICOM' | 'CBCT' | 'Intraoral Scan' | 'Clinical Photo' | 'PDF' | 'ZIP';
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  version: number;
  versionHistory: { version: number; date: string; note: string; author: string }[];
  category: 'Raw Impression' | 'CAD Design' | 'Milling Toolpath' | 'Radiology' | 'Clinical Photography' | 'Documentation';
  tags: string[];
}

export interface ShadeDetails {
  vitaShade: string; // VITA Classical or VITA Toothguide 3D-Master
  customShade?: string; // Custom mixed recipes
  photos: string[]; // Mock links or description
  shadeNotes: string;
  shadeHistory: { date: string; shade: string; updatedBy: string; note: string }[];
}

export interface LabMessage {
  id: string;
  sender: 'Clinician' | 'Technician' | 'System';
  senderName: string;
  text: string;
  timestamp: string;
  type: 'Message' | 'Comment' | 'Revision Request' | 'Approval Request' | 'Status Update';
  attachment?: string;
  isApproved?: boolean;
}

export interface SmileAnalysis {
  interpupillaryLine: 'Parallel' | 'Canted';
  smileLine: 'High' | 'Average' | 'Low';
  dentalMidline: 'Aligned' | 'Deviated Left' | 'Deviated Right';
  goldenProportionCheck: 'Passed' | 'Needs Adjustment';
  facialPhotos: { angle: string; url: string; status: 'Verified' | 'Pending' }[];
  waxUpPlanning: { step: string; status: 'Not Started' | 'In Progress' | 'Completed'; notes: string };
  mockUpTracking: { date: string; feedback: string; status: 'Approved' | 'Requires Mod' | 'Pending Try-in' };
  caseNotes: string;
}

export interface LabCase {
  id: string;
  patientName: string;
  doctorName: string;
  laboratoryName: string;
  caseType: CaseType;
  restorationType: RestorationType;
  priority: CasePriority;
  status: ManufacturingStage;
  dueDate: string;
  createdDate: string;
  progressPercent: number;
  isDelayed: boolean;
  assignedTechnician: string;
  timeline: { stage: ManufacturingStage; timestamp: string; note: string; completed: boolean }[];
  internalNotes: string;
  files: FileAttachment[];
  shade: ShadeDetails;
  communication: LabMessage[];
  smileDesign?: SmileAnalysis;
}

export interface TechnicianUtilization {
  name: string;
  activeCases: number;
  completedToday: number;
  utilizationRate: number; // percentage
  rating: number;
}
