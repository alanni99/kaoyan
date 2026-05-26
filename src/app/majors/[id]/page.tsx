'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  School,
  MapPin,
  Filter,
  ChevronDown,
  BookOpen,
  GraduationCap,
  FlaskConical,
  Calculator,
  Scale,
  Heart,
  Briefcase,
  Landmark,
  Lightbulb,
  History,
  Wheat,
  Palette,
  Globe2,
  ArrowUpDown,
  X,
  ExternalLink,
} from 'lucide-react';

interface MajorInfo {
  id: number;
  name: string;
  code: string;
  category: string;
  first_level_discipline: string;
  degree_type: string;
  parent_id: number | null;
  parent: {
    id: number;
    name: string;
    code: string;
    category: string;
    first_level_discipline: string;
    degree_type: string;
  } | null;
  children: {
    id: number;
    name: string;
    code: string;
    degree_type: string;
  }[];
}

interface UniversityMajor {
  university_major_id: number;
  university_id: number;
  university_name: string;
  province: string;
  city: string;
  university_type: string;
  university_level: string;
  region: string;
  is_self_marking: string;
  major_id: number;
  major_name: string;
  college_name: string | null;
  direction: string | null;
  english_type: string | null;
  math_type: string | null;
  study_mode: string | null;
  exam_subjects: string | null;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  '工学': Calculator,
  '理学': FlaskConical,
  '文学': BookOpen,
  '经济学': Briefcase,
  '管理学': Landmark,
  '法学': Scale,
  '教育学': Lightbulb,
  '医学': Heart,
  '艺术学': Palette,
  '哲学': Lightbulb,
  '历史学': History,
  '农学': Wheat,
};

const TYPE_BADGES: Record<string, { bg: string; text: string }> = {
  '985': { bg: 'bg-amber-100', text: 'text-amber-700' },
  '211': { bg: 'bg-blue-100', text: 'text-blue-700' },
  '双一流': { bg: 'bg-violet-100', text: 'text-violet-700' },
  '普通': { bg: 'bg-slate-100', text: 'text-slate-600' },
  '科研院所': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
};

