'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  GitCompareArrows,
  Search,
  X,
  School,
  MapPin,
  Star,
  TrendingUp,
  Users,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface University {
  id: number;
  name: string;
  province: string;
  city: string;
  type: string;
  level: string;
  is_self_marking: string;
  ranking: number | null;
}

interface Admission {
  id: number;
  university_id: number;
  major_id: number;
  year: number;
  score_line_total: number | null;
  enrolled_count: number | null;
  applied_count: number | null;
  majors: { name: string; category: string; degree_type: string };
}

const COLORS = ['#f59e0b', '#3b82f6', '#10b981'];
const TYPE_COLORS: Record<string, string> = {
  '985': 'bg-red-50 text-red-600 border-red-200',
  '211': 'bg-blue-50 text-blue-600 border-blue-200',
  '双一流': 'bg-amber-50 text-amber-600 border-amber-200',
  '普通': 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function ComparePage() {
  const [searchResults, setSearchResults] = useState<University[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedUnis, setSelectedUnis] = useState<University[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [compared, setCompared] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchUniversities = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/universities?keyword=${encodeURIComponent(keyword)}&pageSize=10`);
      const data = await res.json();
      setSearchResults((data.data || []).filter((u: University) => !selectedIds.includes(u.id)));
    } catch {
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => searchUniversities(searchKeyword), 300);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const addUniversity = (uni: University) => {
    if (selectedIds.length >= 3) return;
    setSelectedIds([...selectedIds, uni.id]);
    setSelectedUnis([...selectedUnis, uni]);
    setSearchKeyword('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const removeUniversity = (id: number) => {
    setSelectedIds(selectedIds.filter((i) => i !== id));
    setSelectedUnis(selectedUnis.filter((u) => u.id !== id));
    setCompared(false);
    setAdmissions([]);
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ universityIds: selectedIds }),
      });
      const data = await res.json();
      setAdmissions(data.admissions || []);
      setCompared(true);
    } catch (err) {
      console.error('Compare failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const chartDataMap = new Map<number, Record<string, number | null>>();
  admissions.forEach((a) => {
    if (!chartDataMap.has(a.year)) chartDataMap.set(a.year, { year: a.year } as Record<string, number | null>);
    const entry = chartDataMap.get(a.year)!;
    const uni = selectedUnis.find((u) => u.id === a.university_id);
    if (uni) {
      entry[`${uni.name}_score`] = a.score_line_total;
      entry[`${uni.name}_enrolled`] = a.enrolled_count;
    }
  });

  const years = [...chartDataMap.keys()].sort();
  const chartData = years.map((y) => ({ year: y, ...chartDataMap.get(y)! }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">首页</span>
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="text-lg font-semibold text-slate-800">院校对比</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Select Universities */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <GitCompareArrows className="w-5 h-5 text-amber-500" />
            选择对比院校（2-3所）
          </h2>

          {/* Selected Universities */}
          <div className="flex flex-wrap gap-3 mb-4">
            {selectedUnis.map((uni) => (
              <div
                key={uni.id}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg"
              >
                <School className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-800">{uni.name}</span>
                <button
                  onClick={() => removeUniversity(uni.id)}
                  className="w-5 h-5 rounded-full bg-slate-300 text-white flex items-center justify-center hover:bg-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {selectedIds.length < 3 && (
              <div className="relative">
                <div className="flex items-center px-3 py-2 border border-dashed border-slate-300 rounded-lg">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="搜索添加院校..."
                    className="text-sm bg-transparent outline-none w-40"
                  />
                </div>
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg border border-slate-200 shadow-lg z-10 max-h-60 overflow-y-auto">
                    {searchResults.map((uni) => (
                      <button
                        key={uni.id}
                        onClick={() => addUniversity(uni)}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 last:border-0"
                      >
                        <School className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="text-sm font-medium text-slate-800">{uni.name}</div>
                          <div className="text-xs text-slate-400">{uni.province} · {uni.type}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleCompare}
            disabled={selectedIds.length < 2 || loading}
            className="px-6 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '对比中...' : '开始对比'}
          </button>
        </div>

        {/* Comparison Results */}
        {compared && (
          <>
            {/* Basic Info Comparison */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-base font-semibold text-slate-800">基本信息对比</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left py-3 px-6 text-slate-500 font-medium w-32">对比项</th>
                      {selectedUnis.map((uni, i) => (
                        <th key={uni.id} className="text-center py-3 px-6 font-medium" style={{ color: COLORS[i] }}>
                          {uni.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-100">
                      <td className="py-3 px-6 text-slate-500">类型</td>
                      {selectedUnis.map((uni) => (
                        <td key={uni.id} className="text-center py-3 px-6">
                          <span className={`px-2 py-0.5 text-xs rounded-full border ${TYPE_COLORS[uni.type]}`}>
                            {uni.type}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="py-3 px-6 text-slate-500">层次</td>
                      {selectedUnis.map((uni) => (
                        <td key={uni.id} className="text-center py-3 px-6 text-slate-700">{uni.level}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="py-3 px-6 text-slate-500">所在城市</td>
                      {selectedUnis.map((uni) => (
                        <td key={uni.id} className="text-center py-3 px-6 text-slate-700">
                          <span className="flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {uni.province} · {uni.city}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="py-3 px-6 text-slate-500">排名</td>
                      {selectedUnis.map((uni) => (
                        <td key={uni.id} className="text-center py-3 px-6 font-mono text-slate-700">
                          {uni.ranking ? `#${uni.ranking}` : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="py-3 px-6 text-slate-500">自划线</td>
                      {selectedUnis.map((uni) => (
                        <td key={uni.id} className="text-center py-3 px-6">
                          {uni.is_self_marking === '是' ? (
                            <span className="inline-flex items-center gap-1 text-amber-600">
                              <Star className="w-3 h-3" /> 是
                            </span>
                          ) : (
                            <span className="text-slate-400">否</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts */}
            {chartData.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                  录取数据对比
                </h3>

                {/* Score Comparison */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    分数线对比
                  </h4>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 20', 'dataMax + 10']} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      {selectedUnis.map((uni, i) => (
                        <Line
                          key={uni.id}
                          type="monotone"
                          dataKey={`${uni.name}_score`}
                          name={`${uni.name} 分数线`}
                          stroke={COLORS[i]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Enrollment Comparison */}
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-500" />
                    录取人数对比
                  </h4>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend />
                      {selectedUnis.map((uni, i) => (
                        <Bar
                          key={uni.id}
                          dataKey={`${uni.name}_enrolled`}
                          name={`${uni.name} 录取人数`}
                          fill={COLORS[i]}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
