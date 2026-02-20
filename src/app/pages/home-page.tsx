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
  },
  {
    id: "team-xiaohongshu",
    name: "小红书运营组",
    icon: Camera,
    iconBg: "bg-pink-500",
    status: "审核确认",
    statusColor: "bg-orange-400",
    subtitle: "选题挖掘 → 文案生成 → 互动分析",
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
  },
  {
    id: "team-tiktok",
    name: "TikTok 视频组",
    icon: Video,
    iconBg: "bg-neutral-900",
    status: "运转中",
    statusColor: "bg-green-500",
    subtitle: "脚本创作 → 自动剪辑 → 字幕生成",
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
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const [taskInput, setTaskInput] = useState("");
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              <div className="mb-4 flex items-center gap-3 sm:mb-5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md shadow-blue-500/30">
                  <Zap className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 sm:text-base">创建新任务</h3>
                  <p className="mt-0.5 text-[11px] text-neutral-500 sm:text-xs">描述你的需求，AI 将为你组建专业团队</p>
                </div>
              </div>

              {/* 输入框 */}
              <div className="relative mb-4 rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm transition-all hover:border-blue-300/60 hover:shadow-md focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-100/50 sm:mb-5">
                <Textarea
                  value={taskInput}
                  onChange={handleInputChange}
                  placeholder="描述任务，上传简报，或输入 @ 指定团队发布需求..."
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
                    className="group h-8 border-neutral-200 bg-white/80 backdrop-blur-sm text-xs sm:text-sm transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm"
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
        <div className="mb-6 flex items-center justify-between sm:mb-8">
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

        {/* Teams Grid */}
        <div className="grid gap-4 sm:gap-5 lg:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {enhancedTeams.map((team) => {
            const TeamIcon = team.icon;
            const AbilityIcon = team.coreAbility.icon;
            
            return (
              <Card 
                key={team.id}
                className="group relative flex flex-col overflow-hidden border border-neutral-200/60 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-200/50 sm:p-6"
              >
                {/* Header - Icon + Status */}
                <div className="mb-4 flex items-start justify-between">
                  <div className={`flex size-11 items-center justify-center rounded-xl shadow-md transition-transform group-hover:scale-105 ${team.iconBg}`}>
                    <TeamIcon className="size-5 text-white" />
                  </div>
                  <Badge 
                    className={`${team.statusColor} border-0 text-white text-[10px] px-2.5 py-0.5 h-5 font-medium shadow-sm`}
                  >
                    {team.status}
                  </Badge>
                </div>

                {/* Team Name */}
                <h3 className="mb-1.5 text-base font-semibold text-neutral-900 sm:text-lg">
                  {team.name}
                </h3>
                
                {/* Subtitle - Workflow */}
                <p className="mb-4 text-xs text-neutral-500 leading-relaxed sm:text-sm">
                  {team.subtitle}
                </p>

                {/* Members - Emoji Avatars */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-50 to-purple-50 shadow-sm text-sm transition-transform hover:scale-110"
                        title={member.name}
                      >
                        {member.avatar}
                      </div>
                    ))}
                  </div>
                  {team.members.length > 3 && (
                    <span className="text-xs font-medium text-neutral-400">
                      +{team.members.length - 3}
                    </span>
                  )}
                </div>

                {/* Core Ability/Bottleneck */}
                <div className={`mb-4 rounded-lg p-3.5 transition-colors ${
                  team.coreAbility.darkBg 
                    ? "bg-neutral-900 text-white" 
                    : "bg-neutral-50"
                }`}>
                  <div className="mb-2 flex items-center gap-2">
                    <AbilityIcon className={`size-3.5 ${
                      team.coreAbility.hasIssue 
                        ? "text-red-500" 
                        : team.coreAbility.darkBg 
                          ? "text-white" 
                          : "text-blue-500"
                    }`} />
                    <span className={`text-xs font-semibold ${
                      team.coreAbility.hasIssue 
                        ? "text-red-600" 
                        : team.coreAbility.darkBg 
                          ? "text-white" 
                          : "text-neutral-700"
                    }`}>
                      {team.coreAbility.label}
                    </span>
                  </div>
                  <p className={`text-xs leading-relaxed ${
                    team.coreAbility.darkBg 
                      ? "text-neutral-300" 
                      : "text-neutral-600"
                  }`}>
                    {team.coreAbility.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2">
                  <Button 
                    size="sm"
                    className="h-9 flex-1 text-xs font-medium transition-all hover:shadow-md"
                    onClick={() => handlePublishTaskToTeam(team.id, team.name)}
                  >
                    <Send className="mr-1.5 size-3.5" />
                    发布任务
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 px-3 border-neutral-200 transition-all hover:border-neutral-300 hover:bg-neutral-50"
                    onClick={() => handleEditTeam(team.id)}
                  >
                    <Edit className="size-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}

          {/* Create New Team Card */}
          <Card 
            className="group flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-neutral-300 bg-white p-6 transition-all hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/30 hover:shadow-md sm:p-8"
            onClick={handleCreateTeam}
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 mb-4 transition-transform group-hover:scale-110 group-hover:shadow-lg">
              <Plus className="size-7 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 sm:text-lg">组建新团队</h3>
            <p className="mt-2 text-xs text-neutral-500 sm:text-sm">
              基础 Agent + 工作流
            </p>
          </Card>
        </div>
      </div>

      {/* Team Selector Dialog */}
      <TeamSelectorDialog
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
        teams={enhancedTeams}
        onSelectTeam={handleSelectTeam}
      />

      {/* Team Edit Dialog */}
      <TeamEditDialog
        open={editTeamDialogOpen}
        onOpenChange={setEditTeamDialogOpen}
        teamId={selectedTeamId}
      />

      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
    </div>
  );
}