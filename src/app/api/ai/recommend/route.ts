import { createAIService, AIMessage } from '@/lib/ai-service';

const systemPrompt = `你是一位友好的考研择校顾问，用自然的对话方式帮助学生规划考研。

## 你的原则：
- 像和朋友聊天一样，不要太正式
- 回答要简洁，不要长篇大论
- 根据学生的情况实事求是地推荐
- 如果信息不够，可以主动询问
- 重点关注：本科背景、成绩、目标城市、职业规划

## 回答风格：
- 口语化，自然流畅
- 避免太多emoji和复杂格式
- 有问必答，问什么答什么
- 可以适当给出建议，但不要太啰嗦`;

export async function POST(request: Request) {
  const { userInfo, question, history } = await request.json();

  if (!userInfo && !question) {
    return Response.json({ error: '请提供个人信息或问题' }, { status: 400 });
  }

  const aiService = createAIService();
  const encoder = new TextEncoder();

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (history && Array.isArray(history)) {
    for (const msg of history) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  let userMessage = '';
  if (userInfo) {
    const parts: string[] = [];
    if (userInfo.undergraduate) parts.push(`本科院校：${userInfo.undergraduate}`);
    if (userInfo.major) parts.push(`本科专业：${userInfo.major}`);
    if (userInfo.gpa) parts.push(`成绩排名/GPA：${userInfo.gpa}`);
    if (userInfo.targetDegree) parts.push(`目标学位类型：${userInfo.targetDegree}`);
    if (userInfo.targetMajor) parts.push(`意向专业方向：${userInfo.targetMajor}`);
    if (userInfo.targetCity) parts.push(`意向城市/地区：${userInfo.targetCity}`);
    if (userInfo.careerGoal) parts.push(`职业规划：${userInfo.careerGoal}`);
    if (userInfo.other) parts.push(`其他信息：${userInfo.other}`);
    userMessage = `请根据我的情况帮我推荐考研院校：\n${parts.join('\n')}`;
  } else if (question) {
    userMessage = question;
  }

  messages.push({ role: 'user', content: userMessage });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of aiService.stream(messages)) {
          if (chunk.error) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: chunk.error })}\n\n`));
          } else if (chunk.content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'AI服务异常';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
