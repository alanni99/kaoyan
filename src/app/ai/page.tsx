'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  Send,
  User,
  Loader2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { DisclaimerAlert } from '@/components/disclaimer';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIRecommendPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    undergraduate: '',
    major: '',
    gpa: '',
    targetDegree: '',
    targetMajor: '',
    targetCity: '',
    careerGoal: '',
    other: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStream]);

  const handleFormSubmit = async () => {
    const hasData = Object.values(formData).some((v) => v.trim());
    if (!hasData) return;

    const userInfo = formData;
    setStreaming(true);
    setCurrentStream('');
    setShowForm(false);

    // Add user message
    const userMsg = formatUserMessage(userInfo);
    setMessages([{ role: 'user', content: userMsg }]);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInfo }),
      });

      if (!res.ok) throw new Error('请求失败');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setCurrentStream(fullContent);
              }
              if (parsed.error) {
                fullContent += `\n\n⚠️ 错误: ${parsed.error}`;
                setCurrentStream(fullContent);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: fullContent }]);
      setCurrentStream('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'AI服务暂时不可用';
      setMessages((prev) => [...prev, { role: 'assistant', content: `抱歉，${errorMsg}，请稍后再试。` }]);
      setCurrentStream('');
    } finally {
      setStreaming(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!input.trim() || streaming) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setStreaming(true);
    setCurrentStream('');

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg, history }),
      });

      if (!res.ok) throw new Error('请求失败');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setCurrentStream(fullContent);
              }
            } catch {
              // Ignore
            }
          }
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: fullContent }]);
      setCurrentStream('');
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: '抱歉，AI服务暂时不可用，请稍后再试。' }]);
      setCurrentStream('');
    } finally {
      setStreaming(false);
    }
  };

  const formatUserMessage = (info: typeof formData) => {
    const parts: string[] = [];
    if (info.undergraduate) parts.push(`本科院校：${info.undergraduate}`);
    if (info.major) parts.push(`本科专业：${info.major}`);
    if (info.gpa) parts.push(`成绩/GPA：${info.gpa}`);
    if (info.targetDegree) parts.push(`目标类型：${info.targetDegree}`);
    if (info.targetMajor) parts.push(`意向专业：${info.targetMajor}`);
    if (info.targetCity) parts.push(`意向城市：${info.targetCity}`);
    if (info.careerGoal) parts.push(`职业规划：${info.careerGoal}`);
    if (info.other) parts.push(`补充信息：${info.other}`);
    return parts.join('\n');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">首页</span>
          </Link>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-800">AI 智能择校</h1>
              <p className="text-xs text-slate-400">基于你的情况，推荐最合适的院校</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">
        <DisclaimerAlert type="ai" />
        {/* Form - shown initially */}
        {showForm && messages.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-800">填写你的信息</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              请尽可能完整地填写以下信息，AI将根据你的情况为你推荐最合适的考研院校和专业方向。
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">本科院校</label>
                <input
                  type="text"
                  value={formData.undergraduate}
                  onChange={(e) => setFormData({ ...formData, undergraduate: e.target.value })}
                  placeholder="如：某双非一本、某211院校..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">本科专业</label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  placeholder="如：计算机科学与技术..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">成绩/GPA</label>
                <input
                  type="text"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  placeholder="如：专业前10%、GPA 3.5/4.0..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">目标学位类型</label>
                <select
                  value={formData.targetDegree}
                  onChange={(e) => setFormData({ ...formData, targetDegree: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                >
                  <option value="">未确定</option>
                  <option value="学硕">学硕（学术型）</option>
                  <option value="专硕">专硕（专业型）</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">意向专业方向</label>
                <input
                  type="text"
                  value={formData.targetMajor}
                  onChange={(e) => setFormData({ ...formData, targetMajor: e.target.value })}
                  placeholder="如：人工智能、金融学..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">意向城市/地区</label>
                <input
                  type="text"
                  value={formData.targetCity}
                  onChange={(e) => setFormData({ ...formData, targetCity: e.target.value })}
                  placeholder="如：北京、长三角、不限..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">职业规划</label>
                <input
                  type="text"
                  value={formData.careerGoal}
                  onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                  placeholder="如：继续读博、进入大厂、考公..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">补充信息</label>
                <input
                  type="text"
                  value={formData.other}
                  onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                  placeholder="其他你想补充的信息..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
            <button
              onClick={handleFormSubmit}
              disabled={!Object.values(formData).some((v) => v.trim())}
              className="mt-6 w-full md:w-auto px-8 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              开始智能分析
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-amber-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <div className="whitespace-pre-wrap prose prose-sm max-w-none prose-headings:text-slate-800 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
                  {msg.content}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
              )}
            </div>
          ))}

          {/* Streaming message */}
          {streaming && currentStream && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-amber-600" />
              </div>
              <div className="max-w-[80%] bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm leading-relaxed text-slate-700">
                <div className="whitespace-pre-wrap">{currentStream}</div>
                <span className="inline-block w-1.5 h-4 bg-amber-500 animate-pulse ml-0.5" />
              </div>
            </div>
          )}

          {streaming && !currentStream && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-amber-600" />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在分析你的情况...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        {messages.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit();
                  }
                }}
                placeholder="继续追问，如：推荐几所保底院校？这个专业就业前景如何？"
                rows={1}
                disabled={streaming}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none disabled:opacity-50"
              />
              <button
                onClick={handleChatSubmit}
                disabled={streaming || !input.trim()}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
