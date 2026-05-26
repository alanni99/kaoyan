export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIStreamChunk {
  content: string;
  error?: string;
}

export abstract class AIService {
  abstract stream(messages: AIMessage[]): AsyncGenerator<AIStreamChunk>;
}

export class MockAIService extends AIService {
  private recommendations: any;
  private majorSuggestions: any;

  constructor() {
    super();
    this.recommendations = this.generateRecommendations.bind(this);
    this.majorSuggestions = this.getMajorSuggestions.bind(this);
  }

  private generateRecommendations(userInfo: any) {
    const { undergraduate, major, gpa, targetDegree, targetMajor, targetCity, careerGoal } = userInfo || {};

    const mockUniversities = [
      { id: 1, name: '清华大学', type: '985', level: '综合', province: '北京市', city: '北京市', ranking: 1 },
      { id: 2, name: '北京大学', type: '985', level: '综合', province: '北京市', city: '北京市', ranking: 2 },
      { id: 3, name: '浙江大学', type: '985', level: '综合', province: '浙江省', city: '杭州市', ranking: 3 },
      { id: 4, name: '上海交通大学', type: '985', level: '综合', province: '上海市', city: '上海市', ranking: 4 },
      { id: 5, name: '复旦大学', type: '985', level: '综合', province: '上海市', city: '上海市', ranking: 5 },
      { id: 6, name: '南京大学', type: '985', level: '综合', province: '江苏省', city: '南京市', ranking: 6 },
      { id: 7, name: '中国科学技术大学', type: '985', level: '理工', province: '安徽省', city: '合肥市', ranking: 7 },
      { id: 8, name: '华中科技大学', type: '985', level: '综合', province: '湖北省', city: '武汉市', ranking: 8 },
      { id: 9, name: '武汉大学', type: '985', level: '综合', province: '湖北省', city: '武汉市', ranking: 9 },
      { id: 10, name: '西安交通大学', type: '985', level: '综合', province: '陕西省', city: '西安市', ranking: 10 },
      { id: 11, name: '哈尔滨工业大学', type: '985', level: '理工', province: '黑龙江省', city: '哈尔滨市', ranking: 13 },
      { id: 12, name: '东南大学', type: '985', level: '综合', province: '江苏省', city: '南京市', ranking: 12 },
      { id: 13, name: '中山大学', type: '985', level: '综合', province: '广东省', city: '广州市', ranking: 11 },
      { id: 14, name: '四川大学', type: '985', level: '综合', province: '四川省', city: '成都市', ranking: 14 },
      { id: 15, name: '吉林大学', type: '985', level: '综合', province: '吉林省', city: '长春市', ranking: 27 },
      { id: 16, name: '山东大学', type: '985', level: '综合', province: '山东省', city: '济南市', ranking: 22 },
      { id: 17, name: '中南大学', type: '985', level: '综合', province: '湖南省', city: '长沙市', ranking: 15 },
      { id: 18, name: '西安电子科技大学', type: '211', level: '理工', province: '陕西省', city: '西安市', ranking: 24 },
      { id: 19, name: '北京邮电大学', type: '211', level: '理工', province: '北京市', city: '北京市', ranking: 63 },
      { id: 20, name: '中央财经大学', type: '211', level: '财经', province: '北京市', city: '北京市', ranking: 44 },
      { id: 21, name: '中国政法大学', type: '211', level: '政法', province: '北京市', city: '北京市', ranking: 46 },
      { id: 22, name: '北京师范大学', type: '985', level: '师范', province: '北京市', city: '北京市', ranking: 19 },
      { id: 23, name: '南京航空航天大学', type: '211', level: '理工', province: '江苏省', city: '南京市', ranking: 35 },
      { id: 24, name: '南京理工大学', type: '211', level: '理工', province: '江苏省', city: '南京市', ranking: 37 },
      { id: 25, name: '苏州大学', type: '211', level: '综合', province: '江苏省', city: '苏州市', ranking: 43 },
      { id: 26, name: '华东师范大学', type: '985', level: '师范', province: '上海市', city: '上海市', ranking: 29 },
      { id: 27, name: '同济大学', type: '985', level: '综合', province: '上海市', city: '上海市', ranking: 17 },
      { id: 28, name: '华东理工大学', type: '211', level: '理工', province: '上海市', city: '上海市', ranking: 45 },
      { id: 29, name: '上海大学', type: '211', level: '综合', province: '上海市', city: '上海市', ranking: 54 },
      { id: 30, name: '东华大学', type: '211', level: '理工', province: '上海市', city: '上海市', ranking: 68 },
      { id: 31, name: '南开大学', type: '985', level: '综合', province: '天津市', city: '天津市', ranking: 20 },
      { id: 32, name: '天津大学', type: '985', level: '理工', province: '天津市', city: '天津市', ranking: 21 },
      { id: 33, name: '大连理工大学', type: '985', level: '理工', province: '辽宁省', city: '大连市', ranking: 28 },
      { id: 34, name: '东北大学', type: '985', level: '理工', province: '辽宁省', city: '沈阳市', ranking: 39 },
      { id: 35, name: '哈尔滨工程大学', type: '211', level: '理工', province: '黑龙江省', city: '哈尔滨市', ranking: 49 },
      { id: 36, name: '山东大学威海分校', type: '985', level: '综合', province: '山东省', city: '威海市', ranking: 90 },
      { id: 37, name: '中国海洋大学', type: '985', level: '综合', province: '山东省', city: '青岛市', ranking: 57 },
      { id: 38, name: '南京师范大学', type: '211', level: '师范', province: '江苏省', city: '南京市', ranking: 52 },
      { id: 39, name: '南京农业大学', type: '211', level: '农林', province: '江苏省', city: '南京市', ranking: 42 },
      { id: 40, name: '河海大学', type: '211', level: '理工', province: '江苏省', city: '南京市', ranking: 60 },
      { id: 41, name: '江南大学', type: '211', level: '综合', province: '江苏省', city: '无锡市', ranking: 66 },
      { id: 42, name: '南京林业大学', type: '双一流', level: '农林', province: '江苏省', city: '南京市', ranking: 88 },
      { id: 43, name: '南京信息工程大学', type: '双一流', level: '理工', province: '江苏省', city: '南京市', ranking: 97 },
      { id: 44, name: '浙江工业大学', type: '双一流', level: '理工', province: '浙江省', city: '杭州市', ranking: 70 },
      { id: 45, name: '宁波大学', type: '双一流', level: '综合', province: '浙江省', city: '宁波市', ranking: 84 },
      { id: 46, name: '安徽大学', type: '211', level: '综合', province: '安徽省', city: '合肥市', ranking: 95 },
      { id: 47, name: '合肥工业大学', type: '211', level: '理工', province: '安徽省', city: '合肥市', ranking: 79 },
      { id: 48, name: '厦门大学', type: '985', level: '综合', province: '福建省', city: '厦门市', ranking: 26 },
      { id: 49, name: '福州大学', type: '211', level: '理工', province: '福建省', city: '福州市', ranking: 73 },
      { id: 50, name: '河南大学', type: '双一流', level: '综合', province: '河南省', city: '开封市', ranking: 72 },
      { id: 51, name: '南昌大学', type: '211', level: '综合', province: '江西省', city: '南昌市', ranking: 75 },
      { id: 52, name: '中国农业大学', type: '985', level: '农林', province: '北京市', city: '北京市', ranking: 32 },
      { id: 53, name: '北京理工大学', type: '985', level: '理工', province: '北京市', city: '北京市', ranking: 18 },
      { id: 54, name: '北京航空航天大学', type: '985', level: '理工', province: '北京市', city: '北京市', ranking: 16 },
      { id: 55, name: '中国人民大学', type: '985', level: '综合', province: '北京市', city: '北京市', ranking: 25 },
      { id: 56, name: '对外经济贸易大学', type: '211', level: '财经', province: '北京市', city: '北京市', ranking: 76 },
      { id: 57, name: '北京外国语大学', type: '211', level: '语言', province: '北京市', city: '北京市', ranking: 80 },
      { id: 58, name: '中央民族大学', type: '985', level: '民族', province: '北京市', city: '北京市', ranking: 100 },
      { id: 59, name: '北京交通大学', type: '211', level: '理工', province: '北京市', city: '北京市', ranking: 41 },
      { id: 60, name: '北京科技大学', type: '211', level: '理工', province: '北京市', city: '北京市', ranking: 36 },
      { id: 61, name: '华南理工大学', type: '985', level: '理工', province: '广东省', city: '广州市', ranking: 23 },
      { id: 62, name: '暨南大学', type: '211', level: '综合', province: '广东省', city: '广州市', ranking: 47 },
      { id: 63, name: '华南师范大学', type: '211', level: '师范', province: '广东省', city: '广州市', ranking: 58 },
      { id: 64, name: '华南农业大学', type: '双一流', level: '农林', province: '广东省', city: '广州市', ranking: 78 },
      { id: 65, name: '广东工业大学', type: '双一流', level: '理工', province: '广东省', city: '广州市', ranking: 91 },
      { id: 66, name: '深圳大学', type: '双一流', level: '综合', province: '广东省', city: '深圳市', ranking: 67 },
      { id: 67, name: '南方科技大学', type: '双一流', level: '理工', province: '广东省', city: '深圳市', ranking: 69 },
      { id: 68, name: '汕头大学', type: '双一流', level: '综合', province: '广东省', city: '汕头市', ranking: 104 },
      { id: 69, name: '广州大学', type: '双一流', level: '综合', province: '广东省', city: '广州市', ranking: 102 },
      { id: 70, name: '五邑大学', type: '公办', level: '综合', province: '广东省', city: '江门市', ranking: 186 },
      { id: 71, name: '广东外语外贸大学', type: '双一流', level: '语言', province: '广东省', city: '广州市', ranking: 138 },
      { id: 72, name: '南方医科大学', type: '双一流', level: '医药', province: '广东省', city: '广州市', ranking: 81 },
      { id: 73, name: '广州医科大学', type: '双一流', level: '医药', province: '广东省', city: '广州市', ranking: 108 },
      { id: 74, name: '深圳技术大学', type: '公办', level: '理工', province: '广东省', city: '深圳市', ranking: 225 },
      { id: 75, name: '广东财经大学', type: '公办', level: '财经', province: '广东省', city: '广州市', ranking: 181 },
      { id: 76, name: '重庆大学', type: '985', level: '综合', province: '重庆市', city: '重庆市', ranking: 30 },
      { id: 77, name: '西南大学', type: '211', level: '综合', province: '重庆市', city: '重庆市', ranking: 38 },
      { id: 78, name: '湖南大学', type: '985', level: '综合', province: '湖南省', city: '长沙市', ranking: 31 },
      { id: 79, name: '湖南师范大学', type: '211', level: '师范', province: '湖南省', city: '长沙市', ranking: 61 },
      { id: 80, name: '湘潭大学', type: '双一流', level: '综合', province: '湖南省', city: '湘潭市', ranking: 89 },
    ];

    let recommendations = {
      sprint: [] as any[],
      safe: [] as any[],
      backup: [] as any[]
    };

    let filteredUnis = [...mockUniversities];

    if (targetCity) {
      const cityMatch = filteredUnis.filter(u => 
        u.city.includes(targetCity) || u.province.includes(targetCity)
      );
      if (cityMatch.length > 0) {
        filteredUnis = cityMatch;
      }
    } else if (undergraduate?.includes('广州') || undergraduate?.includes('广东')) {
      const guangdongMatch = filteredUnis.filter(u => 
        u.province.includes('广东省')
      );
      if (guangdongMatch.length > 0) {
        filteredUnis = guangdongMatch;
      }
    }

    const isTopUndergraduate = undergraduate?.includes('985') || undergraduate?.includes('清华') || undergraduate?.includes('北大');
    const isGoodUndergraduate = isTopUndergraduate || undergraduate?.includes('211');
    const isHighGPA = gpa?.includes('前10%') || gpa?.includes('3.8') || gpa?.includes('4.0');
    const isGoodGPA = isHighGPA || gpa?.includes('前30%') || gpa?.includes('3.5');
    const isAverageGPA = !isHighGPA && !isGoodGPA;

    if (isTopUndergraduate && isHighGPA) {
      recommendations.sprint = filteredUnis.filter(u => u.type === '985' && u.ranking <= 5).slice(0, 2);
      recommendations.safe = filteredUnis.filter(u => u.type === '985' && u.ranking > 5 && u.ranking <= 20).slice(0, 2);
      recommendations.backup = filteredUnis.filter(u => (u.type === '985' && u.ranking > 20) || u.type === '211').slice(0, 2);
    } else if (isTopUndergraduate || (isGoodUndergraduate && isHighGPA)) {
      recommendations.sprint = filteredUnis.filter(u => u.type === '985' && u.ranking <= 15).slice(0, 2);
      recommendations.safe = filteredUnis.filter(u => (u.type === '985' && u.ranking > 15) || u.type === '211').slice(0, 2);
      recommendations.backup = filteredUnis.filter(u => u.type === '211').slice(0, 2);
    } else if (isGoodUndergraduate || isGoodGPA) {
      recommendations.sprint = filteredUnis.filter(u => u.type === '985' && u.ranking > 10 && u.ranking <= 30).slice(0, 2);
      if (recommendations.sprint.length === 0) {
        recommendations.sprint = filteredUnis.filter(u => u.type === '211' && u.ranking <= 50).slice(0, 2);
      }
      recommendations.safe = filteredUnis.filter(u => u.type === '211').slice(0, 2);
      recommendations.backup = filteredUnis.filter(u => u.type === '双一流' || u.type === '211').slice(0, 2);
    } else {
      recommendations.sprint = filteredUnis.filter(u => u.type === '双一流' && u.ranking <= 100).slice(0, 2);
      if (recommendations.sprint.length === 0) {
        recommendations.sprint = filteredUnis.filter(u => u.type === '211' && u.ranking > 50).slice(0, 2);
      }
      recommendations.safe = filteredUnis.filter(u => u.type === '双一流').slice(0, 2);
      recommendations.backup = filteredUnis.filter(u => u.type === '公办' || u.type === '双一流').slice(0, 2);
    }

    if (recommendations.sprint.length === 0) {
      recommendations.sprint = filteredUnis.filter(u => u.type === '双一流').slice(0, 2);
    }
    if (recommendations.safe.length === 0) {
      recommendations.safe = filteredUnis.filter(u => u.type === '公办').slice(0, 2);
    }
    if (recommendations.backup.length === 0) {
      recommendations.backup = filteredUnis.slice(0, 2);
    }

    return recommendations;
  }

