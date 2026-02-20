import { Agent, Team } from "../types";

export const mockAgents: Agent[] = [
  {
    id: "agent-1",
    name: "数据分析师",
    avatar: "📊",
    title: "高级数据分析专家",
    skills: ["数据分析", "可视化", "报告生成", "Excel", "Python"],
    description: "擅长从复杂数据中提取洞察，生成专业的数据报告和可视化图表。精通统计分析和预测建模。",
    baseModel: "GPT-4",
    capabilities: [
      { label: "数据处理", value: 95 },
      { label: "统计分析", value: 90 },
      { label: "可视化", value: 85 },
      { label: "报告撰写", value: 88 },
    ],
    hired: true,
    hireCount: 1234,
  },
  {
    id: "agent-2",
    name: "文案专员",
    avatar: "✍️",
    title: "资深内容创作者",
    skills: ["内容创作", "SEO优化", "品牌文案", "社交媒体"],
    description: "精通各类文案创作，从营销文案到技术文档，能根据品牌调性创作吸引人的内容。",
    baseModel: "GPT-4",
    capabilities: [
      { label: "创意写作", value: 92 },
      { label: "SEO优化", value: 87 },
      { label: "品牌理解", value: 90 },
      { label: "文风适配", value: 88 },
    ],
    hired: true,
    hireCount: 2156,
  },
  {
    id: "agent-3",
    name: "UI设计师",
    avatar: "🎨",
    title: "创意视觉设计师",
    skills: ["界面设计", "视觉设计", "品牌设计", "插画"],
    description: "专注于创造美观且实用的用户界面，擅长品牌视觉系统和营销素材设计。",
    baseModel: "DALL-E 3",
    capabilities: [
      { label: "视觉创意", value: 93 },
      { label: "用户体验", value: 85 },
      { label: "品牌设计", value: 90 },
      { label: "色彩搭配", value: 92 },
    ],
    hired: false,
    hireCount: 1789,
  },
  {
    id: "agent-4",
    name: "危机公关专家",
    avatar: "🛡️",
    title: "公关与危机管理顾问",
    skills: ["危机管理", "公关传播", "舆情分析", "媒体关系"],
    description: "专业处理各类公关危机，擅长制定应对策略，撰写官方声明，维护品牌形象。",
    baseModel: "GPT-4",
    capabilities: [
      { label: "危机处理", value: 96 },
      { label: "策略规划", value: 90 },
      { label: "文案撰写", value: 88 },
      { label: "舆情分析", value: 92 },
    ],
    hired: false,
    hireCount: 876,
  },
  {
    id: "agent-5",
    name: "产品经理",
    avatar: "🎯",
    title: "资深产品策划专家",
    skills: ["需求分析", "产品规划", "用户研究", "项目管理"],
    description: "精通产品全生命周期管理，从需求分析到产品上线，擅长平衡用户需求与商业目标。",
    baseModel: "GPT-4",
    capabilities: [
      { label: "需求分析", value: 91 },
      { label: "产品策划", value: 93 },
      { label: "用户洞察", value: 89 },
      { label: "项目协调", value: 87 },
    ],
    hired: true,
    hireCount: 1543,
  },
  {
    id: "agent-6",
    name: "代码工程师",
    avatar: "💻",
    title: "全栈开发工程师",
    skills: ["前端开发", "后端开发", "数据库", "API设计"],
    description: "掌握现代Web技术栈，能够快速实现功能原型和完整的应用系统。",
    baseModel: "GPT-4",
    capabilities: [
      { label: "编码能力", value: 94 },
      { label: "架构设计", value: 88 },
      { label: "问题解决", value: 92 },
      { label: "代码质量", value: 90 },
    ],
    hired: true,
    hireCount: 2341,
  },
  {
    id: "agent-7",
    name: "主编审核",
    avatar: "📝",
    title: "内容质量把关专家",
    skills: ["内容审核", "质量把控", "风格统一", "错误检查"],
    description: "严格把控内容质量，确保输出符合标准，发现并纠正各类错误和不当表述。",
    baseModel: "GPT-4",
    capabilities: [
      { label: "质量把控", value: 95 },
      { label: "细节审查", value: 93 },
      { label: "逻辑判断", value: 90 },
      { label: "专业度", value: 91 },
    ],
    hired: true,
    hireCount: 1654,
  },
  {
    id: "agent-8",
    name: "海报设计师",
    avatar: "🖼️",
    title: "视觉营销设计师",
    skills: ["海报设计", "视觉传达", "排版设计", "创意表达"],
    description: "专注于营销海报和宣传物料设计，擅长用视觉语言传达品牌信息和营销卖点。",
    baseModel: "Midjourney",
    capabilities: [
      { label: "视觉冲击", value: 94 },
      { label: "创意表达", value: 91 },
      { label: "排版设计", value: 89 },
      { label: "品牌表现", value: 90 },
    ],
    hired: true,
    hireCount: 1432,
  },
];

export const mockTeams: Team[] = [
  {
    id: "team-1",
    name: "财报组",
    description: "自动化生成每日财务报告，包括数据分析、文案撰写和审核",
    agents: [
      mockAgents[0], // 数据分析师
      mockAgents[1], // 文案专员
      mockAgents[6], // 主编审核
    ],
    workflowType: "sequential",
    scenario: "财务报告",
    thumbnail: "📊",
  },
  {
    id: "team-2",
    name: "内容创作团队",
    description: "多角色并行创作，适合需要多个创意方案的场景",
    agents: [
      mockAgents[1], // 文案专员
      mockAgents[2], // UI设计师
      mockAgents[4], // 产品经理
    ],
    workflowType: "parallel",
    scenario: "营销内容",
    thumbnail: "✍️",
  },
  {
    id: "team-3",
    name: "质量保障组",
    description: "执行+审核双重保障，确保输出质量",
    agents: [
      mockAgents[1], // 文案专员
      mockAgents[6], // 主编审核
    ],
    workflowType: "adversarial",
    scenario: "内容质量",
    thumbnail: "✅",
  },
];
