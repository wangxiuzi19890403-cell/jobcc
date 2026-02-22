import { useState } from "react";
import { useNavigate } from "react-router";
import { Team } from "../types";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { TeamSelectorDialog } from "../components/team-selector-dialog";
import { TeamEditDialog } from "../components/team-edit-dialog";
import { Sidebar } from "../components/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { 
  Upload, 
  Users, 
  Plus,
  ArrowRight,
  Edit,
  Zap,
  AlertTriangle,
  TrendingUp,
  Camera,
  Video,
  Settings,
  Menu,
  Send,
  MoreVertical,
  BarChart3,
  PenLine,
  FileText,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  CircleX,
  RefreshCw,
  Copy,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

// 扩展 mock 团队数据
const enhancedTeams = [
  {
    id: "team-daily-report",
    name: "财报组",
    icon: TrendingUp,
    iconBg: "bg-blue-500",
    status: "审核确认",
    statusColor: "bg-orange-400",
    subtitle: "数据分析 → 撰写 → 审核",
    workflowIcons: [BarChart3, PenLine, FileText],
    workflowAvatars: [
      { bg: "bg-orange-400", face: "bg-amber-50" },
      { bg: "bg-sky-400", face: "bg-sky-50" },
      { bg: "bg-emerald-400", face: "bg-emerald-50" },
    ],
    members: [
      { 
        id: "1", 
        avatar: "📊", 
        name: "数据分析师" 
      },
      { 
        id: "2", 
        avatar: "✍️", 
        name: "文案专员" 
      },
      { 
        id: "3", 
        avatar: "👔", 
        name: "主编审核" 
      },
    ],
    coreAbility: {
      icon: Zap,
      label: "核心能力",
      description: "批量生成报表格式记录文本，AI 智能提取、筛选自动数据分析",
      hasIssue: false,
    },
    executingTasks: [
      {
        id: "p1",
        title: "Q3 竞品财报深度分析",
        projectId: "P1",
        status: "执行中",
        progress: 78,
        stepCurrent: 3,
        stepTotal: 4,
        executingAgent: "深度分析智能体",
        details: ["正在交叉比对利润率...", "已抓取 4 家竞品数据"],
      },
      {
        id: "p2",
        title: "9月销售复盘报告",
        projectId: "P2",
        status: "待确认",
        alert: "发现异常:华东区转化率下降15%,建议人工介入。",
        needsConfirm: true,
      },
    ],
    completedTasksWithFile: [
      {
        id: "p0",
        title: "竞品数据清洗入库",
        duration: "45s",
        stepCurrent: 3,
        stepTotal: 3,
        resultFile: { fileName: "competitor_data_v2.csv", fileSize: "2.4 MB" },
      },
    ],
  },
  {
    id: "team-xiaohongshu",
    name: "小红书运营组",
    icon: Camera,
    iconBg: "bg-pink-500",
    status: "审核确认",
    statusColor: "bg-orange-400",
    subtitle: "选题挖掘 → 文案生成 → 互动分析",
    workflowIcons: [BarChart3, PenLine, FileText],
    workflowAvatars: [
      { bg: "bg-pink-400", face: "bg-pink-50" },
      { bg: "bg-violet-400", face: "bg-violet-50" },
      { bg: "bg-amber-400", face: "bg-amber-50" },
    ],
    members: [
      { 
        id: "4", 
        avatar: "📝", 
        name: "文案" 
      },
      { 
        id: "5", 
        avatar: "🎨", 
        name: "设计" 
      },
      { 
        id: "6", 
        avatar: "📸", 
        name: "摄影" 
      },
    ],
    coreAbility: {
      icon: AlertTriangle,
      label: "核心瓶颈",
      description: "批量生成报表格式记录文本，AI 智能提取、筛选自动数据分析",
      hasIssue: true,
    },
    executingTasks: [
      {
        id: "p3",
        title: "春季穿搭种草文案",
        projectId: "P3",
        status: "待确认",
        alert: "待确认变体",
        needsConfirm: true,
      },
    ],
    interruptedTasks: [
      {
        id: "p4",
        title: "每日新闻摘要推送",
        duration: "12s",
        stepCurrent: 2,
        stepTotal: 3,
        executingAgent: "内容摘要智能体",
        errorTitle: "执行中断",
        errorMessage: "OpenAI API Timeout (504) - 上游服务无响应",
      },
    ],
  },
  {
    id: "team-tiktok",
    name: "TikTok 视频组",
    icon: Video,
    iconBg: "bg-neutral-900",
    status: "运转中",
    statusColor: "bg-green-500",
    subtitle: "脚本创作 → 自动剪辑 → 字幕生成",
    workflowIcons: [FileText, Video, PenLine],
    workflowAvatars: [
      { bg: "bg-indigo-500", face: "bg-indigo-50" },
      { bg: "bg-rose-400", face: "bg-rose-50" },
      { bg: "bg-teal-400", face: "bg-teal-50" },
    ],
    members: [
      { 
        id: "7", 
        avatar: "🎬", 
        name: "脚本" 
      },
      { 
        id: "8", 
        avatar: "✂️", 
        name: "剪辑" 
      },
    ],
    coreAbility: {
      icon: Zap,
      label: "核心能力",
      description: "智能剪辑创作制作，自动配乐和配音，AI 语音驱动主体",
      hasIssue: false,
      darkBg: true,
    },
    executingTasks: [
      {
        id: "p5",
        title: "新品发布预热视频",
        projectId: "P5",
        status: "执行中",
        progress: 45,
        stepCurrent: 2,
        stepTotal: 4,
        executingAgent: "自动剪辑智能体",
      },
      {
        id: "p6",
        title: "用户反馈合集",
        projectId: "P6",
        status: "待确认",
        alert: "等待序任务完成...",
      },
    ],
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState(enhancedTeams);
  const [teamToDelete, setTeamToDelete] = useState<{ id: string; name: string } | null>(null);
  const [taskInput, setTaskInput] = useState("");
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filePreview, setFilePreview] = useState<{ taskTitle: string; fileName: string; fileSize: string } | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "上午好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  const handleSubmitTask = () => {
    if (taskInput.trim()) {
      toast.success("AI项目经理正在分析您的需求...");
      setTimeout(() => {
        navigate("/workspace/new");
      }, 1000);
    }
  };

  const handleEditTeam = (teamId: string) => {
    navigate(`/talent-market?teamId=${teamId}`);
  };

  const handlePublishTaskToTeam = (teamId: string, teamName: string) => {
    toast.success(`正在为 ${teamName} 发布任务...`);
    setTimeout(() => {
      navigate("/workspace/new");
    }, 500);
  };

  const handleCreateTeam = () => {
    navigate("/talent-market");
  };

  const handleGoToTeamConfig = () => {
    navigate("/talent-market");
  };

  const handleDeleteTeam = (keepHistory: boolean) => {
    if (!teamToDelete) return;
    setTeams((prev) => prev.filter((t) => t.id !== teamToDelete.id));
    if (keepHistory) {
      toast.success("您可在侧边栏的历史任务查看");
    } else {
      toast.success("已删除团队及任务卡片");
    }
    setTeamToDelete(null);
  };

  const handleDuplicateTeam = (team: (typeof enhancedTeams)[number]) => {
    const baseName = team.name;
    const sameBase = teams.filter(
      (t) => t.name === baseName || t.name.startsWith(baseName + " ")
    );
    const nums = sameBase.map((t) => {
      const m = t.name.match(/^(.+) (\d+)$/);
      return m ? parseInt(m[2], 10) : 0;
    });
    const maxNum = Math.max(0, ...nums);
    const newName = baseName + " " + (maxNum + 1);
    const newTeam = {
      ...team,
      id: `team-copy-${team.id}-${Date.now()}`,
      name: newName,
    };
    setTeams((prev) => [...prev, newTeam]);
    toast.success(`已复制为「${newName}」`);
  };

  const handleOpenTeamDialog = () => {
    setTeamDialogOpen(true);
  };

  const handleSelectTeam = (team: any) => {
    // 插入团队名称到输入框
    if (cursorPosition !== null) {
      // 如果是通过 @ 触发的，替换 @ 符号
      const beforeAt = taskInput.slice(0, cursorPosition - 1);
      const afterAt = taskInput.slice(cursorPosition);
      const newText = `${beforeAt}@${team.name} ${afterAt}`;
      setTaskInput(newText);
      setCursorPosition(null);
    } else {
      // 如果是通过按钮触发的，直接追加
      setTaskInput((prev) => {
        const newText = prev ? `${prev} @${team.name} ` : `@${team.name} `;
        return newText;
      });
    }
    toast.success(`已呼叫 ${team.name}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const curPos = e.target.selectionStart;
    
    setTaskInput(value);

    // 检测是否输入了 @ 符号
    if (value[curPos - 1] === "@") {
      setCursorPosition(curPos);
      setTeamDialogOpen(true);
    }
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-neutral-50 via-white to-neutral-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header with Menu */}
        <div className="mb-8 flex items-center justify-between sm:mb-10">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/20">
              <Zap className="size-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">
                Jobcc
              </h1>
              <p className="text-xs text-neutral-500 sm:text-sm">
                AI 智能团队协作平台
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="size-9 border-neutral-200 bg-white/80 backdrop-blur-sm transition-all hover:border-neutral-300 hover:bg-neutral-50"
            onClick={() => setSidebarOpen(true)}
            title="打开侧边栏"
          >
            <Menu className="size-4" />
          </Button>
        </div>

        {/* Hero Section */}
        <div className="mb-10 text-center sm:mb-14">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl lg:text-5xl">
            {getGreeting()}，Boss。
          </h2>
          <p className="mt-4 text-base text-neutral-600 sm:text-lg lg:text-xl">
            这里是您的 AI 指挥中心，随时准备调度您的数字化员工。
          </p>
        </div>

        {/* Main Input Area */}
        <Card className="mx-auto mb-8 max-w-4xl overflow-hidden border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 shadow-xl shadow-blue-100/50 sm:mb-10">
          <div className="relative p-4 sm:p-6 lg:p-7">
            {/* 装饰性背景元素 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative">
              {/* 标题提示 */}
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <div className="flex size-6 items-center justify-center rounded-md bg-neutral-200/80 text-neutral-500">
                  <Zap className="size-3" />
                </div>
                <p className="text-xs text-neutral-400 sm:text-[13px]">
                  创建新任务 · 描述你的需求，AI 将为你组建专业团队
                </p>
              </div>

              {/* 输入框 */}
              <div className="relative mb-4 rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm transition-all hover:border-blue-300/60 hover:shadow-md focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-100/50 sm:mb-5">
                <Textarea
                  value={taskInput}
                  onChange={handleInputChange}
                  placeholder="发布任务，AI 将为你组建专业团队，或者 @ 指定团队执行任务"
                  className="min-h-[110px] resize-none border-0 bg-transparent p-4 text-[15px] leading-relaxed shadow-none focus-visible:ring-0 placeholder:text-neutral-400 sm:p-5 sm:text-base"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleSubmitTask();
                    }
                  }}
                />
                <div className="absolute bottom-2 right-3 text-[11px] text-neutral-400 sm:text-xs">
                  {taskInput.length > 0 && `${taskInput.length} 字`}
                  <span className="ml-2 text-neutral-300">⌘ + Enter 发布</span>
                </div>
              </div>
              
              {/* 操作按钮区域 */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {/* 左侧操作按钮 */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="group h-8 border-neutral-200 bg-white/80 backdrop-blur-sm text-neutral-700 text-xs sm:text-sm transition-all hover:border-neutral-300 hover:bg-neutral-100 hover:shadow-sm active:bg-neutral-200 active:border-neutral-400"
                  >
                    <Upload className="mr-2 size-4 transition-transform group-hover:scale-110" />
                    上传文件
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleOpenTeamDialog}
                    className="group h-8 border-neutral-200 bg-white/80 backdrop-blur-sm text-xs sm:text-sm transition-all hover:border-purple-300 hover:bg-purple-50/50 hover:shadow-sm"
                  >
                    <Users className="mr-2 size-4 transition-transform group-hover:scale-110" />
                    呼叫团队
                  </Button>
                </div>

                {/* 右侧发布按钮 */}
                <Button 
                  onClick={handleSubmitTask}
                  disabled={!taskInput.trim()}
                  size="lg"
                  className="group h-10 w-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:shadow-blue-500/40 disabled:from-neutral-300 disabled:to-neutral-400 disabled:shadow-none disabled:hover:shadow-none sm:w-auto"
                >
                  <span>发布任务</span>
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* My Teams Section */}
        <div className="mb-7 flex items-center justify-between sm:mb-9">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
              我的团队
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              className="size-8 border-neutral-200 bg-white/80 backdrop-blur-sm transition-all hover:border-neutral-300 hover:bg-neutral-50"
              onClick={handleGoToTeamConfig}
              title="团队配置"
            >
              <Settings className="size-4" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
          >
            查看全部
            <ArrowRight className="ml-1.5 size-4" />
          </Button>
        </div>

        {/* Teams Grid - 占满模块宽度，自适应列宽 */}
        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-6">
          {teams.map((team) => {
            const TeamIcon = team.icon;
            const WorkflowIcons = "workflowIcons" in team && Array.isArray(team.workflowIcons) ? team.workflowIcons : [];
            return (
              <div key={team.id} className="group flex min-w-0 flex-col gap-4">
                {/* 团队信息：单独一张固定高度卡片 */}
                <Card className="flex h-[220px] shrink-0 flex-col overflow-hidden border border-violet-200/70 bg-gradient-to-br from-violet-50/60 via-white to-slate-50/70 px-3 py-2.5 shadow-sm transition-all hover:border-violet-300/80 hover:shadow-md sm:px-4 sm:py-2.5">
                  <div className="mb-1 flex shrink-0 items-start justify-between gap-2">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg shadow-md ${team.iconBg}`}>
                      <TeamIcon className="size-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-neutral-900 sm:text-base leading-tight">
                        {team.name}
                      </h3>
                    </div>
                    <div className="flex shrink-0 items-center -space-x-1">
                      {(
                        "workflowAvatars" in team && Array.isArray(team.workflowAvatars)
                          ? team.workflowAvatars
                          : [
                              { bg: "bg-neutral-400", face: "bg-neutral-100" },
                              { bg: "bg-neutral-500", face: "bg-neutral-100" },
                              { bg: "bg-neutral-600", face: "bg-neutral-200" },
                            ]
                      )
                        .slice(0, 3)
                        .map((avatar: { bg: string; face: string }, i: number) => (
                        <div
                          key={i}
                          className={`relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-sm ${avatar.bg}`}
                          title={team.subtitle?.split("→").map((s: string) => s.trim())[i] ?? ""}
                        >
                          <div className={`absolute inset-1 rounded-full ${avatar.face}`}>
                            <span className="absolute left-[22%] top-[28%] size-1 rounded-full bg-neutral-700" />
                            <span className="absolute right-[22%] top-[28%] size-1 rounded-full bg-neutral-700" />
                            <span className="absolute bottom-[26%] left-1/2 h-0.5 w-1.5 -translate-x-1/2 rounded-full bg-neutral-400" />
                            <span className="absolute left-[6%] top-[42%] size-1 rounded-full bg-pink-200/90" />
                            <span className="absolute right-[6%] top-[42%] size-1 rounded-full bg-pink-200/90" />
                          </div>
                        </div>
                      ))}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex size-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                          onClick={(e) => e.stopPropagation()}
                          title="更多（删除/复制团队）"
                        >
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={6} className="z-[100]" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setTeamToDelete({ id: team.id, name: team.name })}
                          >
                            <Trash2 className="size-4" />
                            删除团队
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTeam(team)}>
                            <Copy className="size-4" />
                            复制团队
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <p className="my-0.5 shrink-0 text-[11px] text-neutral-500 sm:text-xs leading-tight">
                    {team.subtitle}
                  </p>

                  <div className="max-h-[4rem] min-h-0 shrink-0 overflow-hidden rounded-md border border-neutral-200/80 bg-neutral-50/50 px-2.5 py-1">
                    <p className="mb-0.5 text-[11px] font-semibold text-neutral-800">核心能力</p>
                    <p className="text-[11px] leading-snug text-neutral-700 line-clamp-2">
                      {team.coreAbility.description}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="mt-1 mb-2 w-full shrink-0 border-neutral-200 bg-violet-50/60 text-blue-600 hover:bg-violet-100/80 hover:border-violet-200 hover:text-blue-700 text-xs h-7 py-1"
                    onClick={() => handlePublishTaskToTeam(team.id, team.name)}
                  >
                    <Plus className="mr-1.5 size-3.5" />
                    给该团队派活
                  </Button>
                </Card>

                {/* 任务列表区域：固定高度，超出可上下滑动 */}
                <Card className="flex min-w-0 flex-col overflow-hidden border border-neutral-200/60 bg-white transition-all hover:border-neutral-300 hover:shadow-md">
                  <div className="h-[320px] overflow-y-auto px-4 py-4 sm:px-5 sm:py-4">
                    {(() => {
                      const executingTasks = Array.isArray(team.executingTasks) ? team.executingTasks : [];
                      const executingCount = executingTasks.filter((t: { status?: string }) => t.status === "执行中").length;
                      const pendingCount = executingTasks.filter((t: { status?: string }) => t.status === "待确认").length;
                      const interruptedCount = Array.isArray((team as { interruptedTasks?: unknown[] }).interruptedTasks) ? (team as { interruptedTasks: unknown[] }).interruptedTasks.length : 0;
                      const completedCount = Array.isArray((team as { completedTasksWithFile?: unknown[] }).completedTasksWithFile) ? (team as { completedTasksWithFile: unknown[] }).completedTasksWithFile.length : 0;
                      const hasAny = executingCount + pendingCount + interruptedCount + completedCount > 0;
                      return hasAny ? (
                        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-neutral-200/80 bg-neutral-50/80 px-3 py-2 text-[11px]">
                          <span className="font-medium text-neutral-500">任务概览</span>
                          <span className="text-blue-600"><span className="text-neutral-500">正在执行</span> <span className="font-semibold">{executingCount}</span></span>
                          <span className="text-orange-600"><span className="text-neutral-500">待处理</span> <span className="font-semibold">{pendingCount}</span></span>
                          <span className="text-red-600"><span className="text-neutral-500">执行中断</span> <span className="font-semibold">{interruptedCount}</span></span>
                          <span className="text-green-600"><span className="text-neutral-500">已完成</span> <span className="font-semibold">{completedCount}</span></span>
                        </div>
                      ) : null;
                    })()}
                {"executingTasks" in team && Array.isArray(team.executingTasks) && team.executingTasks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-3 text-xs font-semibold text-neutral-600">
                      正在执行 / 待处理 <span className="font-normal text-neutral-400">({(team.executingTasks as { status?: string }[]).length})</span>
                    </h4>
                    <div className="space-y-3">
                      {team.executingTasks.map((task: {
                        id: string;
                        title: string;
                        projectId: string;
                        status: string;
                        progress?: number;
                        details?: string[];
                        alert?: string;
                        needsConfirm?: boolean;
                      }) => (
                        <div
                          key={task.id}
                          className={`relative overflow-hidden rounded-lg border border-neutral-200/80 bg-white p-3.5 ${
                            task.status === "执行中"
                              ? "border-l-4 border-l-blue-500"
                              : "border-l-4 border-l-orange-400"
                          }`}
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h5 className="text-sm font-bold text-neutral-900 truncate">{task.title}</h5>
                            </div>
                            <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-white ${
                              task.status === "执行中" ? "bg-blue-500" : "bg-orange-400"
                            }`}>
                              {task.status === "执行中" && <span className="size-1.5 rounded-full bg-white" />}
                              {task.status}
                            </span>
                          </div>
                          {(task.progress != null || (task as { stepCurrent?: number }).stepCurrent != null) && (
                            <>
                              {((t: { stepTotal?: number; stepCurrent?: number }) => {
                                const total = t.stepTotal ?? 4;
                                const current = t.stepCurrent ?? Math.min(4, Math.floor(((t as { progress?: number }).progress ?? 0) / 25) + 1);
                                return (
                                  <div className="mb-2">
                                    <div className="flex gap-0.5">
                                      {Array.from({ length: total }).map((_, i) => (
                                        <div
                                          key={i}
                                          className={`h-1.5 flex-1 rounded-sm ${
                                            i + 1 < current
                                              ? "bg-neutral-400"
                                              : i + 1 === current
                                                ? "bg-blue-400"
                                                : "bg-neutral-100"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-500">
                                      <span className="flex items-center gap-1.5">
                                        <span className="size-1.5 rounded-full bg-blue-400" />
                                        正在执行: {(task as { executingAgent?: string }).executingAgent ?? "智能体"}
                                      </span>
                                      <span>Step {current}/{total}</span>
                                    </div>
                                  </div>
                                );
                              })(task)}
                              {task.details && task.details.length > 0 && (
                                <div className="mb-2 rounded-lg bg-neutral-100/80 px-2.5 py-2">
                                  <ul className="space-y-0.5 text-[11px] text-neutral-600">
                                    {task.details.map((d, i) => (
                                      <li key={i}>• {d}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <button
                                type="button"
                                className="text-[11px] text-blue-600 hover:underline"
                                onClick={() => navigate("/workspace/new")}
                              >
                                查看详情 →
                              </button>
                            </>
                          )}
                          {(task.alert || task.needsConfirm) && (
                            <div className="mb-2 rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] text-amber-800">
                              {task.alert && (
                                <div className="flex items-start gap-1.5">
                                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                                  <span>{task.alert}</span>
                                </div>
                              )}
                              {task.needsConfirm && (
                                <div className="mt-2 flex gap-2">
                                  <button
                                    type="button"
                                    className="rounded border border-amber-200 bg-amber-100/60 px-2.5 py-1 text-[11px] text-amber-800 hover:bg-amber-200/60"
                                    onClick={() => toast.success("已批准")}
                                  >
                                    批准
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded border border-amber-200/80 bg-transparent px-2.5 py-1 text-[11px] text-amber-700 hover:bg-amber-100/80"
                                    onClick={() => toast.info("修改")}
                                  >
                                    修改
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 执行中断 · 异常终止提示 - 任务卡片 */}
                {"interruptedTasks" in team && Array.isArray((team as { interruptedTasks?: Array<{ id: string; title: string; duration?: string; stepCurrent?: number; stepTotal?: number; executingAgent?: string; errorTitle: string; errorMessage: string }> }).interruptedTasks) && (team as { interruptedTasks?: unknown[] }).interruptedTasks!.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-3 text-xs font-semibold text-neutral-600">
                      执行中断 <span className="font-normal text-neutral-400">({(team as { interruptedTasks: unknown[] }).interruptedTasks.length})</span>
                    </h4>
                    <div className="space-y-3">
                      {((team as { interruptedTasks: Array<{ id: string; title: string; duration?: string; stepCurrent: number; stepTotal: number; executingAgent?: string; errorTitle: string; errorMessage: string }> }).interruptedTasks).map((task) => {
                        const total = task.stepTotal;
                        const current = task.stepCurrent;
                        return (
                          <div
                            key={task.id}
                            className="relative overflow-hidden rounded-lg border border-neutral-200/80 border-l-4 border-l-red-500 bg-white p-3.5"
                          >
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h5 className="text-sm font-bold text-neutral-900 truncate">{task.title}</h5>
                              </div>
                              {task.duration && (
                                <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">{task.duration}</span>
                              )}
                            </div>
                            <div className="mb-2">
                              <div className="flex gap-0.5">
                                {Array.from({ length: total }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`h-1.5 flex-1 rounded-sm ${
                                      i + 1 < current ? "bg-neutral-400" : i + 1 === current ? "bg-red-500" : "bg-neutral-100"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-500">
                                <span className="flex items-center gap-1.5 text-neutral-700">
                                  <span className="size-1.5 rounded-full bg-red-500" />
                                  正在执行: {task.executingAgent ?? "智能体"}
                                </span>
                                <span className="text-neutral-400">Step {current}/{total}</span>
                              </div>
                            </div>
                            <div className="rounded-lg border border-red-200 bg-red-50/80 px-2.5 py-3">
                              <div className="mb-2 flex items-center gap-2">
                                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                                  <CircleX className="size-3" />
                                </div>
                                <span className="text-xs font-bold text-red-700">{task.errorTitle}</span>
                              </div>
                              <p className="mb-3 text-[11px] text-neutral-700">{task.errorMessage}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-red-300 bg-transparent px-3 text-xs text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
                                onClick={() => toast.success("已发起重试")}
                              >
                                <RefreshCw className="mr-2 size-3.5" />
                                重试任务
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 已完成 · 可查看/下载文件 - 任务卡片 */}
                {"completedTasksWithFile" in team && Array.isArray((team as { completedTasksWithFile?: Array<{ id: string; title: string; duration?: string; stepCurrent?: number; stepTotal?: number; resultFile: { fileName: string; fileSize: string } }> }).completedTasksWithFile) && (team as { completedTasksWithFile?: unknown[] }).completedTasksWithFile!.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-xs font-semibold text-neutral-600">
                      已完成 <span className="font-normal text-neutral-400">({(team as { completedTasksWithFile: unknown[] }).completedTasksWithFile.length})</span>
                    </h4>
                    <div className="space-y-3">
                      {((team as { completedTasksWithFile: Array<{ id: string; title: string; duration?: string; stepCurrent?: number; stepTotal?: number; resultFile: { fileName: string; fileSize: string } }> }).completedTasksWithFile).map((task) => (
                        <div
                          key={task.id}
                          className="relative overflow-hidden rounded-lg border border-neutral-200/80 border-l-4 border-l-green-500 bg-white"
                        >
                          <div className="p-3.5">
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h5 className="text-sm font-bold text-neutral-900 truncate">{task.title}</h5>
                              </div>
                              {task.duration && (
                                <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">{task.duration}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                              <span className="size-1.5 rounded-full bg-green-500" />
                              <span className="text-neutral-600">任务完成</span>
                              {(task.stepCurrent != null && task.stepTotal != null) && (
                                <span className="text-neutral-400">Step {task.stepCurrent}/{task.stepTotal}</span>
                              )}
                            </div>
                          </div>
                          <div className="border-t border-neutral-100 bg-neutral-50/80 px-3.5 py-4">
                            <div className="flex flex-col items-center text-center">
                              <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <FileSpreadsheet className="size-5" />
                              </div>
                              <p className="text-sm font-medium text-neutral-900 truncate w-full">{task.resultFile.fileName}</p>
                              <p className="mt-0.5 text-[11px] text-neutral-500">{task.resultFile.fileSize}</p>
                              <Button
                                size="sm"
                                className="mt-3 h-9 bg-neutral-900 px-4 text-xs text-white hover:bg-neutral-800"
                                onClick={() => setFilePreview({ taskTitle: task.title, fileName: task.resultFile.fileName, fileSize: task.resultFile.fileSize })}
                              >
                                <FileText className="mr-2 size-3.5" />
                                点击查看
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Selector Dialog */}
      <TeamSelectorDialog
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
        teams={teams}
        onSelectTeam={handleSelectTeam}
      />

      {/* Team Edit Dialog */}
      <TeamEditDialog
        open={editTeamDialogOpen}
        onOpenChange={setEditTeamDialogOpen}
        teamId={selectedTeamId}
      />

      {/* 文件内容查看 - 遮罩弹层 */}
      <Dialog
        open={filePreview !== null}
        onOpenChange={(open) => !open && setFilePreview(null)}
      >
        <DialogContent className="max-h-[85vh] flex max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          {filePreview && (
            <>
              <div className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:px-5">
                <DialogTitle className="text-base font-semibold text-neutral-900">{filePreview.taskTitle}</DialogTitle>
                <DialogDescription className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                  <span className="font-medium text-neutral-600">{filePreview.fileName}</span>
                  <span>{filePreview.fileSize}</span>
                </DialogDescription>
              </div>
              <div className="min-h-0 flex-1 overflow-auto bg-neutral-900/5 p-4 sm:p-5">
                <div className="rounded-lg border border-neutral-200 bg-white p-4 font-mono text-xs leading-relaxed text-neutral-800">
                  <pre className="whitespace-pre-wrap break-all">
                    {filePreview.fileName.endsWith(".csv")
                      ? "品牌,季度,营收(万),利润率\n竞品A,Q3 2024,12500,12.3%\n竞品B,Q3 2024,8900,8.7%\n竞品C,Q3 2024,15600,14.1%\n...（此处展示文件内容预览）"
                      : "（此处展示文件内容预览）"}
                  </pre>
                </div>
              </div>
              <div className="shrink-0 border-t border-neutral-200 bg-neutral-50 px-4 py-3 sm:px-5">
                <Button variant="outline" size="sm" onClick={() => setFilePreview(null)}>
                  关闭
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除团队二次确认弹窗 */}
      <Dialog
        open={teamToDelete !== null}
        onOpenChange={(open) => !open && setTeamToDelete(null)}
      >
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>是否保留历史任务？</DialogTitle>
            <DialogDescription>
              删除「{teamToDelete?.name}」后，{teamToDelete?.name ? "您可以选择将历史任务保留在侧边栏查看，或一并删除。" : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setTeamToDelete(null)}
            >
              返回
            </Button>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => handleDeleteTeam(false)}
            >
              不保留
            </Button>
            <Button
              onClick={() => handleDeleteTeam(true)}
            >
              保留历史任务
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
    </div>
  );
}