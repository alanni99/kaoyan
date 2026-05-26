'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Star,
  Globe,
  School,
  TrendingUp,
  Users,
  BarChart3,
  ExternalLink,
  ChevronDown,
  ChevronRight,
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
import { DisclaimerAlert } from '@/components/disclaimer';

interface UniversityDetail {
  university: {
    id: number;
    name: string;
    province: string;
    city: string;
    type: string;
    level: string;
    website: string | null;
    description: string | null;
    is_self_marking: string;
    ranking: number | null;
  };
  majors: Array<{
    id: number;
    major_id: number;
    college_name: string | null;
    direction: string | null;
    majors: {
      id: number;
      name: string;
      code: string;
      category: string;
      first_level_discipline: string;
      degree_type: string;
      parent_id: number | null;
      parent_name: string | null;
      parent_code: string | null;
    };
  }>;
  admissions: Array<{
    id: number;
    major_id: number;
    year: number;
    score_line_total: number | null;
    score_line_politics: number | null;
    score_line_english: number | null;
    score_line_profession1: number | null;
    score_line_profession2: number | null;
    enrolled_count: number | null;
    applied_count: number | null;
    majors: {
      name: string;
      code: string;
      category: string;
      degree_type: string;
      parent_id: number | null;
      parent_name: string | null;
      parent_code: string | null;
    };
  }>;
}

