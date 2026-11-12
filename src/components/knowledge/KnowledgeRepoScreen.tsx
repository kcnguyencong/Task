import React, { useState } from 'react';
import {
  Database,
  Search,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Calendar,
  Filter
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const KnowledgeRepoScreen: React.FC = () => {
  const { indicators, addIndicator, updateIndicatorStatus } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New indicator form
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('');
  const [period, setPeriod] = useState('Tháng 10/2026');
  const [area] = useState('Xã Tân Triều');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('Tài chính - Ngân sách');

  const categories = [
    'all',
    'Cải cách hành chính',
    'Nông nghiệp',
    'Tài chính - Ngân sách',
    'Văn hóa - Xã hội',
    'Quốc phòng - An ninh'
  ];

  const filteredIndicators = indicators.filter(ind => {
    if (selectedCategory !== 'all' && ind.category !== selectedCategory) return false;
    if (searchTerm && !ind.name.toLowerCase().includes(searchTerm.toLowerCase()) && !ind.source.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleCreateIndicator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;

    addIndicator({
      name,
      value,
      unit: unit || 'Chỉ tiêu',
      period,
      area,
      source: source || 'Công chức phụ trách cung cấp',
      category,
      status: 'verified'
    });

    setName('');
    setValue('');
    setUnit('');
    setSource('');
    setShowAddModal(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/80 mb-2">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>Phân hệ: Kho dữ liệu & tri thức số cấp xã</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Kho chỉ tiêu thống kê & Tái sử dụng dữ liệu
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Lưu trữ các chỉ tiêu đã được kiểm chứng từ các phòng ban chuyên môn, hỗ trợ tự động điền vào báo cáo kỳ tiếp theo. Hệ thống tự động cảnh báo dữ liệu cũ hoặc không đồng nhất kỳ báo cáo.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start md:self-auto active:scale-95 border border-blue-400/30"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm chỉ tiêu mới</span>
        </button>
      </div>

      {/* Safety & Consistency Policy Alert */}
      <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-2xs">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div className="text-xs text-slate-700 leading-relaxed font-medium">
          <strong className="text-slate-900 font-bold block mb-0.5 text-sm">Quy tắc an toàn dữ liệu công vụ cấp xã</strong>
          Trợ lý AI chỉ tự động điền các chỉ tiêu có trạng thái <strong className="text-emerald-700">"Đã xác nhận"</strong> và cùng <strong className="text-blue-700">Kỳ báo cáo</strong>. Khi dữ liệu thuộc kỳ cũ (ví dụ: Tháng 09/2026 trong báo cáo Tháng 10), hệ thống sẽ bật cảnh báo đỏ và yêu cầu cán bộ xác nhận cập nhật trước khi đưa vào văn bản.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        {/* Category pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Lĩnh vực:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#132A46] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'Tất cả lĩnh vực' : cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên chỉ tiêu, nguồn cung cấp..."
            className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
          />
        </div>
      </div>

      {/* Indicators Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-4 px-5">Tên chỉ tiêu thống kê</th>
                <th className="py-4 px-5">Giá trị & Đơn vị</th>
                <th className="py-4 px-5">Kỳ báo cáo</th>
                <th className="py-4 px-5">Đơn vị & Nguồn dữ liệu</th>
                <th className="py-4 px-5">Trạng thái xác thực</th>
                <th className="py-4 px-5">Cập nhật cuối</th>
                <th className="py-4 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredIndicators.map((ind) => (
                <tr key={ind.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5 max-w-xs">
                    <div className="font-bold text-slate-900 leading-snug">{ind.name}</div>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block border border-blue-200/70">
                      {ind.category}
                    </span>
                    {ind.warning && (
                      <div className="mt-1.5 text-[11px] text-red-700 flex items-start gap-1.5 bg-red-50 p-2 rounded-lg border border-red-200 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{ind.warning}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-5">
                    <span className="font-extrabold text-slate-900 text-sm">{ind.value}</span>{' '}
                    <span className="text-slate-500 font-bold">{ind.unit}</span>
                  </td>

                  <td className="py-4 px-5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {ind.period}
                    </span>
                  </td>

                  <td className="py-4 px-5 max-w-xs">
                    <div className="text-slate-800 font-bold truncate">{ind.source}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{ind.area}</div>
                  </td>

                  <td className="py-4 px-5 whitespace-nowrap">
                    {ind.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Đã xác nhận
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Kỳ cũ / Chờ duyệt
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5 whitespace-nowrap text-slate-500 text-[11px] font-medium">
                    {ind.lastUpdated}
                  </td>

                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    {ind.status === 'verified' ? (
                      <button
                        onClick={() => updateIndicatorStatus(ind.id, 'unverified')}
                        className="text-[11px] font-bold text-slate-500 hover:text-amber-700 px-2.5 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Bỏ xác nhận
                      </button>
                    ) : (
                      <button
                        onClick={() => updateIndicatorStatus(ind.id, 'verified')}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-800 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                      >
                        Xác nhận chỉ tiêu
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Indicator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Thêm chỉ tiêu thống kê mới vào kho</h3>
            <form onSubmit={handleCreateIndicator} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên chỉ tiêu thống kê</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Tổng số hộ nghèo theo chuẩn nghèo đa chiều"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giá trị số liệu</label>
                  <input
                    type="text"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="VD: 42"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="VD: Hộ (1.2%)"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kỳ báo cáo</label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lĩnh vực chuyên môn</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Tài chính - Ngân sách">Tài chính - Ngân sách</option>
                    <option value="Cải cách hành chính">Cải cách hành chính</option>
                    <option value="Nông nghiệp">Nông nghiệp</option>
                    <option value="Văn hóa - Xã hội">Văn hóa - Xã hội</option>
                    <option value="Quốc phòng - An ninh">Quốc phòng - An ninh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nguồn cung cấp / Đơn vị xác thực</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="VD: Công chức Lao động - Thương binh & Xã hội"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm"
                >
                  Lưu vào kho tri thức
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
