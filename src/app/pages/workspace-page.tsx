import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useLocation } from "react-router";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { 
  Send, 
  Paperclip, 
  Loader2, 
  FileText, 
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Folder,
  File,
  CheckCircle2,
  Clock,
  X,
  TrendingUp,
  Users,
  FileCheck,
  Check,
  History,
  PlusCircle,
  FileX,
  ListChecks,
  Play,
  Circle,
  User,
  Bot,
} from "lucide-react";
import { mockAgents, mockTeams } from "../data/mock-data";
import { mockKnowledgeBase } from "../data/mock-knowledge-base";
import { Message, Agent } from "../types";
import { FileNode } from "../types/knowledge-base";
import { KnowledgeBase } from "../components/knowledge-base";
import { UserInterventionCard } from "../components/user-intervention-card";
import { CartoonAvatar } from "../components/cartoon-avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { Github } from "lucide-react";
import { toast } from "sonner";

/** 对话模块：用户/助手气泡消息 */
export interface DialogueMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinkingSummary?: string[];
  steps?: string[];
}

const mockHistoryTasks = [
  { id: "h1", title: "Q3 竞品财报深度分析", time: "2024-02-20 14:30", status: "已完成" },
  { id: "h2", title: "9月销售复盘报告", time: "2024-02-19 10:15", status: "已完成" },
  { id: "h3", title: "竞品数据清洗入库", time: "2024-02-18 16:00", status: "已完成" },
  { id: "h4", title: "每日新闻摘要推送", time: "2024-02-18 09:20", status: "已中断" },
];

interface WorkingAgent {
  agent: Agent;
  status: "waiting" | "working" | "completed";
  messages: Message[];
}

/** 新任务页空状态：无执行过程，仅展示「想给团队下什么任务」 */
function getEmptyWorkingAgents(): WorkingAgent[] {
  return [
    { agent: mockAgents[0], status: "waiting", messages: [] },
    { agent: mockAgents[1], status: "waiting", messages: [] },
    { agent: mockAgents[6], status: "waiting", messages: [] },
  ];
}

const WAITING_CARD_PEEK = 28; // 后两张卡片露出的宽度（px）

/** 单张等待中卡片的简要条（叠放时后两张露出的部分用） */
function WaitingCardStrip({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/95 px-4 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100">
        <Clock className="size-4 text-orange-600" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-sm text-neutral-900">{name} - 等待中</h4>
        <p className="text-xs text-neutral-500">预计 5 分钟后</p>
      </div>
    </div>
  );
}

/** 单张等待中卡片的完整内容（第一张用）；仅多张时显示展开按钮 */
function WaitingCardFull({
  name,
  onExpand,
  expandLabel,
  isOpen,
  showExpandButton = true,
}: {
  name: string;
  onExpand?: () => void;
  expandLabel?: string;
  isOpen?: boolean;
  showExpandButton?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-orange-200 bg-white p-4 shadow-lg ring-1 ring-orange-100">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
          <Clock className="size-5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-neutral-900">{name} - 等待中</h4>
            <Badge variant="outline" className="bg-white text-xs">
              预计 5 分钟后
            </Badge>
          </div>
          <p className="text-sm text-neutral-600 mb-3">
            等待前序任务完成后进行质量审核和优化建议
          </p>
          <div className="space-y-2">
            <div className="text-xs font-medium text-neutral-700 mb-1">预计工作内容：</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <div className="size-1.5 rounded-full bg-orange-400" />
                <span>审核文案质量与准确性</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <div className="size-1.5 rounded-full bg-orange-400" />
                <span>检查数据引用的正确性</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-600">
                <div className="size-1.5 rounded-full bg-orange-400" />
                <span>提供优化建议和修改意见</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showExpandButton && onExpand && expandLabel !== undefined && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onExpand();
          }}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50/80 py-2 text-xs text-orange-700 transition-colors hover:bg-orange-100"
        >
          {expandLabel}
          <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}

