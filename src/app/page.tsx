import Link from 'next/link';
import {
  Search,
  GraduationCap,
  BookOpen,
  BarChart3,
  GitCompareArrows,
  Bot,
  ArrowRight,
  School,
  TrendingUp,
  Users,
  MapPin,
} from 'lucide-react';

const features = [
  {
    title: '院校查询',
    description: '按地区、类型、层次筛选全国考研院校，查看详细信息',
    icon: School,
    href: '/universities',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'AI 智能择校',
    description: '输入个人背景和目标，AI为你量身推荐最合适的院校',
    icon: Bot,
    href: '/ai',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50 text-amber-600',
  },
  {
    title: '专业查询',
    description: '区分学硕与专硕，按学科门类查找目标专业',
    icon: BookOpen,
    href: '/majors',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50 text-violet-600',
  },
  {
    title: '分数线查询',
    description: '查看历年国家线、院校线，掌握录取分数趋势',
    icon: BarChart3,
    href: '/universities',
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: '院校对比',
    description: '最多3所院校横向对比，直观分析优劣',
    icon: GitCompareArrows,
    href: '/compare',
    color: 'bg-rose-500',
    lightColor: 'bg-rose-50 text-rose-600',
  },
  {
    title: '备考攻略',
    description: '学硕专硕解读、报考流程、复习规划一站式指南',
    icon: GraduationCap,
    href: '/majors',
    color: 'bg-cyan-500',
    lightColor: 'bg-cyan-50 text-cyan-600',
  },
];

const stats = [
  { label: '收录院校', value: '80+', icon: School },
  { label: '专业方向', value: '90+', icon: BookOpen },
  { label: '录取数据', value: '100+', icon: BarChart3 },
  { label: '覆盖省份', value: '20+', icon: MapPin },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-xl font-bold text-slate-800">轨道</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/universities" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              院校查询
            </Link>
            <Link href="/ai" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              AI择校
            </Link>
            <Link href="/majors" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              专业查询
            </Link>
            <Link href="/compare" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              院校对比
            </Link>
          </nav>
          <Link
            href="/ai"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            <Bot className="w-4 h-4" />
            AI 择校
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm mb-6">
              <TrendingUp className="w-3.5 h-3.5" />
              2025 考研数据已更新
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              考研择校
              <span className="text-amber-400">，一步到位</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
              汇集全国考研院校数据，AI 智能分析你的优势与目标，<br className="hidden md:block" />
              从学硕到专硕、从分数线到报录比，助你精准定位理想院校
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/universities"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/25"
              >
                <Search className="w-5 h-5" />
                查询院校
              </Link>
              <Link
                href="/ai"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                <Bot className="w-5 h-5" />
                AI 智能择校
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">全方位考研服务</h2>
          <p className="text-slate-500">从择校到备考，为你提供一站式考研信息平台</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.lightColor} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4">{feature.description}</p>
              <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                立即使用 <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 学硕 vs 专硕 Guide */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">学硕 vs 专硕，你选哪个？</h2>
            <p className="text-slate-500">了解区别，才能做出正确选择</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 学硕 */}
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-violet-500 text-white text-sm font-bold rounded-lg">学硕</span>
                <span className="text-sm text-violet-600">学术型硕士</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  培养目标：培养教学和科研人才
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  学制：一般为3年
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  学位论文：学术研究型论文
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  适合人群：有志于读博深造、从事科研
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  考试科目：一般考英语一 + 数学一/二
                </li>
              </ul>
            </div>
            {/* 专硕 */}
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-emerald-500 text-white text-sm font-bold rounded-lg">专硕</span>
                <span className="text-sm text-emerald-600">专业型硕士</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  培养目标：培养应用型高层次人才
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  学制：一般为2-3年
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  学位论文：应用研究型/实践型论文
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  适合人群：以就业为导向、提升职业能力
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  考试科目：一般考英语二 + 数学二/三
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-white font-semibold">轨道</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                为考研学子提供院校信息查询、AI智能择校等服务，助力精准定位理想院校。
              </p>
              <div className="flex items-center gap-1 text-sm">
                <Users className="w-4 h-4" />
                助力考研学子精准择校
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-white font-semibold text-sm">免责声明</h4>
              <div className="text-xs space-y-2 text-slate-400">
                <p>
                  <strong>数据说明：</strong>本网站展示的院校信息、专业目录、录取分数线等数据均为模拟数据，仅供学习和参考使用。
                </p>
                <p>
                  <strong>官方信息：</strong>请务必以各高校研究生院官网、教育部官方发布的最新招生简章和录取信息为准。
                </p>
                <p>
                  <strong>AI建议：</strong>AI智能择校功能提供的建议仅供参考，不构成报考建议，请结合自身实际情况谨慎决策。
                </p>
                <p>
                  <strong>使用性质：</strong>本网站为非商业性质的学习参考平台，不收取任何费用，不提供任何形式的担保。
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              © 2025 轨道考研择校平台 · 仅供学习参考
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <span>数据来源：公开教育信息整理</span>
              <span>非官方平台</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