export default function MajorDetailPage() {
  const params = useParams();
  const majorId = params.id as string;

  const [major, setMajor] = useState<MajorInfo | null>(null);
  const [universities, setUniversities] = useState<UniversityMajor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filters
  const [region, setRegion] = useState('');
  const [level, setLevel] = useState('');
  const [englishType, setEnglishType] = useState('');
  const [mathType, setMathType] = useState('');
  const [studyMode, setStudyMode] = useState('');
  const [sort, setSort] = useState('name');

  // Filter options from API
  const [filterOptions, setFilterOptions] = useState<{
    englishTypes: string[];
    mathTypes: string[];
    studyModes: string[];
    regions: string[];
    levels: string[];
  }>({ englishTypes: [], mathTypes: [], studyModes: [], regions: [], levels: [] });

  // Admission stats
  const [admissionStats, setAdmissionStats] = useState<Array<{
    year: number;
    score_line_total: number | null;
    enrolled_count: number | null;
    applied_count: number | null;
  }>>([]);

  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (region) searchParams.set('region', region);
      if (level) searchParams.set('level', level);
      if (englishType) searchParams.set('englishType', englishType);
      if (mathType) searchParams.set('mathType', mathType);
      if (studyMode) searchParams.set('studyMode', studyMode);
      if (sort) searchParams.set('sort', sort);

      const res = await fetch(`/api/majors/${majorId}?${searchParams}`);
      const data = await res.json();

      if (data.major) setMajor(data.major);
      setUniversities(data.universities || []);
      setTotal(data.total || 0);
      setAdmissionStats(data.admissionStats || []);
      if (data.filters) {
        setFilterOptions(data.filters);
      }
    } catch (err) {
      console.error('Failed to fetch major detail:', err);
    } finally {
      setLoading(false);
    }
  }, [majorId, page, region, level, englishType, mathType, studyMode, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearFilters = () => {
    setRegion('');
    setLevel('');
    setEnglishType('');
    setMathType('');
    setStudyMode('');
    setSort('name');
    setPage(1);
  };

  const hasActiveFilters = region || level || englishType || mathType || studyMode;

  const totalPages = Math.ceil(total / pageSize);

  const CategoryIcon = major ? (CATEGORY_ICONS[major.category] || Globe2) : Globe2;

  // Parse exam subjects JSON
  const parseExamSubjects = (subjects: string | null): string[] => {
    if (!subjects) return [];
    try {
      const parsed = JSON.parse(subjects);
      if (Array.isArray(parsed)) return parsed;
      return [subjects];
    } catch {
      return [subjects];
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/majors" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">专业列表</span>
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
              {major ? major.name : '专业详情'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                清除筛选
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                hasActiveFilters
                  ? 'border-amber-300 bg-amber-50 text-amber-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              筛选
              {hasActiveFilters && (
                <span className="w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] flex items-center justify-center">
                  {[region, level, englishType, mathType, studyMode].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-slate-100 bg-white p-4">
            <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {/* Region Filter */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">考研分区</label>
                <select
                  value={region}
                  onChange={(e) => { setRegion(e.target.value); setPage(1); }}
                  className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="">全部</option>
                  <option value="A">A区</option>
                  <option value="B">B区</option>
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">院校层次</label>
                <select
                  value={level}
                  onChange={(e) => { setLevel(e.target.value); setPage(1); }}
                  className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="">全部</option>
                  {filterOptions.levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* English Type Filter */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">英语科目</label>
                <select
                  value={englishType}
                  onChange={(e) => { setEnglishType(e.target.value); setPage(1); }}
                  className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="">全部</option>
                  {filterOptions.englishTypes.map((et) => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              </div>

              {/* Math Type Filter */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">数学科目</label>
                <select
                  value={mathType}
                  onChange={(e) => { setMathType(e.target.value); setPage(1); }}
                  className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="">全部</option>
                  {filterOptions.mathTypes.map((mt) => (
                    <option key={mt} value={mt}>{mt}</option>
                  ))}
                </select>
              </div>

              {/* Study Mode Filter */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">学习方式</label>
                <select
                  value={studyMode}
                  onChange={(e) => { setStudyMode(e.target.value); setPage(1); }}
                  className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="">全部</option>
                  {filterOptions.studyModes.map((sm) => (
                    <option key={sm} value={sm}>{sm}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">排序方式</label>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="name">按名称</option>
                  <option value="level">按层次</option>
                  <option value="region">按分区</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Major Info Card */}
        {major && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <CategoryIcon className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-800">{major.name}</h2>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                      major.degree_type === '学硕'
                        ? 'bg-violet-50 text-violet-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {major.degree_type}
                    </span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-mono">
                      {major.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>门类: {major.category}</span>
                    <span>一级学科: {major.first_level_discipline}</span>
                  </div>
                  {major.parent && (
                    <div className="mt-2 text-sm text-slate-500">
                      隶属: <Link href={`/majors/${major.parent.id}`} className="text-blue-500 hover:underline">{major.parent.name}</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Child Majors */}
            {major.children && major.children.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-medium text-slate-600 mb-2">包含专业方向:</h3>
                <div className="flex flex-wrap gap-2">
                  {major.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/majors/${child.id}`}
                      className="px-3 py-1 text-xs rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-amber-300 transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {region && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {region}区
                <button onClick={() => { setRegion(''); setPage(1); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {level && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {level}
                <button onClick={() => { setLevel(''); setPage(1); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {englishType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                {englishType}
                <button onClick={() => { setEnglishType(''); setPage(1); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {mathType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {mathType}
                <button onClick={() => { setMathType(''); setPage(1); }}><X className="w-3 h-3" /></button>
              </span>
            )}
            {studyMode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                {studyMode}
                <button onClick={() => { setStudyMode(''); setPage(1); }}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            共 <span className="font-semibold text-slate-800">{total}</span> 所院校开设此专业
          </p>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sort === 'name' ? '按名称' : sort === 'level' ? '按层次' : '按分区'}
          </div>
        </div>

        {/* University List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/4 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : universities.length === 0 ? (
          <div className="text-center py-20">
            <School className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">暂无院校开设此专业</p>
            <p className="text-sm text-slate-400 mt-1">尝试调整筛选条件</p>
          </div>
        ) : (
          <div className="space-y-3">
            {universities.map((um) => {
              const typeBadge = TYPE_BADGES[um.university_type] || TYPE_BADGES['普通'];
              const examSubjects = parseExamSubjects(um.exam_subjects);

              return (
                <div
                  key={um.university_major_id}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* University Name & Badges */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Link
                          href={`/universities/${um.university_id}`}
                          className="text-base font-semibold text-slate-800 hover:text-amber-600 transition-colors"
                        >
                          {um.university_name}
                        </Link>
                        <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${typeBadge.bg} ${typeBadge.text}`}>
                          {um.university_type}
                        </span>
                        {um.is_self_marking === '是' && (
                          <span className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-red-100 text-red-600">
                            自划线
                          </span>
                        )}
                        <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                          um.region === 'A' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {um.region}区
                        </span>
                      </div>

                      {/* Location & College */}
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {um.province} {um.city}
                        </span>
                        {um.college_name && (
                          <span>{um.college_name}</span>
                        )}
                      </div>

                      {/* Major name if different from current */}
                      {um.major_name !== major?.name && (
                        <div className="text-sm text-slate-600 mb-2">
                          专业: {um.major_name}
                        </div>
                      )}

                      {/* Exam Info */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {um.english_type && (
                          <span className="px-2 py-0.5 text-xs rounded bg-violet-50 text-violet-600 border border-violet-100">
                            {um.english_type}
                          </span>
                        )}
                        {um.math_type && (
                          <span className="px-2 py-0.5 text-xs rounded bg-emerald-50 text-emerald-600 border border-emerald-100">
                            {um.math_type}
                          </span>
                        )}
                        {um.study_mode && (
                          <span className="px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-600 border border-blue-100">
                            {um.study_mode}
                          </span>
                        )}
                        {um.direction && (
                          <span className="px-2 py-0.5 text-xs rounded bg-slate-50 text-slate-600 border border-slate-200">
                            方向: {um.direction}
                          </span>
                        )}
                      </div>

                      {/* Exam Subjects Detail */}
                      {examSubjects.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <h4 className="text-xs font-medium text-slate-500 mb-1.5">考试科目</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {examSubjects.map((subject, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs rounded bg-amber-50 text-amber-700 border border-amber-100"
                              >
                                {idx + 1}. {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Link to University Detail */}
                    <Link
                      href={`/universities/${um.university_id}`}
                      className="flex-shrink-0 ml-4 p-2 text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              上一页
            </button>
            <span className="text-sm text-slate-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一页
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
