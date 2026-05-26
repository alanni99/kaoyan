import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '轨道 - 智能考研择校平台',
    template: '%s | 轨道',
  },
  description:
    '轨道是中国考研学生的智能择校平台，提供院校查询、AI择校、专业查询、录取数据分析等一站式服务，助力考研学子精准择校。',
  keywords: [
    '考研',
    '研究生考试',
    '择校',
    '院校查询',
    '专业查询',
    '录取分数线',
    '考研AI',
    '学硕',
    '专硕',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className="antialiased bg-slate-50 min-h-screen">
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
