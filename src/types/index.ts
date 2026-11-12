export type TaskType = 'report' | 'plan' | 'review' | 'statistics' | 'feedback';

export type TaskStatus = 'pending' | 'in_progress' | 'waiting_data' | 'completed';

export type TaskPriority = 'urgent' | 'high' | 'normal';

export interface ChecklistItem {
  id: string;
  label: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface MissingIndicator {
  id: string;
  key: string;
  name: string;
  unit: string;
  targetSection: string;
  currentValue?: string | number;
  suggestedSource: string;
  period: string;
  isFilled: boolean;
}

export interface ReportSection {
  id: string;
  number: string;
  title: string;
  content: string;
  isDraft: boolean;
  hasMissingData: boolean;
  sourceReferences: string[];
}

export interface Task {
  id: string;
  code: string;
  title: string;
  description: string;
  type: TaskType;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number; // 0 to 100
  requiredOutput: string;
  requiredData: string[];
  originalDoc: {
    id: string;
    code: string;
    title: string;
    issuedBy: string;
    date: string;
    excerpt: string;
    fullContent?: string;
    fileName?: string;
    fileUrl?: string;
    fileType?: string;
    blobPathname?: string;
  };
  checklist: ChecklistItem[];
  missingIndicators: MissingIndicator[];
  sections: ReportSection[];
  recommendedAction: string;
  completedAt?: string;
  isConfirmed?: boolean;
}

export interface ExecutiveBriefing {
  directiveContext: string;
  coreDemands: string[];
  responsibleDepartments?: string[];
  estimatedWorkload?: string;
}

export interface OfficialDocument {
  id: string;
  code: string;
  title: string;
  issuedBy: string;
  issueDate: string;
  signer: string;
  summary: string;
  briefing?: ExecutiveBriefing;
  excerpt: string;
  fullContent?: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  blobPathname?: string;
  tasks: Partial<Task>[];
  requiredFiles: string[];
  actionPlan: { step: number; title: string; desc: string; role?: string }[];
}

export interface Indicator {
  id: string;
  name: string;
  value: string;
  unit: string;
  period: string;
  area: string;
  source: string;
  status: 'verified' | 'unverified' | 'missing';
  lastUpdated: string;
  category: string;
  warning?: string;
}

export interface CompletedReport {
  id: string;
  code: string;
  title: string;
  taskType: TaskType;
  completionDate: string;
  period: string;
  dataSources: string[];
  department: string;
  signatory: string;
  sections: ReportSection[];
  indicators: { name: string; value: string; unit: string }[];
}

export interface OrganizationInfo {
  communeName: string;   // Ví dụ: "Xã Dị Sử" hoặc "Xã Tân Triều"
  districtName: string;  // Ví dụ: "Huyện Mỹ Hào" hoặc "Huyện Thanh Trì"
  provinceName: string;  // Ví dụ: "Tỉnh Hưng Yên" hoặc "TP. Hà Nội"
  chairmanName: string;  // Ví dụ: "Đào Văn Hùng" hoặc "Nguyễn Văn Hảo"
  position: string;      // "CHỦ TỊCH"
}

export interface UserProfile {
  id: number;
  username: string;
  full_name: string;
  role: string;
  department: string;
  commune_name: string;
}

