'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  BookOpen,
  FlaskConical,
  Palette,
  Briefcase,
  Scale,
  Heart,
  Calculator,
  Landmark,
  Globe2,
  Lightbulb,
  History,
  Wheat,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface Major {
  id: number;
  name: string;
  code: string;
  category: string;
  first_level_discipline: string;
  degree_type: string;
  parent_id: number | null;
  children?: Major[];
}

interface MajorGroup {
  parent: Major;
  children: Major[];
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

const CATEGORY_COLORS: Record<string, string> = {
  '工学': 'bg-blue-50 text-blue-600 border-blue-200',
  '理学': 'bg-purple-50 text-purple-600 border-purple-200',
  '文学': 'bg-rose-50 text-rose-600 border-rose-200',
  '经济学': 'bg-amber-50 text-amber-600 border-amber-200',
  '管理学': 'bg-cyan-50 text-cyan-600 border-cyan-200',
  '法学': 'bg-red-50 text-red-600 border-red-200',
  '教育学': 'bg-green-50 text-green-600 border-green-200',
  '医学': 'bg-pink-50 text-pink-600 border-pink-200',
  '艺术学': 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200',
  '哲学': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  '历史学': 'bg-orange-50 text-orange-600 border-orange-200',
  '农学': 'bg-lime-50 text-lime-600 border-lime-200',
};

export default function MajorsPage() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [degreeType, setDegreeType] = useState<string>('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const pageSize = 100;

  const fetchMajors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (keyword) params.set('keyword', keyword);
      if (degreeType) params.set('degreeType', degreeType);
      if (category) params.set('category', category);

      const res = await fetch(`/api/majors?${params}`);
      const data = await res.json();
      setMajors(data.data || []);
      setTotal(data.total || 0);
      if (data.filters?.categories) {
        setCategories(data.filters.categories);
      }
    } catch (err) {
      console.error('Failed to fetch majors:', err);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, degreeType, category]);

  useEffect(() => {
    fetchMajors();
  }, [fetchMajors]);

  // Build hierarchical structure: group children under parents
  const buildHierarchy = (flatMajors: Major[]): { parents: Major[]; groups: Record<string, MajorGroup> } => {
    const parentMap: Record<number, Major> = {};
    const childMap: Record<number, Major[]> = {};
    const standalone: Major[] = [];

    flatMajors.forEach((m) => {
      if (m.parent_id === null) {
        parentMap[m.id] = m;
      } else {
        if (!childMap[m.parent_id]) childMap[m.parent_id] = [];
        childMap[m.parent_id].push(m);
      }
    });

    // Parents with children become groups, standalone parents are shown as-is
    const groups: Record<string, MajorGroup> = {};
    const parents: Major[] = [];

    flatMajors.forEach((m) => {
      if (m.parent_id === null) {
        const children = childMap[m.id];
        if (children && children.length > 0) {
          groups[m.id] = { parent: m, children };
          parents.push(m);
        } else {
          // Standalone parent (no children in current result set)
          standalone.push(m);
        }
      }
    });

    return { parents, groups };
  };

  const { parents, groups } = buildHierarchy(majors);

  // Group by category
  const groupedByCategory = parents.reduce<Record<string, typeof parents>>((acc, p) => {
    const cat = p.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  // Also group standalone majors (parents without children)
  const standaloneByCategory = majors
    .filter((m) => m.parent_id === null && !groups[m.id])
    .reduce<Record<string, Major[]>>((acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    }, {});

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const totalPages = Math.ceil(total / pageSize);

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
            <h1 className="text-lg font-semibold text-slate-800">专业查询</h1>
          </div>
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              onKeyDown={(e) => e.key === 'Enter' && fetchMajors()}
              placeholder="搜索专业名称..."
              className="w-48 sm:w-64 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Degree Type Tabs */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 py-2">
              <button
                onClick={() => { setDegreeType(''); setPage(1); }}
                className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  degreeType === '' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => { setDegreeType('学硕'); setPage(1); }}
                className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  degreeType === '学硕' ? 'bg-violet-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                学硕
              </button>
              <button
                onClick={() => { setDegreeType('专硕'); setPage(1); }}
                className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  degreeType === '专硕' ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                专硕
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setCategory(''); setPage(1); }}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                category === '' ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-200 text-slate-600 hover:border-amber-300'
              }`}
            >
              全部门类
            </button>
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] || Globe2;
              return (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat === category ? '' : cat); setPage(1); }}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex items-center gap-1 ${
                    category === cat
                      ? `${CATEGORY_COLORS[cat]} border-current`
                      : 'border-slate-200 text-slate-600 hover:border-amber-300'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          共找到 <span className="font-semibold text-slate-800">{total}</span> 个专业方向
          <span className="text-slate-400 ml-2">（点击一级学科展开查看二级学科/专业领域）</span>
        </p>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByCategory).map(([cat, catParents]) => {
              const Icon = CATEGORY_ICONS[cat] || Globe2;
              return (
                <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className={`px-5 py-3 border-b border-slate-100 flex items-center gap-2 ${CATEGORY_COLORS[cat]?.split(' ')[0] || 'bg-slate-50'}`}>
                    <Icon className="w-4 h-4" />
                    <h3 className="font-semibold text-sm">{cat}</h3>
                    <span className="text-xs opacity-60">({catParents.length} 个一级学科)</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {catParents.map((parent) => {
                      const group = groups[parent.id];
                      const isExpanded = expandedGroups.has(String(parent.id));
                      const childCount = group?.children.length || 0;

                      return (
                        <div key={parent.id}>
                          {/* Parent discipline row - clickable to expand */}
                          <button
                            type="button"
                            onClick={() => toggleGroup(String(parent.id))}
                            className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              {childCount > 0 ? (
                                isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                )
                              ) : (
                                <div className="w-4 h-4 flex-shrink-0" />
                              )}
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                  parent.degree_type === '学硕'
                                    ? 'bg-violet-50 text-violet-600'
                                    : 'bg-emerald-50 text-emerald-600'
                                }`}
                              >
                                {parent.degree_type}
                              </span>
                              <Link href={`/majors/${parent.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-amber-600 transition-colors">
                                <span className="text-sm font-semibold text-slate-800">{parent.name}</span>
                              </Link>
                              <span className="text-xs text-slate-400 ml-2 font-mono">{parent.code}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {childCount > 0 && (
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                  {childCount}个专业方向
                                </span>
                              )}
                              <span className="text-xs text-slate-500">{parent.first_level_discipline}</span>
                            </div>
                          </button>

                          {/* Children disciplines - shown when expanded */}
                          {isExpanded && group && group.children.length > 0 && (
                            <div className="bg-slate-50/50 border-t border-slate-100">
                              {group.children.map((child) => (
                                <Link
                                  key={child.id}
                                  href={`/majors/${child.id}`}
                                  className="px-5 pl-14 py-2.5 flex items-center justify-between hover:bg-slate-100/50 transition-colors border-t border-slate-100/50 first:border-t-0"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                                    <span
                                      className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
                                        child.degree_type === '学硕'
                                          ? 'bg-violet-50 text-violet-500'
                                          : 'bg-emerald-50 text-emerald-500'
                                      }`}
                                    >
                                      {child.degree_type === '学硕' ? '学' : '专'}
                                    </span>
                                    <span className="text-sm text-slate-700 hover:text-amber-600">{child.name}</span>
                                    <span className="text-xs text-slate-400 font-mono">{child.code}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Standalone majors without hierarchy */}
            {Object.entries(standaloneByCategory).map(([cat, catMajors]) => {
              if (groupedByCategory[cat]) return null; // Skip if category already shown
              const Icon = CATEGORY_ICONS[cat] || Globe2;
              return (
                <div key={cat} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className={`px-5 py-3 border-b border-slate-100 flex items-center gap-2 ${CATEGORY_COLORS[cat]?.split(' ')[0] || 'bg-slate-50'}`}>
                    <Icon className="w-4 h-4" />
                    <h3 className="font-semibold text-sm">{cat}</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {catMajors.map((major) => (
                      <Link key={major.id} href={`/majors/${major.id}`} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            major.degree_type === '学硕' ? 'bg-violet-50 text-violet-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {major.degree_type}
                          </span>
                          <span className="text-sm font-medium text-slate-800 hover:text-amber-600">{major.name}</span>
                          <span className="text-xs text-slate-400 font-mono">{major.code}</span>
                        </div>
                        <span className="text-xs text-slate-500">{major.first_level_discipline}</span>
                      </Link>
                    ))}
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
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              上一页
            </button>
            <span className="text-sm text-slate-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              下一页
            </button>
          </div>
        )}

        {/* 学硕 vs 专硕 说明 */}
        <div className="mt-10 bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">学硕与专硕的区别</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4">
              <h4 className="font-medium text-violet-700 mb-2 text-sm">学硕（学术型硕士）</h4>
              <ul className="text-xs text-slate-700 space-y-1.5">
                <li>- 偏重学术研究，培养科研能力</li>
                <li>- 学制一般3年，可直接读博</li>
                <li>- 考试科目通常更难（英语一、数学一）</li>
                <li>- 适合有志于学术研究或读博深造的同学</li>
                <li>- 学费一般8000元/年</li>
                <li>- 按一级学科招生，下设二级学科方向</li>
              </ul>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
              <h4 className="font-medium text-emerald-700 mb-2 text-sm">专硕（专业型硕士）</h4>
              <ul className="text-xs text-slate-700 space-y-1.5">
                <li>- 偏重实践应用，培养职业能力</li>
                <li>- 学制一般2-3年，不可直博</li>
                <li>- 考试科目相对简单（英语二、数学二）</li>
                <li>- 适合以就业为导向的同学</li>
                <li>- 部分专业学费较高</li>
                <li>- 按专业类别招生，下设具体专业领域</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800">
              <strong>提示：</strong>专硕的类别代码一般为6位（如085400），其下的具体领域代码末尾更详细（如085404计算机技术、085410人工智能）。
              选择专硕时，要同时关注类别和具体领域方向。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
