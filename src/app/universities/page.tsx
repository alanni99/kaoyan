'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  School,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  GraduationCap,
  ArrowLeft,
} from 'lucide-react';

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

const PROVINCES = [
  '北京', '上海', '天津', '重庆', '河北', '山西', '辽宁', '吉林',
  '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '四川', '陕西', '甘肃',
];

const TYPES = ['985', '211', '双一流', '普通'];
const LEVELS = ['综合', '理工', '师范', '农林', '医药', '政法', '财经', '艺术', '体育', '民族', '军事'];

const TYPE_COLORS: Record<string, string> = {
  '985': 'bg-red-50 text-red-600 border-red-200',
  '211': 'bg-blue-50 text-blue-600 border-blue-200',
  '双一流': 'bg-amber-50 text-amber-600 border-amber-200',
  '普通': 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [province, setProvince] = useState('');
  const [type, setType] = useState('');
  const [level, setLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 20;

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (keyword) params.set('keyword', keyword);
      if (province) params.set('province', province);
      if (type) params.set('type', type);
      if (level) params.set('level', level);

      const res = await fetch(`/api/universities?${params}`);
      const data = await res.json();
      setUniversities(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch universities:', err);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, province, type, level]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = () => {
    setPage(1);
    fetchUniversities();
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setPage(1);
    if (filterType === 'province') setProvince(value === province ? '' : value);
    if (filterType === 'type') setType(value === type ? '' : value);
    if (filterType === 'level') setLevel(value === level ? '' : value);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">首页</span>
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-semibold text-slate-800">院校查询</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索院校名称..."
                className="w-48 sm:w-64 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border transition-colors ${showFilters ? 'bg-amber-50 border-amber-200 text-amber-600' : 'border-slate-200 text-slate-500 hover:text-slate-700'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-slate-100 bg-white px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-7xl mx-auto space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">院校类型</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleFilterChange('type', t)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        type === t
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">院校层次</label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      onClick={() => handleFilterChange('level', l)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        level === l
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">所在省份</label>
                <div className="flex flex-wrap gap-2">
                  {PROVINCES.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleFilterChange('province', p)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        province === p
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Results */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            共找到 <span className="font-semibold text-slate-800">{total}</span> 所院校
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {universities.map((uni) => (
              <Link
                key={uni.id}
                href={`/universities/${uni.id}`}
                className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <School className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                        {uni.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" />
                        {uni.province} · {uni.city}
                      </div>
                    </div>
                  </div>
                  {uni.ranking && (
                    <span className="text-xs font-mono text-slate-400">#{uni.ranking}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${TYPE_COLORS[uni.type] || TYPE_COLORS['普通']}`}>
                    {uni.type}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                    {uni.level}
                  </span>
                  {uni.is_self_marking === '是' && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      自划线
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pageNum = start + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === page
                      ? 'bg-amber-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