const TYPE_COLORS: Record<string, string> = {
  '985': 'bg-red-50 text-red-600 border-red-200',
  '211': 'bg-blue-50 text-blue-600 border-blue-200',
  '双一流': 'bg-amber-50 text-amber-600 border-amber-200',
  '普通': 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function UniversityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  const [data, setData] = useState<UniversityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMajor, setSelectedMajor] = useState<number | null>(null);
  const [degreeFilter, setDegreeFilter] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/universities/${id}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch university:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { university, majors, admissions } = data;

  // Filter majors by degree type
  const filteredMajors = degreeFilter === ''
    ? majors
    : majors.filter((m) => m.majors.degree_type === degreeFilter);

  // Group majors by parent discipline (一级学科)
  const majorsByParent = new Map<string, typeof filteredMajors>();
  filteredMajors.forEach((m) => {
    const parentKey = m.majors.parent_name
      ? `${m.majors.parent_name}|||${m.majors.parent_code}|||${m.majors.degree_type}`
      : `${m.majors.first_level_discipline}|||${m.majors.code.substring(0, 4)}00|||${m.majors.degree_type}`;
    if (!majorsByParent.has(parentKey)) majorsByParent.set(parentKey, []);
    majorsByParent.get(parentKey)!.push(m);
  });

  // Sort parent groups
  const sortedGroups = [...majorsByParent.entries()].sort((a, b) => {
    const aType = a[0].split('|||')[2];
    const bType = b[0].split('|||')[2];
    if (aType !== bType) return aType === '学硕' ? -1 : 1;
    return a[0].localeCompare(b[0]);
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Filter admission data by selected major
  const filteredAdmissions = selectedMajor
    ? admissions.filter((a) => a.major_id === selectedMajor)
    : admissions;

  // Group admission data by major for chart
  const admissionByMajor = new Map<string, Array<(typeof admissions)[0]>>();
  filteredAdmissions.forEach((a) => {
    const label = a.majors.parent_name
      ? `${a.majors.parent_name} - ${a.majors.name}(${a.majors.degree_type})`
      : `${a.majors.name}(${a.majors.degree_type})`;
    if (!admissionByMajor.has(label)) admissionByMajor.set(label, []);
    admissionByMajor.get(label)!.push(a);
  });

  // Prepare chart data
  const chartDataMap = new Map<number, Record<string, number | null>>();
  filteredAdmissions.forEach((a) => {
    if (!chartDataMap.has(a.year)) chartDataMap.set(a.year, { year: a.year } as Record<string, number | null>);
    const entry = chartDataMap.get(a.year)!;
    const label = a.majors.parent_name
      ? `${a.majors.parent_name} - ${a.majors.name}(${a.majors.degree_type})`
      : `${a.majors.name}(${a.majors.degree_type})`;
    entry[`${label}_score`] = a.score_line_total;
    entry[`${label}_enrolled`] = a.enrolled_count;
  });

  const years = [...chartDataMap.keys()].sort();
  const chartData = years.map((y) => ({ year: y, ...chartDataMap.get(y)! }));

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];
  const majorKeys = [...admissionByMajor.keys()];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <Link href="/universities" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">院校列表</span>
          </Link>
          <span className="text-slate-300">|</span>
          <h1 className="text-lg font-semibold text-slate-800">{university.name}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <DisclaimerAlert type="data" />
        {/* University Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <School className="w-8 h-8 text-slate-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-800">{university.name}</h2>
                {university.ranking && (
                  <span className="px-2 py-0.5 text-xs font-mono bg-slate-100 text-slate-600 rounded">
                    软科 #{university.ranking}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`px-2 py-0.5 text-xs rounded-full border ${TYPE_COLORS[university.type]}`}>
                  {university.type}
                </span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                  {university.level}
                </span>
                {university.is_self_marking === '是' && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1">
                    <Star className="w-3 h-3" /> 自划线
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />
                  {university.province} · {university.city}
                </span>
              </div>
              {university.description && (
                <p className="text-sm text-slate-600 mb-3">{university.description}</p>
              )}
              {university.website && (
                <a
                  href={university.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Globe className="w-3.5 h-3.5" />
                  访问官网
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Majors Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <BookOpenIcon />
              开设专业
              <span className="text-sm font-normal text-slate-400">
                （点击一级学科展开二级方向）
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDegreeFilter('')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${degreeFilter === '' ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-200 text-slate-600'}`}
              >
                全部
              </button>
              <button
                onClick={() => setDegreeFilter('学硕')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${degreeFilter === '学硕' ? 'bg-violet-500 text-white border-violet-500' : 'border-slate-200 text-slate-600'}`}
              >
                学硕
              </button>
              <button
                onClick={() => setDegreeFilter('专硕')}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${degreeFilter === '专硕' ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-200 text-slate-600'}`}
              >
                专硕
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {sortedGroups.map(([groupKey, groupMajors]) => {
              const [parentName, parentCode, degType] = groupKey.split('|||');
              const isExpanded = expandedGroups.has(groupKey);
              const hasChildren = groupMajors.length > 1 || groupMajors.some((m) => m.majors.parent_id !== null);

              return (
                <div key={groupKey} className="border border-slate-200 rounded-lg overflow-hidden">
                  {/* Parent discipline header */}
                  <button
                    type="button"
                    onClick={() => hasChildren && toggleGroup(groupKey)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {hasChildren ? (
                        isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )
                      ) : (
                        <div className="w-4" />
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        degType === '学硕' ? 'bg-violet-50 text-violet-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {degType}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{parentName}</span>
                      <span className="text-xs text-slate-400 font-mono">{parentCode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasChildren && (
                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {groupMajors.length}个方向
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Child disciplines (when expanded) or single item */}
                  {(isExpanded || !hasChildren) && (
                    <div className="border-t border-slate-100 bg-slate-50/30">
                      {groupMajors.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMajor(selectedMajor === m.major_id ? null : m.major_id)}
                          className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-amber-50/30 transition-colors ${
                            selectedMajor === m.major_id ? 'bg-amber-50' : ''
                          } ${hasChildren ? 'pl-12' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            {hasChildren && (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                            )}
                            <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                              m.majors.degree_type === '学硕'
                                ? 'bg-violet-50 text-violet-500'
                                : 'bg-emerald-50 text-emerald-500'
                            }`}>
                              {m.majors.degree_type === '学硕' ? '学' : '专'}
                            </span>
                            <span className="text-sm text-slate-700">{m.majors.name}</span>
                            <span className="text-xs text-slate-400 font-mono">{m.majors.code}</span>
                            {m.college_name && (
                              <span className="text-xs text-slate-400 hidden sm:inline">· {m.college_name}</span>
                            )}
                          </div>
                          {m.direction && (
                            <span className="text-xs text-slate-400 truncate max-w-40">{m.direction}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredMajors.length === 0 && (
            <p className="text-center text-slate-400 py-8">暂无相关专业信息</p>
          )}
        </div>

        {/* Admission Charts */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              历年录取数据
              <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded ml-2">参考数据</span>
              {selectedMajor && (
                <span className="text-sm font-normal text-slate-500">
                  （点击专业可筛选）
                </span>
              )}
            </h3>

            {/* Score Line Chart */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                分数线趋势
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
                  {majorKeys.map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={`${key}_score`}
                      name={`${key} 分数线`}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Enrolled Count Chart */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-500" />
                录取人数趋势
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
                  {majorKeys.map((key, i) => (
                    <Bar
                      key={key}
                      dataKey={`${key}_enrolled`}
                      name={`${key} 录取人数`}
                      fill={COLORS[i % COLORS.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">详细数据</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 text-slate-500 font-medium">专业</th>
                      <th className="text-right py-2 px-3 text-slate-500 font-medium">年份</th>
                      <th className="text-right py-2 px-3 text-slate-500 font-medium">总分线</th>
                      <th className="text-right py-2 px-3 text-slate-500 font-medium">政治</th>
                      <th className="text-right py-2 px-3 text-slate-500 font-medium">英语</th>
                      <th className="text-right py-2 px-3 text-slate-500 font-medium">录取</th>
                      <th className="text-right py-2 px-3 text-slate-500 font-medium">报名</th>
                      <th className="text-right py-2 px-3 text-slate-500 font-medium">报录比</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmissions.map((a) => {
                      const displayName = a.majors.parent_name
                        ? `${a.majors.parent_name} - ${a.majors.name}`
                        : a.majors.name;
                      return (
                        <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  a.majors.degree_type === '学硕' ? 'bg-violet-400' : 'bg-emerald-400'
                                }`}
                              />
                              <span className="text-slate-800">{displayName}</span>
                              <span className={`px-1 py-0.5 text-[10px] rounded ${
                                a.majors.degree_type === '学硕' ? 'bg-violet-50 text-violet-500' : 'bg-emerald-50 text-emerald-500'
                              }`}>
                                {a.majors.degree_type}
                              </span>
                            </div>
                          </td>
                          <td className="text-right py-2 px-3 font-mono text-slate-600">{a.year}</td>
                          <td className="text-right py-2 px-3 font-semibold text-amber-600">{a.score_line_total}</td>
                          <td className="text-right py-2 px-3 text-slate-600">{a.score_line_politics}</td>
                          <td className="text-right py-2 px-3 text-slate-600">{a.score_line_english}</td>
                          <td className="text-right py-2 px-3 text-slate-600">{a.enrolled_count}</td>
                          <td className="text-right py-2 px-3 text-slate-600">{a.applied_count}</td>
                          <td className="text-right py-2 px-3 text-slate-600">
                            {a.enrolled_count && a.applied_count
                              ? `${(a.applied_count / a.enrolled_count).toFixed(1)}:1`
                              : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function BookOpenIcon() {
  return (
    <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