/** 等待中任务堆叠：多张时第一张在上、后两张露边+展开；仅 1 张时无堆叠、无展开按钮 */
function WaitingStackCollapsible({ waitingList }: { waitingList: WorkingAgent[] }) {
  const [open, setOpen] = useState(false);
  const [first, ...rest] = waitingList;
  const restNames = rest.map((wa) => wa.agent.name);
  const peekPx = WAITING_CARD_PEEK;
  const totalPeek = peekPx * 2;

  // 仅 1 项：不堆叠，只显示一张完整卡片，无展开按钮
  if (rest.length === 0) {
    return (
      <WaitingCardFull
        name={first?.agent.name ?? "数据分析师"}
        showExpandButton={false}
      />
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className="relative"
        style={{ paddingRight: open ? 0 : totalPeek, paddingBottom: open ? 0 : totalPeek }}
      >
        {/* 收起时显示：后两张从右下露出的叠层 */}
        {!open && (
          <>
            <div
              className="absolute bottom-0 right-0 z-0 rounded-xl border border-orange-200 bg-orange-50/90 shadow-md"
              style={{ width: `calc(100% - ${totalPeek}px)`, height: 72 }}
            >
              <WaitingCardStrip name={restNames[1] ?? ""} />
            </div>
            <div
              className="absolute z-[1] rounded-xl border border-orange-200 bg-orange-50/95 shadow-lg"
              style={{
                bottom: peekPx,
                right: peekPx,
                width: `calc(100% - ${totalPeek}px)`,
                height: 72,
              }}
            >
              <WaitingCardStrip name={restNames[0] ?? ""} />
            </div>
          </>
        )}
        {/* 第一张完整卡片 */}
        <div className="relative z-[2]">
          <WaitingCardFull
            name={first?.agent.name ?? "数据分析师"}
            onExpand={() => setOpen((o) => !o)}
            expandLabel={open ? "收起" : `展开剩余 ${rest.length} 项`}
            isOpen={open}
            showExpandButton={true}
          />
        </div>
      </div>
      <CollapsibleContent>
        <div className="mt-3 space-y-0 rounded-xl border border-orange-200 bg-orange-50/30 overflow-hidden">
          {rest.map((wa) => (
            <div
              key={wa.agent.id}
              className="flex items-start gap-3 border-t border-orange-200/70 first:border-t-0 p-4 bg-white/80"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
                <Clock className="size-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm text-neutral-900">{wa.agent.name} - 等待中</h4>
                  <Badge variant="outline" className="bg-white text-xs">
                    预计 5 分钟后
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600 mb-3">
                  等待前序任务完成后进行质量审核和优化建议
                </p>
                <div className="space-y-2">
                  <div className="text-xs font-medium text-neutral-700 mb-1">预计工作内容：</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <div className="size-1.5 rounded-full bg-orange-400" />
                      <span>审核文案质量与准确性</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <div className="size-1.5 rounded-full bg-orange-400" />
                      <span>检查数据引用的正确性</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <div className="size-1.5 rounded-full bg-orange-400" />
                      <span>提供优化建议和修改意见</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function WorkspacePage() {
  const { projectId } = useParams();
  const location = useLocation();
  const initialTaskFromHome = (location.state as { taskDescription?: string } | null)?.taskDescription ?? "";
  const isNewTaskFromHome = projectId === "new" && !!initialTaskFromHome;
  const [input, setInput] = useState(initialTaskFromHome);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [knowledgeFiles, setKnowledgeFiles] = useState<FileNode[]>(mockKnowledgeBase);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(!isNewTaskFromHome);
  const [selectedKnowledgeFiles, setSelectedKnowledgeFiles] = useState<Set<string>>(new Set());
  const [historyPopoverOpen, setHistoryPopoverOpen] = useState(false);
  const [historyPanelAnchor, setHistoryPanelAnchor] = useState<{ bottom: number; right: number } | null>(null);
  const historyTriggerRef = useRef<HTMLButtonElement>(null);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(!isNewTaskFromHome);
  const defaultTaskDescription =
    "我要把这篇文章做成视频，请把这篇文章翻译成中文，然后生成风格统一的 100 张分镜图片，使用皮克斯的风格，设计固定的一两个角色，必要时可以用图表。";
  const [dialogueMessages, setDialogueMessages] = useState<DialogueMessage[]>(() => {
    if (!initialTaskFromHome) return [];
    return [
      { id: "d-user-0", role: "user", content: (initialTaskFromHome && initialTaskFromHome.trim()) ? initialTaskFromHome : defaultTaskDescription },
      {
        id: "d-ai-0",
        role: "assistant",
        content: "这里是一个团队 leader 在规划任务的过程。",
        thinkingSummary: ["设计固定的一两个角色", "必要时使用图表"],
        steps: [
          "首先读取文章内容",
          "翻译为中文",
          "规划分镜脚本",
          "生成 100 张图片（可能需要分批进行）",
        ],
      },
    ];
  });

  /** 子代理规划模块：先展示 10s「组建团队、筛选人选」动效，再展示卡片 */
  const hasAssistantPlanMessage = dialogueMessages.some((m) => m.id === "d-ai-0");
  const [showSubagentsPlan, setShowSubagentsPlan] = useState(false);
  useEffect(() => {
    if (!hasAssistantPlanMessage) return;
    const t = setTimeout(() => setShowSubagentsPlan(true), 10000);
    return () => clearTimeout(t);
  }, [hasAssistantPlanMessage]);

  /** 团队确认弹窗：仅用户确认（或 10s 自动确认）后才展示下方 3 张等待卡片 */
  const [teamConfirmed, setTeamConfirmed] = useState(false);
  const [teamConfirmDismissed, setTeamConfirmDismissed] = useState(false);
  const [teamConfirmCountdown, setTeamConfirmCountdown] = useState(10);
  const teamConfirmOpen = showSubagentsPlan && !teamConfirmed && !teamConfirmDismissed;
  useEffect(() => {
    if (!teamConfirmOpen) return;
    setTeamConfirmCountdown(10);
    const interval = setInterval(() => {
      setTeamConfirmCountdown((c) => {
        if (c <= 1) {
          setTeamConfirmed(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [teamConfirmOpen]);

  // Mock data；仅从首页「发布任务」进入新任务页时用空状态+收起侧栏，从别的项目切到 workspace 保持不变
  const team = mockTeams[0];
  const [workingAgents, setWorkingAgents] = useState<WorkingAgent[]>(() =>
    isNewTaskFromHome ? getEmptyWorkingAgents() : ([
    {
      agent: mockAgents[0],
      status: "completed",
      messages: [
        {
          id: "m1",
          agentId: mockAgents[0].id,
          agentName: mockAgents[0].name,
          avatar: mockAgents[0].avatar,
          content: `太好了！用户批准了计划，选择先做MVP验证（暂不考虑费）。让我开开发这款AI功劳架应用。

首先，我需要：

1. 搜索合适的模板

2. 检查是否需要收集API密钥（这个项目使用内置的AI能力，不需要外部API）

好的，模板已经存在。让我先看看现有的项目结构，然后创建数据库表和开发计划。`,
          timestamp: new Date(),
          type: "thinking",
        },
        {
          id: "m1-intervention",
          agentId: mockAgents[0].id,
          agentName: mockAgents[0].name,
          avatar: mockAgents[0].avatar,
          content: "",
          timestamp: new Date(),
          type: "intervention",
          interventionData: {
            title: "启用 GitHub 集成",
            description: "让智能体能够访问你的代码仓库并实现更强大的功能",
            primaryAction: {
              label: "连接 GitHub",
              action: "connect_github",
            },
            secondaryAction: {
              label: "帮助",
              action: "show_help",
            },
          },
        },
        {
          id: "m2",
          agentId: mockAgents[0].id,
          agentName: mockAgents[0].name,
          avatar: mockAgents[0].avatar,
          content: "数据分析完成！本月收入增长15%，支出下降8%。已生成详细报表。",
          timestamp: new Date(),
          type: "result",
        },
        {
          id: "m2-summary",
          agentId: mockAgents[0].id,
          agentName: mockAgents[0].name,
          avatar: mockAgents[0].avatar,
          content: "",
          timestamp: new Date(),
          type: "summary",
        },
      ],
    },
    {
      agent: mockAgents[1],
      status: "working",
      messages: [
        {
          id: "m3",
          agentId: mockAgents[1].id,
          agentName: mockAgents[1].name,
          avatar: mockAgents[1].avatar,
          content: "正在根据数据分析结果撰写财报文案...",
          timestamp: new Date(),
          type: "thinking",
        },
        {
          id: "m3-progress",
          agentId: mockAgents[1].id,
          agentName: mockAgents[1].name,
          avatar: mockAgents[1].avatar,
          content: "",
          timestamp: new Date(),
          type: "progress",
        },
      ],
    },
    {
      agent: mockAgents[6],
      status: "waiting",
      messages: [],
    },
  ]));

  const currentAgent = selectedAgent 
    ? workingAgents.find(wa => wa.agent.id === selectedAgent)
    : workingAgents[0];

  // 合并三个阶段的对话为一条时间线（按阶段顺序再按时间）
  const mergedMessages = useMemo(() => {
    const list: (Message & { _agentIndex: number; _msgIndex: number })[] = [];
    workingAgents.forEach((wa, agentIndex) => {
      wa.messages.forEach((msg, msgIndex) => {
        list.push({ ...msg, _agentIndex: agentIndex, _msgIndex: msgIndex });
      });
    });
    list.sort((a, b) => {
      const ta = a.timestamp?.getTime() ?? 0;
      const tb = b.timestamp?.getTime() ?? 0;
      if (ta !== tb) return ta - tb;
      if (a._agentIndex !== b._agentIndex) return a._agentIndex - b._agentIndex;
      return a._msgIndex - b._msgIndex;
    });
    return list;
  }, [workingAgents]);

  const handleNewTask = () => {
    setInput("");
    setWorkingAgents((prev) =>
      prev.map((wa) => ({ ...wa, messages: [], status: "waiting" as const }))
    );
    toast.success("已开启新任务");
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: DialogueMessage = {
      id: `d-user-${Date.now()}`,
      role: "user",
      content: text,
    };
    const aiMsg: DialogueMessage = {
      id: `d-ai-${Date.now()}`,
      role: "assistant",
      content: "这是一个复杂的任务，需要多个步骤。我会按步骤帮你完成。",
      thinkingSummary: ["理解任务目标", "拆解执行步骤", "规划资源与顺序"],
      steps: [
        "首先分析任务内容与要求",
        "制定执行计划",
        "按计划逐步执行",
        "汇总并交付结果",
      ],
    };
    setDialogueMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="size-4 text-green-600" />;
      case "working":
        return <Loader2 className="size-4 animate-spin text-blue-600" />;
      default:
        return <Clock className="size-4 text-neutral-400" />;
    }
  };

  const artifacts = [
    { id: "1", name: "财务数据分析.xlsx", type: "data", icon: FileText, createdBy: mockAgents[0].name, createdByAvatar: mockAgents[0].avatar, taskTime: "2024-02-20 14:30", taskName: "Q3 竞品财报深度分析" },
    { id: "2", name: "月度报告初稿.docx", type: "document", icon: FileText, createdBy: mockAgents[1].name, createdByAvatar: mockAgents[1].avatar, taskTime: "2024-02-20 14:30", taskName: "Q3 竞品财报深度分析" },
    { id: "3", name: "数据可视化图表.png", type: "image", icon: ImageIcon, createdBy: mockAgents[0].name, createdByAvatar: mockAgents[0].avatar, taskTime: "2024-02-20 14:30", taskName: "Q3 竞品财报深度分析" },
    { id: "4", name: "财报文案v1.pdf", type: "document", icon: FileText, createdBy: mockAgents[1].name, createdByAvatar: mockAgents[1].avatar, taskTime: "2024-02-20 14:30", taskName: "Q3 竞品财报深度分析" },
    { id: "5", name: "9月销售数据汇总.xlsx", type: "data", icon: FileText, createdBy: mockAgents[0].name, createdByAvatar: mockAgents[0].avatar, taskTime: "2024-02-19 10:15", taskName: "9月销售复盘报告" },
    { id: "6", name: "复盘报告.docx", type: "document", icon: FileText, createdBy: mockAgents[1].name, createdByAvatar: mockAgents[1].avatar, taskTime: "2024-02-19 10:15", taskName: "9月销售复盘报告" },
  ];

  type ArtifactItem = (typeof artifacts)[number];
  const artifactsByTask = useMemo(() => {
    const map = new Map<string, { taskTime: string; taskName: string; items: ArtifactItem[] }>();
    for (const a of artifacts) {
      const taskTime = "taskTime" in a ? String(a.taskTime) : "";
      const taskName = "taskName" in a ? String(a.taskName) : "";
      const key = `${taskTime}|${taskName}`;
      if (!map.has(key)) {
        map.set(key, { taskTime, taskName, items: [] });
      }
      map.get(key)!.items.push(a);
    }
    return Array.from(map.values()).sort((x, y) => y.taskTime.localeCompare(x.taskTime));
  }, []);

  const handleFileSelect = (file: FileNode) => {
    console.log("Selected file:", file);
  };

  return (
    <>
    <div className="flex h-full relative">
      {/* 左侧边栏：知识库，与右侧统一的展开/收起，收起后仅保留图标 */}
      <div
        data-module="workspace-knowledge-sidebar"
        className={`flex h-full flex-shrink-0 border-r bg-white transition-[width] duration-200 ${
          showKnowledgeBase ? "w-72" : "w-12"
        }`}
      >
        {showKnowledgeBase ? (
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <KnowledgeBase
              files={knowledgeFiles}
              onFilesChange={setKnowledgeFiles}
              onFileSelect={handleFileSelect}
              selectedFiles={selectedKnowledgeFiles}
              onSelectionChange={setSelectedKnowledgeFiles}
              onClosePanel={() => setShowKnowledgeBase(false)}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowKnowledgeBase(true)}
            className="flex h-full w-12 flex-col items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
            title="展开知识库"
            aria-label="展开知识库"
          >
            <ChevronRight className="size-4" />
          </button>
        )}
      </div>

      {/* Main Content - Chat Area：min-h-0 使 flex 子项可收缩，对话区才能限制在视口内滚动 */}
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Team Header：仅在有对话后展示，新建任务未开始对话时不展示 */}
        {mergedMessages.length > 0 && (
          <div className="border-b bg-white px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
              {/* 左侧：团队信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-semibold text-neutral-900 truncate">{team.name}</h2>
                  <Badge variant="secondary" className="shrink-0">进行中</Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1 sm:line-clamp-2">{team.description}</p>
              </div>

              {/* 右侧：三阶段时间线（已完成 / 进行中 / 等待中） */}
              <div className="flex items-center gap-0 overflow-x-auto pb-1">
                {workingAgents.map((wa, idx) => (
                  <div key={wa.agent.id} className="flex shrink-0 items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`flex size-9 items-center justify-center rounded-full text-sm border-2 ${
                        wa.status === "completed"
                          ? "border-green-500 bg-green-50 text-green-700"
                          : wa.status === "working"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-neutral-200 bg-neutral-50 text-neutral-400"
                      }`}>
                        {wa.status === "completed" ? (
                          <CheckCircle2 className="size-4" />
                        ) : wa.status === "working" ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Clock className="size-4" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-neutral-700 whitespace-nowrap">{wa.agent.name}</span>
                      <span className={`text-[10px] font-medium whitespace-nowrap ${
                        wa.status === "completed"
                          ? "text-green-600"
                          : wa.status === "working"
                            ? "text-blue-600"
                            : "text-neutral-400"
                      }`}>
                        {wa.status === "completed" ? "已完成" : wa.status === "working" ? "进行中" : "等待中"}
                      </span>
                    </div>
                    {idx < workingAgents.length - 1 && (
                      <div className="mx-2 h-0.5 w-8 min-w-[24px] rounded-full bg-neutral-200" aria-hidden />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 对话模块：用户/助手气泡 + 合并三阶段对话时间线 */}
        <ScrollArea data-module="workspace-chat-area" className="min-h-0 flex-1 bg-neutral-50 p-6">
          {mergedMessages.length === 0 && dialogueMessages.length === 0 ? (
            <div data-module="workspace-empty-state" className="flex min-h-full items-center justify-start px-8 pb-[12vh] pt-[22vh]">
              <div className="flex max-w-2xl flex-col items-start text-left">
                <h2 className="text-2xl font-semibold leading-snug text-neutral-900 sm:text-3xl">
                  Boss，您好，
                  <br />
                  想给团队下什么任务？
                </h2>
                <p className="mt-4 text-sm text-neutral-500 sm:text-base">
                  {team.description}
                </p>
                {/* 团队能力：三角色横向排列，图标 + 文案，放在团队描述下方 */}
                <div className="mt-6 flex items-end gap-0">
                  {workingAgents.map((wa, idx) => (
                    <div key={wa.agent.id} className="flex items-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                          <Clock className="size-5" />
                        </div>
                        <span className="text-sm font-medium text-neutral-700">{wa.agent.name}</span>
                      </div>
                      {idx < workingAgents.length - 1 && (
                        <div className="mx-4 w-6 shrink-0 border-t border-neutral-200" aria-hidden />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div data-module="workspace-messages" className="space-y-4">
              {/* 对话模块：用户 / 助手气泡（参考视频分镜页） */}
              {dialogueMessages.map((msg) =>
                msg.role === "user" ? (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-neutral-200/80 px-4 py-3 text-sm text-neutral-800">
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex gap-3">
                    <CartoonAvatar size={32} className="shrink-0" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="rounded-2xl border border-neutral-200/80 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
                        {msg.thinkingSummary && msg.thinkingSummary.length > 0 && (
                          <Collapsible defaultOpen>
                            <CollapsibleTrigger className="flex w-full items-center justify-between py-1 text-left font-medium text-neutral-700">
                              <span className="flex flex-col items-start gap-0.5">
                                <span>思考已完成</span>
                                <span className="text-xs font-normal text-neutral-500">这里是任务拆解</span>
                              </span>
                              <ChevronDown className="size-4 shrink-0 text-neutral-500" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <ul className="mt-2 space-y-1 border-t border-neutral-100 pt-2 text-sm text-neutral-600">
                                {msg.thinkingSummary.map((s, i) => (
                                  <li key={i}>{s}</li>
                                ))}
                              </ul>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                        {msg.steps && msg.steps.length > 0 && (
                          <div className="mt-3">
                            <p className="mb-2 font-medium text-neutral-800">这是一个复杂的任务，需要多个步骤：</p>
                            <ol className="list-inside list-decimal space-y-1 text-sm text-neutral-600">
                              {msg.steps.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        <p className="mt-3 border-t border-neutral-100 pt-3 text-neutral-700">{msg.content}</p>
                      </div>
                      {/* 任务读取模块：层级列表，参考图片样式 */}
                      {msg.id === "d-ai-0" && (
                        <div
                          data-module="workspace-task-reading"
                          className="rounded-2xl border border-neutral-200/80 bg-white px-4 py-3 shadow-sm"
                        >
                          <div className="space-y-0">
                            {[
                              { icon: FileX, text: "访问网页失败，这里是读取任务的文件", indent: false },
                              { icon: ListChecks, text: "读取待办清单", indent: false },
                              { icon: Circle, text: "使用 Shell 或 Python 请求网页", indent: true },
                              { icon: Play, text: "运行终端 Download Paul Graham article", indent: false },
                              { icon: ListChecks, text: "编写待办清单", indent: false },
                              { icon: Circle, text: "Python 读取 HTML 并翻译", indent: true },
                              { icon: Play, text: "运行 Python 代码", indent: false },
                              { icon: Circle, text: "多子代理并行翻译与分镜", indent: true },
                            ].map((item, i) => {
                              const Icon = item.icon;
                              return (
                                <div
                                  key={i}
                                  className={`flex cursor-pointer items-center gap-3 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 ${item.indent ? "border-l-2 border-dashed border-neutral-200 pl-5 ml-2" : ""}`}
                                >
                                  <Icon
                                    className={`shrink-0 text-neutral-400 ${item.indent ? "size-3.5" : "size-4"}`}
                                  />
                                  <span className="min-w-0 flex-1">{item.text}</span>
                                  <ChevronRight className="size-4 shrink-0 text-neutral-400" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {/* 子代理规划：前 10s 显示「组建团队、筛选人选」动效，之后展示说明+卡片 */}
                      {msg.id === "d-ai-0" && (
                        <>
                          {!showSubagentsPlan ? (
                            <div
                              data-module="workspace-subagents-plan-thinking"
                              className="rounded-2xl border border-neutral-200/80 bg-gradient-to-r from-sky-50/60 to-white px-4 py-4 shadow-sm ring-1 ring-neutral-100/80"
                            >
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-3">
                                  <CartoonAvatar size={44} className="animate-avatar-thinking ring-2 ring-sky-200/60 ring-offset-2" />
                                  <div>
                                    <p className="text-sm font-medium text-neutral-800">正在组建团队，筛选人选</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">逐个评估并挑选合适的人选…</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-full bg-white/80 pl-3 pr-2 py-1.5 shadow-inner border border-neutral-100">
                                  <Users className="size-3.5 text-neutral-400 shrink-0" aria-hidden />
                                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 whitespace-nowrap">筛选人选</span>
                                  <div className="relative flex h-10 w-[136px] items-center gap-2">
                                    <div
                                      className="subagents-carousel-selector absolute left-0 top-1/2 size-10 -translate-y-1/2 rounded-full border-2 border-sky-400 bg-sky-100/50"
                                      aria-hidden
                                    />
                                    {[1, 2, 3].map((i) => (
                                      <div key={i} className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center" title="候选人">
                                        <CartoonAvatar size={28} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="mb-2 text-sm text-neutral-700">
                                文章很长，约有 66,000 字符。让我创建专门的子代理来并行处理翻译和图片生成任务。
                              </p>
                              <div
                                data-module="workspace-subagents-plan"
                                className="rounded-2xl border border-neutral-200/80 bg-white px-4 py-3 shadow-sm"
                              >
                                <div className="space-y-0">
                                {[
                                  { type: "assistant" as const, label: "创建助手", name: "translator" },
                                  { type: "assistant" as const, label: "创建助手", name: "Storyboard Planner" },
                                  { type: "assistant" as const, label: "创建助手", name: "Image Generator" },
                                  { type: "task" as const, text: "派发翻译任务并完整传递文章" },
                                ].map((item, i) => (
                                  <div
                                    key={i}
                                    className={`flex cursor-pointer items-center gap-3 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 ${i < 3 ? "border-l-2 border-dashed border-neutral-200 pl-5 ml-2" : ""}`}
                                  >
                                    {item.type === "assistant" ? (
                                      <>
                                        <User className="size-4 shrink-0 text-neutral-400" />
                                        <span className="text-neutral-600">{item.label}</span>
                                        <Bot className="size-3.5 shrink-0 text-neutral-500" />
                                        <span className="min-w-0 flex-1 font-medium text-neutral-800">{item.name}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Circle className="size-3.5 shrink-0 text-neutral-400" />
                                        <span className="min-w-0 flex-1">{item.text}</span>
                                      </>
                                    )}
                                    <ChevronRight className="size-4 shrink-0 text-neutral-400" />
                                  </div>
                                ))}
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              )}
              {mergedMessages.map((message, index) => {
                const isThinkingCompleted = message.type === "thinking" && index < mergedMessages.length - 1;

                // User Intervention card
                if (message.type === "intervention" && message.interventionData) {
                  return (
                    <div key={message.id}>
                      <UserInterventionCard
                        icon={<Github className="size-5" />}
                        title={message.interventionData.title}
                        description={message.interventionData.description}
                        primaryAction={{
                          label: message.interventionData.primaryAction.label,
                          onClick: () => {
                            console.log("Action:", message.interventionData?.primaryAction.action);
                            toast.success("操作已触发");
                          },
                        }}
                        secondaryAction={
                          message.interventionData.secondaryAction
                            ? {
                                label: message.interventionData.secondaryAction.label,
                                onClick: () => {
                                  console.log("Action:", message.interventionData?.secondaryAction?.action);
                                },
                              }
                            : undefined
                        }
                        onDismiss={() => {
                          console.log("Dismissed intervention");
                        }}
                      />
                    </div>
                  );
                }

                // Summary card for completed agent + 任务人员转换提示
                if (message.type === "summary") {
                  const currentIndex = workingAgents.findIndex((wa) => wa.agent.id === message.agentId);
                  const nextAgent = currentIndex >= 0 && currentIndex < workingAgents.length - 1 ? workingAgents[currentIndex + 1].agent : null;
                  return (
                    <Card key={message.id} className="rounded-xl border border-green-200/80 bg-green-50/80 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle2 className="size-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="text-sm font-semibold text-neutral-900">
                              {message.agentName} - 已完成
                            </h4>
                            <Badge variant="outline" className="bg-white/90 text-xs font-medium">
                              2 分钟前
                            </Badge>
                          </div>
                          <p className="text-sm leading-relaxed text-neutral-600 mb-3">
                            完成了数据收集、清洗和分析工作
                          </p>
                          <div className="flex items-center gap-5 text-xs text-neutral-500">
                            <div className="flex items-center gap-1">
                              <FileCheck className="size-3" />
                              <span>生成 2 个文件</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="size-3" />
                              <span>分析准确率 95%</span>
                            </div>
                          </div>
                          {/* 任务人员转换提示：计划已确认 + @下一环 + OK 下一环 */}
                          {nextAgent && (
                            <div className="mt-4 pt-4 border-t border-green-200/60 space-y-3">
                              <p className="text-xs text-neutral-600">
                                计划已与用户确认，无需再次询问用户或起草计划，请直接执行。
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-800">
                                  @ {nextAgent.name}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs">
                                  <span className="font-medium text-orange-600">OK</span>
                                  <span className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 text-[10px]">
                                    {nextAgent.avatar}
                                  </span>
                                  <span className="font-medium text-neutral-800">{nextAgent.name}</span>
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                }

                // Progress card for working agent
                if (message.type === "progress") {
                  return (
                    <Card key={message.id} className="p-4 border-blue-200 bg-blue-50">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <Loader2 className="size-5 text-blue-600 animate-spin" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-neutral-900">
                              {message.agentName} - 进行中
                            </h4>
                            <Badge variant="outline" className="bg-white text-xs">
                              预计 3 分钟
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-600 mb-3">
                            正在根据分析结果撰写专业财报文案
                          </p>
                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-neutral-600">
                              <span>写作进度</span>
                              <span>65%</span>
                            </div>
                            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: '65%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                }

                // Regular message
                return (
                  <div key={message.id} className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 text-lg">
                      {message.avatar}
                    </div>
                    <div className="flex-1">
                      {/* Header: Name + Timestamp */}
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-medium text-sm text-neutral-900">
                          {message.agentName}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {message.timestamp.toLocaleString('zh-CN', { 
                            month: '2-digit', 
                            day: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>

                      {/* Status Line for Thinking */}
                      {message.type === "thinking" && (
                        <div className="mb-2 flex items-center gap-2 text-sm text-neutral-500">
                          {isThinkingCompleted ? (
                            <CheckCircle2 className="size-4 text-green-600" />
                          ) : (
                            <Loader2 className="size-4 animate-spin" />
                          )}
                          <span>{isThinkingCompleted ? "已完成" : "已处理 15 秒"}</span>
                          <ChevronDown className="size-4" />
                        </div>
                      )}

                      {/* Result Badge */}
                      {message.type === "result" && (
                        <div className="mb-2">
                          <Badge variant="outline" className="text-xs">
                            结果
                          </Badge>
                        </div>
                      )}

                      {/* Content */}
                      <div className={`rounded-lg p-4 text-sm ${
                        message.type === "thinking" 
                          ? "bg-neutral-100 text-neutral-700" 
                          : "bg-white border text-neutral-700"
                      }`}>
                        {message.content}
                      </div>

                      {/* Current Action for Thinking */}
                      {message.type === "thinking" && !isThinkingCompleted && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                          <Loader2 className="size-3 animate-spin" />
                          <span>在执行数据分析任务</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {/* 等待中阶段：仅团队确认（或 10s 自动确认）后才展示；堆叠效果，第一张完整卡片，后两张露一角 */}
              {teamConfirmed && (() => {
                const waitingList = workingAgents.filter((wa) => wa.status === "waiting");
                if (waitingList.length === 0) return null;
                return <WaitingStackCollapsible waitingList={waitingList} />;
              })()}
            </div>
          )}
        </ScrollArea>

        {/* 团队确认提示：在输入框上方，确认或 10s 自动执行后才展示下方 3 张等待卡片 */}
        {teamConfirmOpen && (
          <div className="border-t border-neutral-200 bg-sky-50/80 px-4 py-3">
            <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-900 mb-3">是否确认此团队开始任务？</h3>
              <div className="space-y-2 text-sm text-neutral-600 mb-4">
                <p><span className="font-medium text-neutral-800">团队名称：</span>{team.name}</p>
                <p><span className="font-medium text-neutral-800">成员构成：</span>translator、Storyboard Planner、Image Generator</p>
                <p><span className="font-medium text-neutral-800">核心能力：</span>翻译、分镜规划、图片生成</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-neutral-500">
                  {teamConfirmCountdown > 0 ? `${teamConfirmCountdown} 秒后自动执行` : "正在执行…"}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setTeamConfirmDismissed(true)}>
                    取消
                  </Button>
                  <Button size="sm" onClick={() => setTeamConfirmed(true)}>
                    确认开始
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t bg-white p-4">
          {/* File Reference Badge */}
          {selectedKnowledgeFiles.size > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
              <FileText className="size-4 text-blue-600" />
              <span className="text-sm text-blue-900">
                引用 {selectedKnowledgeFiles.size} 个文件
              </span>
              <button
                onClick={() => setSelectedKnowledgeFiles(new Set())}
                className="ml-auto text-blue-600 hover:text-blue-700"
              >
                <X className="size-4" />
              </button>
            </div>
          )}
          
          <div className="mb-2 flex items-center justify-end gap-1">
              <Button
                ref={historyTriggerRef}
                variant="ghost"
                size="icon"
                className="size-8 text-neutral-500 hover:text-neutral-700"
                title="历史任务记录"
                onClick={() => {
                  const el = historyTriggerRef.current;
                  const rect = el?.getBoundingClientRect();
                  if (typeof window !== "undefined" && rect) {
                    const panelWidth = 320;
                    const gap = 8;
                    const bottom = window.innerHeight - rect.top + gap;
                    const right = Math.max(0, window.innerWidth - rect.right);
                    const leftEdge = window.innerWidth - right - panelWidth;
                    const rightClamped = leftEdge < 16 ? window.innerWidth - panelWidth - 16 : right;
                    setHistoryPanelAnchor({
                      bottom,
                      right: rightClamped,
                    });
                  } else {
                    setHistoryPanelAnchor({ bottom: 100, right: 24 });
                  }
                  setHistoryPopoverOpen(true);
                }}
              >
                <History className="size-4" />
              </Button>
              {/* 浮层遮罩形式的历史任务卡片列表，定位在 icon 上方 */}
              {typeof document !== "undefined" &&
                historyPopoverOpen &&
                createPortal(
                  <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="历史任务记录">
                    {/* 遮罩：点击关闭 */}
                    <div
                      className="absolute inset-0 z-0 bg-neutral-900/50"
                      aria-hidden
                      onClick={() => {
                        setHistoryPopoverOpen(false);
                        setHistoryPanelAnchor(null);
                      }}
                    />
                    {/* 浮层：紧贴「历史任务记录」icon 正上方，右边缘与 icon 对齐 */}
                    <div
                      className="absolute z-10 w-80 max-h-[min(400px,calc(100vh-6rem))] flex flex-col rounded-xl border border-neutral-200/80 bg-white shadow-xl pointer-events-auto"
                      style={{
                        bottom: historyPanelAnchor?.bottom ?? 100,
                        right: historyPanelAnchor?.right ?? 24,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/80 px-4 py-3">
                        <h3 className="text-sm font-semibold text-neutral-900">历史任务记录</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                          onClick={() => {
                            setHistoryPopoverOpen(false);
                            setHistoryPanelAnchor(null);
                          }}
                          aria-label="关闭"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="p-3 space-y-2">
                          {mockHistoryTasks.map((task) => (
                            <div
                              key={task.id}
                              role="button"
                              tabIndex={0}
                              className="rounded-lg border border-neutral-200/80 p-3 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50/80 cursor-pointer"
                              onClick={() => {
                                toast.info(`已选择任务：${task.title}`);
                                setHistoryPopoverOpen(false);
                                setHistoryPanelAnchor(null);
                              }}
                            >
                              <p className="text-sm font-medium text-neutral-900 line-clamp-2">{task.title}</p>
                              <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                                <span>{task.time}</span>
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${task.status === "已完成" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                                >
                                  {task.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
              <Button variant="ghost" size="icon" className="size-8 text-neutral-500 hover:text-neutral-700" title="新开启任务" onClick={handleNewTask}>
                <PlusCircle className="size-4" />
              </Button>
          </div>
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="size-5" />
            </Button>
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入指令或反馈..."
              className="min-h-[60px] resize-none"
              rows={2}
            />
            
            <Button 
              onClick={handleSend} 
              disabled={!input.trim()}
              size="icon"
              className="shrink-0"
            >
              <Send className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 右侧边栏：可展开收起 */}
      <div
        data-module="workspace-right-sidebar"
        className={`flex h-full flex-shrink-0 border-l bg-white transition-[width] duration-200 ${
          rightSidebarOpen ? "w-96" : "w-12"
        }`}
      >
        {rightSidebarOpen ? (
          <>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <Tabs defaultValue="artifacts" className="flex h-full flex-col">
                <div className="flex items-center gap-1 border-b px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setRightSidebarOpen(false)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                    title="收起侧边栏"
                    aria-label="收起侧边栏"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                  <div className="min-w-0 flex-1 py-0.5 pr-1">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="artifacts">
                        项目文件
                      </TabsTrigger>
                      <TabsTrigger value="html">
                        网页html
                      </TabsTrigger>
                      <TabsTrigger value="tasks">
                        任务卡片
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

          <TabsContent value="artifacts" className="flex-1 overflow-auto p-4 mt-0">
            <div className="mb-4">
              <h3 className="font-medium text-neutral-900">项目中的文件</h3>
              <p className="text-xs text-neutral-500">AI 员工生成的所有文件</p>
            </div>

            <div className="space-y-4">
              {artifactsByTask.map((section) => (
                <div key={`${section.taskTime}-${section.taskName}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-500">
                      {section.taskTime}
                    </span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="text-xs font-medium text-neutral-700 truncate">
                      {section.taskName}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {section.items.map((artifact) => {
                      const Icon = artifact.icon;
                      return (
                        <Card key={artifact.id} className="group p-3 hover:bg-neutral-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                              <Icon className="size-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="truncate text-sm font-medium text-neutral-900">
                                {artifact.name}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 text-[10px]">
                                  {artifact.createdByAvatar}
                                </div>
                                <span className="text-xs text-neutral-500">{artifact.createdBy}</span>
                                <span className="text-xs text-neutral-400">·</span>
                                <span className="text-xs text-neutral-400">2分钟前</span>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="size-8" onClick={(e) => { e.stopPropagation(); setInput((prev) => prev + `@${artifact.name} `); toast.success(`已引用 ${artifact.name}`); }} title="引用文件">
                                <span className="text-sm font-medium text-neutral-600">@</span>
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8" onClick={(e) => { e.stopPropagation(); toast.success(`正在下载 ${artifact.name}`); }} title="下载文件">
                                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8 hover:bg-red-50 hover:text-red-600" onClick={(e) => { e.stopPropagation(); if (confirm(`确定要删除 ${artifact.name} 吗？`)) toast.success(`已删除 ${artifact.name}`); }} title="删除文件">
                                <X className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {artifacts.length === 0 && (
              <Card className="border-2 border-dashed p-8 text-center">
                <FileText className="mx-auto size-12 text-neutral-300" />
                <p className="mt-2 text-sm text-neutral-500">
                  文件将在此显示
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="html" className="flex-1 overflow-auto p-4 mt-0">
            <div className="mb-4">
              <h3 className="font-medium text-neutral-900">网页 HTML</h3>
              <p className="text-xs text-neutral-500">AI 生成的网页和可视化界面</p>
            </div>

            {/* HTML网页列表 */}
            <div className="space-y-3">
              {/* 网页项 1 */}
              <Card className="overflow-hidden">
                <div className="border-b bg-neutral-50 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="size-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span className="text-sm font-medium text-neutral-900">财务仪表板</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs">已生成</Badge>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {/* 预览区 */}
                  <div className="rounded-lg border bg-neutral-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-700">预览</span>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => toast.success("已复制网页链接")}
                        >
                          复制链接
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => toast.success("正在新窗口打开...")}
                        >
                          打开
                        </Button>
                      </div>
                    </div>
                    <div className="aspect-video rounded border bg-white flex items-center justify-center text-xs text-neutral-400">
                      <div className="text-center">
                        <div className="mb-2 text-2xl">📊</div>
                        <div>交互式数据可视化</div>
                      </div>
                    </div>
                  </div>

                  {/* 元信息 */}
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <div className="flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 text-[10px]">
                      {mockAgents[0].avatar}
                    </div>
                    <span>{mockAgents[0].name}</span>
                    <span>·</span>
                    <Clock className="size-3" />
                    <span>5分钟前</span>
                  </div>

                  {/* 技术信息 */}
                  <div className="rounded-lg bg-blue-50 p-3 space-y-2">
                    <div className="text-xs font-medium text-blue-900">技术栈</div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-xs bg-white">HTML5</Badge>
                      <Badge variant="outline" className="text-xs bg-white">CSS3</Badge>
                      <Badge variant="outline" className="text-xs bg-white">Chart.js</Badge>
                      <Badge variant="outline" className="text-xs bg-white">响应式</Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 网页项 2 */}
              <Card className="overflow-hidden">
                <div className="border-b bg-neutral-50 px-4 py-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="size-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm font-medium text-neutral-900">数据分析报告页</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs">已生成</Badge>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {/* 预览区 */}
                  <div className="rounded-lg border bg-neutral-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-700">预览</span>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => toast.success("已复制网页链接")}
                        >
                          复制链接
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-xs"
                          onClick={() => toast.success("正在新窗口打开...")}
                        >
                          打开
                        </Button>
                      </div>
                    </div>
                    <div className="aspect-video rounded border bg-white flex items-center justify-center text-xs text-neutral-400">
                      <div className="text-center">
                        <div className="mb-2 text-2xl">📈</div>
                        <div>专业数据报告</div>
                      </div>
                    </div>
                  </div>

                  {/* 元信息 */}
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <div className="flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 text-[10px]">
                      {mockAgents[1].avatar}
                    </div>
                    <span>{mockAgents[1].name}</span>
                    <span>·</span>
                    <Clock className="size-3" />
                    <span>10分钟前</span>
                  </div>

                  {/* 技术信息 */}
                  <div className="rounded-lg bg-purple-50 p-3 space-y-2">
                    <div className="text-xs font-medium text-purple-900">技术栈</div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-xs bg-white">HTML5</Badge>
                      <Badge variant="outline" className="text-xs bg-white">Tailwind</Badge>
                      <Badge variant="outline" className="text-xs bg-white">Echarts</Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 空状态 */}
              {false && (
                <Card className="border-2 border-dashed p-8 text-center">
                  <svg className="mx-auto size-12 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <p className="mt-2 text-sm text-neutral-500">
                    暂无生成的网页
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="flex-1 overflow-auto p-4 mt-0">
            <div className="mb-4">
              <h3 className="font-medium text-neutral-900">任务卡片</h3>
              <p className="text-xs text-neutral-500">定时任务和自动化工作流</p>
            </div>

            {/* 任务列表 */}
            <div className="space-y-3">
              {/* 计划任务 - 运行中 */}
              <div>
                <div className="mb-2 text-xs font-medium text-neutral-500">计划任务</div>
                <Card className="overflow-hidden">
                  <div className="border-b bg-neutral-50 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-green-600" />
                      <span className="text-sm font-medium text-neutral-900">每日财务数据分析</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* 执行信息 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-neutral-500">执行频率</div>
                        <div className="text-sm font-medium text-neutral-900">每天 09:00</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-500">下次执行</div>
                        <div className="text-sm font-medium text-neutral-900">明天 09:00</div>
                      </div>
                    </div>

                    {/* 任务描述 */}
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">任务内容</div>
                      <div className="rounded-lg bg-neutral-50 p-2 text-xs text-neutral-700">
                        自动采集前一日财务数据，生成分析报告并发送至邮箱
                      </div>
                    </div>

                    {/* 执行历史 */}
                    <div>
                      <div className="text-xs text-neutral-500 mb-2">最近执行</div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-3 text-green-600" />
                            <span className="text-neutral-600">今天 09:00</span>
                          </div>
                          <span className="text-neutral-400">成功</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-3 text-green-600" />
                            <span className="text-neutral-600">昨天 09:00</span>
                          </div>
                          <span className="text-neutral-400">成功</span>
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 - 只保留删除和@ */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          const mention = `@每日财务数据分析 `;
                          setInput((prev) => prev + mention);
                          toast.success("已引用任务");
                        }}
                      >
                        <span className="text-sm font-medium text-neutral-600">@</span>
                        <span className="ml-1">引用</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        onClick={() => {
                          if (confirm("确定要删除此任务吗？")) {
                            toast.success("已删除任务");
                          }
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 执行完的任务 */}
              <div>
                <div className="mb-2 text-xs font-medium text-neutral-500">执行完的任务</div>
                <Card className="overflow-hidden opacity-75">
                  <div className="border-b bg-neutral-50 px-4 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-600" />
                        <span className="text-sm font-medium text-neutral-900">周报自动生成</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-xs">已完成</Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* 执行信息 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-neutral-500">执行频率</div>
                        <div className="text-sm font-medium text-neutral-900">每周一 10:00</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-500">最后执行</div>
                        <div className="text-sm font-medium text-neutral-900">今天 10:00</div>
                      </div>
                    </div>

                    {/* 任务描述 */}
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">任务内容</div>
                      <div className="rounded-lg bg-neutral-50 p-2 text-xs text-neutral-700">
                        汇总一周工作数据，生成周报并分发给团队成员
                      </div>
                    </div>

                    {/* 操作按钮 - 只保留删除和@ */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          const mention = `@周报自动生成 `;
                          setInput((prev) => prev + mention);
                          toast.success("已引用任务");
                        }}
                      >
                        <span className="text-sm font-medium text-neutral-600">@</span>
                        <span className="ml-1">引用</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        onClick={() => {
                          if (confirm("确定要删除此任务吗？")) {
                            toast.success("已删除任务");
                          }
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* 另一个已完成的任务 */}
                <Card className="overflow-hidden opacity-75 mt-3">
                  <div className="border-b bg-neutral-50 px-4 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-600" />
                        <span className="text-sm font-medium text-neutral-900">月度总结报告</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-xs">已完成</Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* 执行信息 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-neutral-500">执行频率</div>
                        <div className="text-sm font-medium text-neutral-900">每月1号 08:00</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-500">最后执行</div>
                        <div className="text-sm font-medium text-neutral-900">本月1号 08:00</div>
                      </div>
                    </div>

                    {/* 任务描述 */}
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">任务内容</div>
                      <div className="rounded-lg bg-neutral-50 p-2 text-xs text-neutral-700">
                        每月生成综合性总结报告，包含数据分析、趋势预测
                      </div>
                    </div>

                    {/* 操作按钮 - 只保留删除和@ */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          const mention = `@月度总结报告 `;
                          setInput((prev) => prev + mention);
                          toast.success("已引用任务");
                        }}
                      >
                        <span className="text-sm font-medium text-neutral-600">@</span>
                        <span className="ml-1">引用</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        onClick={() => {
                          if (confirm("确定要删除此任务吗？")) {
                            toast.success("已删除任务");
                          }
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 空状态 */}
              {false && (
                <Card className="border-2 border-dashed p-8 text-center">
                  <Clock className="mx-auto size-12 text-neutral-300" />
                  <p className="mt-2 text-sm text-neutral-500">
                    暂无配置的任务
                  </p>
                  <Button size="sm" className="mt-4" variant="outline">
                    创建第一个任务
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setRightSidebarOpen(true)}
            className="flex h-full w-12 flex-col items-center justify-center text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
            title="展开侧边栏"
            aria-label="展开侧边栏"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}
      </div>

    </div>
    </>
  );
}