  private getMajorSuggestions(targetMajor: string) {
    if (targetMajor?.includes('计算机')) {
      return [
        { name: '计算机科学与技术', code: '081200', type: '学硕' },
        { name: '电子信息（计算机技术）', code: '085400', type: '专硕' },
        { name: '人工智能', code: '085410', type: '专硕' }
      ];
    } else if (targetMajor?.includes('金融')) {
      return [
        { name: '金融学', code: '020204', type: '学硕' },
        { name: '金融', code: '025100', type: '专硕' }
      ];
    } else if (targetMajor?.includes('法')) {
      return [
        { name: '法学', code: '030100', type: '学硕' },
        { name: '法律（非法学）', code: '035101', type: '专硕' }
      ];
    } else if (targetMajor?.includes('教育')) {
      return [
        { name: '教育学', code: '040100', type: '学硕' },
        { name: '高等教育学', code: '040106', type: '学硕' }
      ];
    } else {
      return [
        { name: '计算机科学与技术', code: '081200', type: '学硕' },
        { name: '电子信息', code: '085400', type: '专硕' }
      ];
    }
  }

  async *stream(messages: AIMessage[]): AsyncGenerator<AIStreamChunk> {
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    
    let userInfo: any = null;
    let question: string | null = null;

    if (userMessage.includes('请根据我的情况帮我推荐考研院校') || userMessage.includes('本科院校')) {
      const extractValue = (key: string) => {
        const regex = new RegExp(`${key}：([^\\n]+)`, 'g');
        const match = userMessage.match(regex);
        if (match) {
          return match[0].replace(`${key}：`, '');
        }
        return '';
      };
      
      userInfo = {
        undergraduate: extractValue('本科院校'),
        major: extractValue('本科专业'),
        gpa: extractValue('成绩排名/GPA') || extractValue('成绩/GPA'),
        targetDegree: extractValue('目标学位类型'),
        targetMajor: extractValue('意向专业方向'),
        targetCity: extractValue('意向城市/地区'),
        careerGoal: extractValue('职业规划'),
        other: extractValue('其他信息'),
      };
    } else {
      question = userMessage;
    }

    let response = '';

    if (userInfo && (userInfo.undergraduate || userInfo.major || userInfo.targetCity)) {
      const { undergraduate, major, gpa, targetDegree, targetMajor, targetCity, careerGoal } = userInfo;
      
      const recommendations = this.generateRecommendations(userInfo);
      const majorSuggestions = this.getMajorSuggestions(targetMajor || major || '');

      response = `# 🎓 考研智能择校建议\n\n`;
      
      response += `## 🎯 学生情况分析\n\n`;
      response += `根据您提供的信息：\n`;
      if (undergraduate) response += `- **本科院校**：${undergraduate}\n`;
      if (major) response += `- **本科专业**：${major}\n`;
      if (gpa) response += `- **成绩情况**：${gpa}\n`;
      if (targetDegree) response += `- **目标学位**：${targetDegree}\n`;
      if (targetMajor) response += `- **意向专业**：${targetMajor}\n`;
      if (targetCity) response += `- **意向城市**：${targetCity}\n`;
      if (careerGoal) response += `- **职业规划**：${careerGoal}\n\n`;

      response += `## 📚 学硕/专硕建议\n\n`;
      if (careerGoal?.includes('科研') || careerGoal?.includes('读博') || careerGoal?.includes('深造')) {
        response += `基于您的职业规划偏向**学术研究**，建议优先考虑**学硕**，为后续读博深造打下坚实基础。学硕更注重理论研究和学术能力培养，适合有志于从事科研工作的同学。\n\n`;
      } else {
        response += `基于您的职业规划偏向**就业导向**，建议优先考虑**专硕**。专硕更注重实践能力培养，课程设置与行业需求紧密结合，实习机会较多，毕业后就业竞争力强。当然，如果您有名校情结，学硕也是不错的选择。\n\n`;
      }

      response += `## 🏫 推荐院校\n\n`;

      if (recommendations.sprint.length > 0) {
        response += `### 🏆 冲刺院校（挑战一下）\n\n`;
        recommendations.sprint.forEach((uni: any) => {
          response += `- **${uni.name}** (${uni.type}/${uni.level})\n`;
          response += `  - 所在地区：${uni.province} ${uni.city}\n`;
          response += `  - 软科排名：第${uni.ranking}名\n`;
          response += `  - 推荐理由：${uni.type}名校，专业实力强，虽然竞争激烈，但您的背景有冲刺潜力！\n\n`;
        });
      }

      if (recommendations.safe.length > 0) {
        response += `### ✅ 稳妥院校（把握较大）\n\n`;
        recommendations.safe.forEach((uni: any) => {
          response += `- **${uni.name}** (${uni.type}/${uni.level})\n`;
          response += `  - 所在地区：${uni.province} ${uni.city}\n`;
          response += `  - 软科排名：第${uni.ranking}名\n`;
          response += `  - 推荐理由：学校实力强，竞争难度适中，与您的背景匹配度高，上岸概率较大。\n\n`;
        });
      }

      if (recommendations.backup.length > 0) {
        response += `### 🛡️ 保底院校（稳妥选择）\n\n`;
        recommendations.backup.forEach((uni: any) => {
          response += `- **${uni.name}** (${uni.type}/${uni.level})\n`;
          response += `  - 所在地区：${uni.province} ${uni.city}\n`;
          response += `  - 软科排名：第${uni.ranking}名\n`;
          response += `  - 推荐理由：学校口碑好，专业实力不俗，竞争相对较小，可以作为稳妥的保底选择。\n\n`;
        });
      }

      response += `## 📋 专业方向建议\n\n`;
      majorSuggestions.forEach((m: any) => {
        response += `- **${m.name}** (${m.code}) - ${m.type}\n`;
      });
      response += `\n建议优先选择与本科专业相关或相近的方向，跨考需谨慎评估难度。\n\n`;

      response += `## 📅 备考建议\n\n`;
      response += `### 基础阶段（3-6月）\n`;
      response += `- 数学/专业课：过一遍教材，打牢基础\n`;
      response += `- 英语：背单词，做阅读真题\n`;
      response += `- 政治：可以先不急，暑期开始即可\n\n`;
      
      response += `### 强化阶段（7-9月）\n`;
      response += `- 数学：大量刷题，总结解题方法\n`;
      response += `- 专业课：研究历年真题，掌握重点\n`;
      response += `- 英语：真题精练，总结出题规律\n`;
      response += `- 政治：开始复习，刷选择题\n\n`;
      
      response += `### 冲刺阶段（10-12月）\n`;
      response += `- 模拟考试，查漏补缺\n`;
      response += `- 背诵政治主观题\n`;
      response += `- 保持良好心态，注意作息\n\n`;
      
      response += `---\n\n`;
      response += `*以上建议仅供参考，实际报考时请结合最新招生简章和自身情况综合考虑。祝您考研顺利！🎊*`;

    } else if (question) {
      response = `您好！感谢您的提问。\n\n关于"${question}"，我建议您：\n\n`;
      response += `1. 先了解自己的实际情况和目标\n`;
      response += `2. 查看目标院校的招生简章和历年分数线\n`;
      response += `3. 结合自身情况制定合理的备考计划\n\n`;
      response += `建议您使用页面上方的"填写你的信息"表单，提供更详细的个人信息（本科院校、专业、成绩、目标专业、意向城市等），我可以为您提供更精准的择校建议！`;
    }

    const chunks = response.split('');
    for (const chunk of chunks) {
      yield { content: chunk };
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  }
}

export class ZhipuAIService extends AIService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'GLM-4-Flash') {
    super();
    this.apiKey = apiKey;
    this.model = model;
  }

  async *stream(messages: AIMessage[]): AsyncGenerator<AIStreamChunk> {
    try {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: true,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield { content };
              }
            } catch {
              continue;
            }
          }
        }
      }
    } catch (error) {
      yield { content: '', error: error instanceof Error ? error.message : 'AI服务异常' };
    }
  }
}

