'use client';

import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function DisclaimerAlert({ type = 'default' }: { type?: 'default' | 'data' | 'ai' }) {
  const configs = {
    default: {
      title: '温馨提示',
      icon: Info,
      description: '本平台仅供学习参考，所有数据均为模拟数据，请以各高校官方发布信息为准。',
    },
    data: {
      title: '数据说明',
      icon: Info,
      description: '展示的分数线、录取人数等数据为模拟参考值，非官方数据。请务必查阅目标院校官网获取最新准确信息。',
    },
    ai: {
      title: 'AI建议说明',
      icon: AlertTriangle,
      description: 'AI智能择校提供的建议仅供参考，不构成报考建议。请结合自身实际情况和官方信息谨慎决策。',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Alert className="mb-6 border-amber-200 bg-amber-50">
      <Icon className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 text-sm font-medium">{config.title}</AlertTitle>
      <AlertDescription className="text-amber-700 text-xs">
        {config.description}
      </AlertDescription>
    </Alert>
  );
}
