import { create } from 'zustand';
import { Task, OfficialDocument, Indicator, CompletedReport, TaskType, TaskStatus, OrganizationInfo } from '../types';
import { INITIAL_TASKS, SAMPLE_DOCUMENTS, INITIAL_INDICATORS, INITIAL_COMPLETED_REPORTS } from '../data/mockData';
import { aiService, cleanVietnameseAdministrativeText } from '../services/aiService';

interface AppState {
  currentTab: 'tasks' | 'workspace';
  tasks: Task[];
  selectedTaskId: string;
  documents: OfficialDocument[];
  selectedDocId: string | null;
  indicators: Indicator[];
  completedReports: CompletedReport[];
  isAnalyzing: boolean;
  analyzedDoc: OfficialDocument | null;
  searchQuery: string;
  notification: string | null;
  taskFilterType: string;
  taskFilterStatus: string;

  // Đơn vị hành chính cấp xã (Tùy biến theo địa phương của cán bộ)
  locality: OrganizationInfo;
  updateLocality: (info: Partial<OrganizationInfo>) => void;

  // Actions
  setTab: (tab: 'tasks' | 'workspace') => void;
  setSelectedTask: (taskId: string) => void;
  setSelectedDoc: (docId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setTaskFilterType: (type: string) => void;
  setTaskFilterStatus: (status: string) => void;
  showNotification: (msg: string) => void;
  clearNotification: () => void;

  // Document Interpreter
  runAnalyzeDocument: (docIdOrText: string, fileName?: string) => Promise<OfficialDocument>;
  confirmTaskFromDoc: (task: Partial<Task>, originalDoc: OfficialDocument) => Task;

  // Workspace Actions
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTaskDeadline: (taskId: string, deadline: string) => void;
  updateChecklistStatus: (taskId: string, checklistId: string, status: 'completed' | 'in_progress' | 'pending') => void;
  addChecklistItem: (taskId: string, label: string) => void;
  removeChecklistItem: (taskId: string, checklistId: string) => void;
  updateSectionContent: (taskId: string, sectionId: string, content: string) => void;
  fillIndicatorData: (taskId: string, indicatorKey: string, value: string, sourceName?: string) => void;
  completeTaskAndArchive: (taskId: string) => void;

  // Knowledge & Reuse Actions
  addIndicator: (indicator: Omit<Indicator, 'id' | 'lastUpdated'>) => void;
  updateIndicatorStatus: (id: string, status: 'verified' | 'unverified') => void;
  cloneReportForNewMonth: (sourceReportId: string, newPeriod: string) => Task;
  deleteTask: (taskId: string) => void;
  addNewTask: (newTask: Partial<Task>) => void;
}

const TASKS_STORAGE_KEY = 'ai_workmate_tasks_v1';
const LOCALITY_STORAGE_KEY = 'ai_workmate_locality_v1';

const DEFAULT_LOCALITY: OrganizationInfo = {
  communeName: 'Xã Dị Sử',
  districtName: 'Huyện Mỹ Hào',
  provinceName: 'Tỉnh Hưng Yên',
  chairmanName: 'Đào Văn Hùng',
  position: 'CHỦ TỊCH'
};

function loadInitialTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

function loadInitialLocality(): OrganizationInfo {
  try {
    const raw = localStorage.getItem(LOCALITY_STORAGE_KEY);
    if (!raw) return DEFAULT_LOCALITY;
    return { ...DEFAULT_LOCALITY, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_LOCALITY;
  }
}

export const useStore = create<AppState>((set, get) => ({
  currentTab: 'tasks',
  tasks: loadInitialTasks(),
  selectedTaskId: 'task-1',
  documents: SAMPLE_DOCUMENTS,
  selectedDocId: 'doc-142',
  indicators: INITIAL_INDICATORS,
  completedReports: INITIAL_COMPLETED_REPORTS,
  isAnalyzing: false,
  analyzedDoc: null,
  searchQuery: '',
  notification: null,
  taskFilterType: 'all',
  taskFilterStatus: 'all',

  locality: loadInitialLocality(),

  updateLocality: (info) => set((state) => ({ locality: { ...state.locality, ...info } })),

  setTab: (tab) => set({ currentTab: tab }),

  setSelectedTask: (taskId) => set({ selectedTaskId: taskId }),

  setSelectedDoc: (docId) => set({ selectedDocId: docId }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setTaskFilterType: (type) => set({ taskFilterType: type }),

  setTaskFilterStatus: (status) => set({ taskFilterStatus: status }),

  showNotification: (msg) => {
    set({ notification: msg });
    setTimeout(() => {
      set({ notification: null });
    }, 4000);
  },

  clearNotification: () => set({ notification: null }),

  runAnalyzeDocument: async (docIdOrText: string, fileName?: string) => {
    set({ isAnalyzing: true });
    try {
      const result = await aiService.analyzeDocument(docIdOrText, fileName);
      set({ analyzedDoc: result, isAnalyzing: false });
      return result;
    } catch {
      set({ isAnalyzing: false });
      throw new Error('Không thể phân tích văn bản');
    }
  },

  confirmTaskFromDoc: (taskData: Partial<Task>, originalDoc: OfficialDocument) => {
    const existing = get().tasks.find(t => t.id === taskData.id);
    if (existing) {
      set({ selectedTaskId: existing.id, currentTab: 'workspace' });
      return existing;
    }

    const cleanExcerpt = cleanVietnameseAdministrativeText(originalDoc.excerpt || originalDoc.summary || '');
    const docFullStr = (originalDoc.title + ' ' + originalDoc.code + ' ' + (originalDoc.fullContent || '') + ' ' + originalDoc.issuedBy).toLowerCase();
    const isPccc = docFullStr.includes('cháy') ||
                   docFullStr.includes('pccc') ||
                   docFullStr.includes('72/cđ') ||
                   docFullStr.includes('kim liên');

    // Tự động nhận diện và gợi ý địa phương phù hợp với văn bản chỉ đạo
    if (docFullStr.includes('hưng yên')) {
      set({
        locality: {
          communeName: 'Xã Dị Sử',
          districtName: 'Huyện Mỹ Hào',
          provinceName: 'Tỉnh Hưng Yên',
          chairmanName: 'Đào Văn Hùng',
          position: 'CHỦ TỊCH'
        }
      });
    } else if (docFullStr.includes('tân triều') || docFullStr.includes('thanh trì')) {
      set({
        locality: {
          communeName: 'Xã Tân Triều',
          districtName: 'Huyện Thanh Trì',
          provinceName: 'TP. Hà Nội',
          chairmanName: 'Nguyễn Văn Hảo',
          position: 'CHỦ TỊCH'
        }
      });
    }

    let finalTitle = (taskData.title || '').trim();
    if (!finalTitle || finalTitle.includes('CỘNG HÒA') || finalTitle.length > 90) {
      finalTitle = isPccc
        ? 'Rà soát, kiểm tra an toàn PCCC tại các cơ sở giáo dục trên địa bàn'
        : (originalDoc.title.length < 90 && !originalDoc.title.includes('CỘNG HÒA')
            ? originalDoc.title
            : `Triển khai thực hiện nhiệm vụ theo văn bản ${originalDoc.code}`);
    }

    const derivedChecklist =
      originalDoc.actionPlan && originalDoc.actionPlan.length > 0
        ? originalDoc.actionPlan.map((action, idx) => ({
            id: `c-${Date.now()}-${idx + 1}`,
            label: action.title,
            status: 'pending' as const
          }))
        : [
            { id: `c-${Date.now()}-1`, label: `Nghiên cứu yêu cầu văn bản ${originalDoc.code}`, status: 'pending' as const },
            { id: `c-${Date.now()}-2`, label: 'Thu thập thông tin, số liệu từ các cơ sở liên quan', status: 'pending' as const },
            { id: `c-${Date.now()}-3`, label: 'Tổng hợp kết quả & trình Lãnh đạo UBND xã', status: 'pending' as const }
          ];

    const newTask: Task = {
      id: taskData.id || `task-${Date.now()}`,
      code: taskData.code || `CV-${originalDoc.code}`,
      title: finalTitle,
      description: taskData.description || 'Thực hiện theo chỉ đạo của cơ quan cấp trên.',
      type: (taskData.type as TaskType) || 'report',
      deadline: taskData.deadline || '30/10/2026',
      priority: taskData.priority || 'high',
      status: 'in_progress',
      progress: 0,
      requiredOutput: taskData.requiredOutput || 'Kết quả thực hiện công việc',
      requiredData: originalDoc.requiredFiles || [],
      originalDoc: {
        id: originalDoc.id,
        code: originalDoc.code,
        title: originalDoc.title,
        issuedBy: originalDoc.issuedBy,
        date: originalDoc.issueDate,
        excerpt: cleanExcerpt,
        fullContent: originalDoc.fullContent || cleanExcerpt,
        fileName: originalDoc.fileName,
        fileUrl: originalDoc.fileUrl,
        fileType: originalDoc.fileType,
        blobPathname: originalDoc.blobPathname
      },
      checklist: derivedChecklist,
      missingIndicators: [],
      sections: [],
      recommendedAction: 'Thực hiện các đầu việc trong danh sách và cập nhật hạn hoàn thành.'
    };

    set(state => ({
      tasks: [newTask, ...state.tasks],
      selectedTaskId: newTask.id,
      currentTab: 'workspace'
    }));

    get().showNotification(`Đã khởi tạo công việc "${newTask.title}"!`);
    return newTask;
  },

  updateTaskStatus: (taskId, status) => {
    set(state => ({
      tasks: state.tasks.map(t => {
        if (t.id !== taskId) return t;
        const progress = status === 'completed' ? 100 : t.progress;
        return { ...t, status, progress };
      })
    }));
    get().showNotification(`Đã chuyển trạng thái công việc sang "${
      status === 'completed' ? 'Đã hoàn thành & Lưu kho' :
      status === 'in_progress' ? 'Đang triển khai' :
      status === 'waiting_data' ? 'Chờ số liệu các bên' : 'Chờ xử lý'
    }"`);
  },

  updateTaskDeadline: (taskId, deadline) => {
    set(state => ({
      tasks: state.tasks.map(t => (t.id === taskId ? { ...t, deadline } : t))
    }));
    get().showNotification(`Đã cập nhật hạn thực hiện: ${deadline}`);
  },

  updateChecklistStatus: (taskId, checklistId, status) => {
    set(state => ({
      tasks: state.tasks.map(t => {
        if (t.id !== taskId) return t;
        const newChecklist = t.checklist.map(c => c.id === checklistId ? { ...c, status } : c);
        const completedCount = newChecklist.filter(c => c.status === 'completed').length;
        const progress = newChecklist.length > 0 ? Math.round((completedCount / newChecklist.length) * 100) : 0;
        const nextStatus = progress === 100 ? ('completed' as const) : ('in_progress' as const);
        return { ...t, checklist: newChecklist, progress, status: nextStatus };
      })
    }));
  },

  addChecklistItem: (taskId, label) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    set(state => ({
      tasks: state.tasks.map(t => {
        if (t.id !== taskId) return t;
        const newChecklist = [...t.checklist, { id: `c-${Date.now()}`, label: trimmed, status: 'pending' as const }];
        const completedCount = newChecklist.filter(c => c.status === 'completed').length;
        const progress = Math.round((completedCount / newChecklist.length) * 100);
        return { ...t, checklist: newChecklist, progress, status: progress === 100 ? 'completed' : 'in_progress' };
      })
    }));
  },

  removeChecklistItem: (taskId, checklistId) => {
    set(state => ({
      tasks: state.tasks.map(t => {
        if (t.id !== taskId) return t;
        const newChecklist = t.checklist.filter(c => c.id !== checklistId);
        const completedCount = newChecklist.filter(c => c.status === 'completed').length;
        const progress = newChecklist.length > 0 ? Math.round((completedCount / newChecklist.length) * 100) : 0;
        return { ...t, checklist: newChecklist, progress };
      })
    }));
  },

  updateSectionContent: (taskId, sectionId, content) => {
    set(state => ({
      tasks: state.tasks.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          sections: t.sections.map(s => s.id === sectionId ? { ...s, content } : s)
        };
      })
    }));
  },

  fillIndicatorData: (taskId, indicatorKey, value, sourceName = 'Cán bộ cung cấp') => {
    set(state => {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;

      // Cập nhật indicator trong task
      const updatedMissing = task.missingIndicators.map(m => {
        if (m.key === indicatorKey) {
          return { ...m, currentValue: value, isFilled: true };
        }
        return m;
      });

      // Cập nhật trực tiếp nội dung các mục trong báo cáo
      const updatedSections = task.sections.map(sec => {
        let newContent = sec.content;
        if (indicatorKey === 'tthc_dung_han') {
          newContent = newContent.replace(
            /\[CHƯA CÓ DỮ LIỆU TỶ LỆ ĐÚNG HẠN[^\]]*\]|đúng hạn:\s*\[CHƯA CÓ DỮ LIỆU[^\]]*\]/gi,
            `đúng hạn đạt ${value}% (vượt 0.5% so với tháng trước)`
          );
        }
        if (indicatorKey === 'thu_ngan_sach') {
          newContent = newContent.replace(
            /\[CHƯA CÓ DỮ LIỆU THU NGÂN SÁCH[^\]]*\]|thu ngân sách:\s*\[CHƯA CÓ DỮ LIỆU[^\]]*\]/gi,
            `đạt ${value} triệu đồng, lũy kế 10 tháng đạt 91.5% dự toán HĐND xã giao`
          );
        }
        if (indicatorKey === 'so_truong_kiem_tra') {
          newContent = newContent.replace(
            /\[CHƯA CÓ DỮ LIỆU SỐ TRƯỜNG ĐÃ KIỂM TRA[^\]]*\]/gi,
            `${value}/${value} cơ sở giáo dục (đạt 100% kế hoạch)`
          );
        }
        if (indicatorKey === 'so_ton_tai_pccc') {
          newContent = newContent.replace(
            /\[CHƯA CÓ DỮ LIỆU TỒN TẠI PCCC[^\]]*\]/gi,
            `${value} trường còn thiếu sót về hệ thống dây điện và phương tiện chữa cháy tại chỗ`
          );
        }
        const hasMissing = newContent.includes('[CHƯA CÓ DỮ LIỆU');
        return { ...sec, content: newContent, hasMissingData: hasMissing };
      });

      // Cập nhật checklist và progress
      const allFilled = updatedMissing.every(m => m.isFilled);
      const updatedChecklist = task.checklist.map(c => {
        if (c.id === 'c2') return { ...c, status: 'completed' as const };
        if (c.id === 'c3') return { ...c, status: allFilled ? ('completed' as const) : ('in_progress' as const) };
        if (c.id === 'c4' && allFilled) return { ...c, status: 'in_progress' as const };
        return c;
      });

      const completedCount = updatedChecklist.filter(c => c.status === 'completed').length;
      const progress = allFilled ? 95 : Math.round((completedCount / updatedChecklist.length) * 100);

      // Đồng thời lưu vào kho chỉ tiêu tri thức (Indicators)
      const existingInd = state.indicators.find(i => i.name.toLowerCase().includes(indicatorKey === 'tthc_dung_han' ? 'đúng hạn' : 'thu ngân sách'));
      let updatedIndicators = [...state.indicators];
      if (existingInd) {
        updatedIndicators = updatedIndicators.map(i => i.id === existingInd.id ? {
          ...i,
          value,
          period: 'Tháng 10/2026',
          status: 'verified' as const,
          source: sourceName,
          lastUpdated: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          warning: undefined
        } : i);
      } else {
        updatedIndicators.push({
          id: `ind-${Date.now()}`,
          name: indicatorKey === 'tthc_dung_han' ? 'Tỷ lệ giải quyết TTHC đúng hạn' : 'Tổng thu ngân sách nhà nước',
          value,
          unit: indicatorKey === 'tthc_dung_han' ? '%' : 'Triệu đồng',
          period: 'Tháng 10/2026',
          area: 'Xã Tân Triều',
          source: sourceName,
          status: 'verified',
          lastUpdated: new Date().toLocaleDateString('vi-VN'),
          category: indicatorKey === 'tthc_dung_han' ? 'Cải cách hành chính' : 'Tài chính - Ngân sách'
        });
      }

      return {
        indicators: updatedIndicators,
        tasks: state.tasks.map(t => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            missingIndicators: updatedMissing,
            sections: updatedSections,
            checklist: updatedChecklist,
            progress,
            recommendedAction: allFilled
              ? 'Tuyệt vời! Toàn bộ 10/10 chỉ tiêu đã hoàn tất. Hãy nhấn "Kiểm tra báo cáo" để hoàn thiện.'
              : `Đã cập nhật chỉ tiêu thành công. Còn ${updatedMissing.filter(m => !m.isFilled).length} chỉ tiêu nữa.`
          };
        })
      };
    });

    get().showNotification(`Đã cập nhật dữ liệu và đồng bộ vào báo cáo!`);
  },

  completeTaskAndArchive: (taskId: string) => {
    set(state => {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return state;

      const completedReport: CompletedReport = {
        id: `rep-${Date.now()}`,
        code: `145/BC-UBND`,
        title: task.title,
        taskType: task.type,
        completionDate: new Date().toLocaleDateString('vi-VN'),
        period: 'Tháng 10/2026',
        department: 'UBND Xã Tân Triều',
        signatory: 'Chủ tịch UBND xã Nguyễn Văn Hảo',
        dataSources: ['Bộ phận Tài chính - Kế toán', 'Bộ phận Một cửa', 'Cán bộ Nông nghiệp'],
        indicators: task.missingIndicators.map(m => ({
          name: m.name,
          value: String(m.currentValue || 'Chưa cập nhật'),
          unit: m.unit
        })),
        sections: task.sections
      };

      const updatedChecklist = task.checklist.map(c => ({ ...c, status: 'completed' as const }));

      return {
        completedReports: [completedReport, ...state.completedReports],
        tasks: state.tasks.map(t => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            status: 'completed' as const,
            progress: 100,
            checklist: updatedChecklist,
            completedAt: new Date().toLocaleDateString('vi-VN'),
            recommendedAction: 'Báo cáo đã hoàn tất và lưu vào Kho báo cáo để tái sử dụng cho tháng tiếp theo.'
          };
        })
      };
    });

    get().showNotification('Chúc mừng! Báo cáo đã hoàn thành và lưu vào Kho tri thức.');
  },

  addIndicator: (indicator) => {
    const newInd: Indicator = {
      ...indicator,
      id: `ind-${Date.now()}`,
      lastUpdated: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    set(state => ({ indicators: [newInd, ...state.indicators] }));
    get().showNotification(`Đã thêm chỉ tiêu "${indicator.name}" vào kho dữ liệu!`);
  },

  updateIndicatorStatus: (id, status) => {
    set(state => ({
      indicators: state.indicators.map(i => i.id === id ? { ...i, status } : i)
    }));
    get().showNotification('Đã cập nhật trạng thái kiểm định chỉ tiêu.');
  },

  cloneReportForNewMonth: (sourceReportId: string, newPeriod: string) => {
    const report = get().completedReports.find(r => r.id === sourceReportId);
    if (!report) throw new Error('Không tìm thấy báo cáo nguồn');

    const newTask: Task = {
      id: `task-clone-${Date.now()}`,
      code: `CV-TAISUDUNG-${newPeriod.replace(/[\/\s]+/g, '')}`,
      title: `${report.title.replace(/tháng \d+\/\d+/i, newPeriod)}`,
      description: `Khởi tạo kế thừa từ "${report.title}". Hệ thống đã giữ nguyên cấu trúc chuẩn và đánh dấu các vị trí cần cập nhật số liệu mới của ${newPeriod}.`,
      type: report.taskType,
      deadline: '28/11/2026',
      priority: 'high',
      status: 'in_progress',
      progress: 60,
      requiredOutput: 'Báo cáo hoàn thiện tháng tiếp theo định dạng .docx',
      requiredData: ['Số liệu thu ngân sách tháng mới', 'Số liệu giải quyết TTHC tháng mới'],
      originalDoc: {
        id: 'doc-kethua',
        code: 'Văn bản kế thừa',
        title: `Kế thừa từ ${report.code}`,
        issuedBy: report.department,
        date: report.completionDate,
        excerpt: `Kế thừa toàn bộ khung cấu trúc báo cáo định kỳ cấp xã và danh mục chỉ tiêu từ kỳ ${report.period}.`
      },
      checklist: [
        { id: 'c1', label: `Sao chép cấu trúc báo cáo từ kỳ ${report.period}`, status: 'completed' },
        { id: 'c2', label: `Cập nhật số liệu mới cho kỳ ${newPeriod}`, status: 'in_progress' },
        { id: 'c3', label: 'Rà soát các mục chỉ đạo điều hành trọng tâm', status: 'pending' },
        { id: 'c4', label: 'Xuất file Word báo cáo chính thức', status: 'pending' }
      ],
      missingIndicators: [
        {
          id: `mi-clone-1`,
          key: 'tthc_dung_han',
          name: `Tỷ lệ hồ sơ TTHC đúng hạn (${newPeriod})`,
          unit: '%',
          targetSection: 'II. Kết quả thực hiện',
          currentValue: undefined,
          suggestedSource: 'Bộ phận Một cửa xã',
          period: newPeriod,
          isFilled: false
        },
        {
          id: `mi-clone-2`,
          key: 'thu_ngan_sach',
          name: `Tổng thu ngân sách nhà nước (${newPeriod})`,
          unit: 'Triệu đồng',
          targetSection: 'II. Kết quả thực hiện',
          currentValue: undefined,
          suggestedSource: 'Kế toán ngân sách',
          period: newPeriod,
          isFilled: false
        }
      ],
      sections: report.sections.map(s => ({
        ...s,
        content: s.content.replace(/tháng 10/gi, newPeriod).replace(/2.850|3.120|98.5|99.2/g, '[CẦN CẬP NHẬT SỐ LIỆU MỚI]')
      })),
      recommendedAction: `Đã kế thừa toàn bộ khung từ báo cáo trước. Hãy nhập số liệu mới cho kỳ ${newPeriod} để hoàn tất.`
    };

    set(state => ({
      tasks: [newTask, ...state.tasks],
      selectedTaskId: newTask.id,
      currentTab: 'workspace'
    }));

    get().showNotification(`Đã khởi tạo ${newTask.title} thành công!`);
    return newTask;
  },

  deleteTask: (taskId) => {
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== taskId)
    }));
    get().showNotification('Đã xóa công việc.');
  },

  addNewTask: (newTaskData) => {
    const task: Task = {
      id: `task-${Date.now()}`,
      code: newTaskData.code || `NV-${Date.now().toString().slice(-4)}`,
      title: newTaskData.title || 'Nhiệm vụ công việc mới',
      description: newTaskData.description || 'Thực hiện nhiệm vụ được giao theo chức năng quyền hạn.',
      type: newTaskData.type || 'report',
      deadline: newTaskData.deadline || '30/10/2026',
      priority: newTaskData.priority || 'normal',
      status: 'pending',
      progress: 0,
      requiredOutput: newTaskData.requiredOutput || 'Văn bản kết quả báo cáo',
      requiredData: newTaskData.requiredData || ['Số liệu chuyên môn'],
      originalDoc: newTaskData.originalDoc || {
        id: 'manual-doc',
        code: 'Giao việc trực tiếp',
        title: 'Nhiệm vụ do Lãnh đạo UBND giao',
        issuedBy: 'UBND Xã Tân Triều',
        date: new Date().toLocaleDateString('vi-VN'),
        excerpt: 'Chỉ đạo trực tiếp của Thường trực UBND xã.'
      },
      checklist: [
        { id: 'c1', label: 'Tiếp nhận và xác định nội dung việc', status: 'completed' },
        { id: 'c2', label: 'Thu thập số liệu hồ sơ liên quan', status: 'pending' },
        { id: 'c3', label: 'Xây dựng dự thảo văn bản', status: 'pending' },
        { id: 'c4', label: 'Hoàn thiện trình Lãnh đạo phê duyệt', status: 'pending' }
      ],
      missingIndicators: [],
      sections: [
        {
          id: 's1',
          number: 'I',
          title: 'NỘI DUNG THỰC HIỆN',
          content: 'Thực hiện ý kiến chỉ đạo của Lãnh đạo UBND xã về việc triển khai nhiệm vụ chuyên môn...',
          isDraft: true,
          hasMissingData: false,
          sourceReferences: ['Chỉ đạo của Lãnh đạo xã']
        }
      ],
      recommendedAction: 'Hãy bắt đầu rà soát hồ sơ và soạn thảo nội dung báo cáo.'
    };

    set(state => ({
      tasks: [task, ...state.tasks],
      selectedTaskId: task.id,
      currentTab: 'workspace'
    }));
    get().showNotification(`Đã tạo mới công việc: ${task.title}`);
  }
}));

// Tự động lưu tasks (loại bỏ blob: URL tạm trong RAM, giữ nguyên blobPathname để lấy Signed URL khi tải lại trang)
useStore.subscribe((state) => {
  try {
    const serializableTasks = state.tasks.map((t) => ({
      ...t,
      originalDoc: {
        ...t.originalDoc,
        fileUrl: t.originalDoc.fileUrl?.startsWith('blob:') ? undefined : t.originalDoc.fileUrl,
      },
    }));
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(serializableTasks));
    localStorage.setItem(LOCALITY_STORAGE_KEY, JSON.stringify(state.locality));
  } catch {
    // Bỏ qua nếu vượt dung lượng localStorage
  }
});