export class QwenAIService extends AIService {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'qwen-turbo') {
    super();
    this.apiKey = apiKey;
    this.model = model;
  }

  async *stream(messages: AIMessage[]): AsyncGenerator<AIStreamChunk> {
    try {
      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: true,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield { content };
              }
            } catch {
              continue;
            }
          }
        }
      }
    } catch (error) {
      yield { content: '', error: error instanceof Error ? error.message : 'AI服务异常' };
    }
  }
}

export class FreeTheAIService extends AIService {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(apiKey: string, model: string = 'bbg/moonshotai/Kimi-K2.5', baseURL: string = 'https://api.freetheai.xyz/v1') {
    super();
    this.apiKey = apiKey;
    this.model = model;
    this.baseURL = baseURL;
  }

  async *stream(messages: AIMessage[]): AsyncGenerator<AIStreamChunk> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: true,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                yield { content: '', error: parsed.error.message };
                return;
              }
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield { content };
              }
            } catch {
              continue;
            }
          }
        }
      }
    } catch (error) {
      yield { content: '', error: error instanceof Error ? error.message : 'AI服务异常' };
    }
  }
}

export function createAIService(): AIService {
  const apiType = process.env.AI_API_TYPE || 'mock';
  const apiKey = process.env.AI_API_KEY || '';
  const model = process.env.AI_MODEL || '';
  const baseURL = process.env.AI_BASE_URL || '';

  console.log('=== AI服务调试信息 ===');
  console.log('AI_API_TYPE:', apiType);
  console.log('AI_API_KEY:', apiKey ? '已设置' : '未设置');
  console.log('AI_MODEL:', model);
  console.log('=====================');

  switch (apiType) {
    case 'zhipu':
      if (!apiKey) {
        console.warn('智谱AI API Key未设置，使用模拟服务');
        return new MockAIService();
      }
      return new ZhipuAIService(apiKey, model || 'GLM-4-Flash');
    case 'qwen':
      if (!apiKey) {
        console.warn('通义千问API Key未设置，使用模拟服务');
        return new MockAIService();
      }
      return new QwenAIService(apiKey, model || 'qwen-turbo');
    case 'freetheai':
      if (!apiKey) {
        console.warn('FreeTheAI API Key未设置，使用模拟服务');
        return new MockAIService();
      }
      return new FreeTheAIService(
        apiKey, 
        model || 'bbg/moonshotai/Kimi-K2.5', 
        baseURL || 'https://api.freetheai.xyz/v1'
      );
    default:
      return new MockAIService();
  }
}
