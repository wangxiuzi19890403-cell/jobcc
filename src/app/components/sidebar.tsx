import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  Plus,
  History,
  Settings,
  TrendingUp,
  Camera,
  Video,
  User,
  Heart,
  HelpCircle,
  Gift,
  LogOut,
  Monitor,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useState } from "react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  // Mock teams data - 扩展更多团队
  const allTeams = [
    {
      id: "team-daily-report",
      name: "财报组",
      icon: TrendingUp,
      iconBg: "bg-blue-500",
      status: "运转中",
      statusColor: "bg-green-500",
    },
    {
      id: "team-xiaohongshu",
      name: "小红书运营组",
      icon: Camera,
      iconBg: "bg-pink-500",
      status: "审核确认",
      statusColor: "bg-orange-400",
    },
    {
      id: "team-tiktok",
      name: "TikTok 视频组",
      icon: Video,
      iconBg: "bg-neutral-900",
      status: "运转中",
      statusColor: "bg-green-500",
    },
    {
      id: "team-content",
      name: "内容创作组",
      icon: TrendingUp,
      iconBg: "bg-purple-500",
      status: "运转中",
      statusColor: "bg-green-500",
    },
    {
      id: "team-research",
      name: "市场调研组",
      icon: TrendingUp,
      iconBg: "bg-orange-500",
      status: "待命",
      statusColor: "bg-neutral-400",
    },
    {
      id: "team-design",
      name: "UI设计组",
      icon: Camera,
      iconBg: "bg-green-500",
      status: "运转中",
      statusColor: "bg-green-500",
    },
  ];

  // 显示的团队列表
  const displayedTeams = showAllTeams ? allTeams : allTeams.slice(0, 3);

  // Mock history data
  const histories = [
    { id: "1", title: "Q1 季度财报周分析报告", date: "2小时前" },
    { id: "2", title: "服务解析平台阐释批注", date: "昨天" },
    { id: "3", title: "品牌 Slogan 头脑风暴", date: "昨天" },
    { id: "4", title: "招聘 JD 自动生成", date: "3天前" },
  ];

  const handleCreateTeam = () => {
    navigate("/talent-market");
    onClose();
  };

  const handleTeamClick = (teamId: string) => {
    navigate("/");
    onClose();
    toast.info("切换到团队");
  };

  const handleViewAllTeams = () => {
    setShowAllTeams(!showAllTeams);
  };

  const handleHistoryClick = (historyId: string, title: string) => {
    navigate("/workspace/new");
    onClose();
    toast.info(`打开：${title}`);
  };

  const handleUserSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleThemeChange = (newTheme: "system" | "light" | "dark") => {
    setTheme(newTheme);
    toast.success(
      `已切换到${newTheme === "system" ? "系统" : newTheme === "light" ? "亮色" : "暗色"}主题`
    );
  };

  const handleLogout = () => {
    toast.success("已退出登录");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-50 h-screen p-2 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full w-[240px] flex-col rounded-2xl border bg-white shadow-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b px-4 py-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-xl text-white">
              🤖
            </div>
            <div>
              <div className="font-semibold text-neutral-900">Jobcc</div>
              <div className="text-[10px] text-neutral-500">通用AI劳动力组织协议</div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-3">
            {/* My Teams */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-xs font-medium text-neutral-500">
                  我的 AI 团队
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={handleCreateTeam}
                >
                  <Plus className="size-3 text-neutral-400" />
                </Button>
              </div>
              <div className="space-y-1">
                {displayedTeams.map((team) => {
                  const TeamIcon = team.icon;
                  return (
                    <button
                      key={team.id}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-neutral-100"
                      onClick={() => handleTeamClick(team.id)}
                    >
                      <div
                        className={`flex size-6 shrink-0 items-center justify-center rounded ${team.iconBg}`}
                      >
                        <TeamIcon className="size-3.5 text-white" />
                      </div>
                      <span className="flex-1 truncate text-xs text-neutral-700">
                        {team.name}
                      </span>
                      <div
                        className={`size-1.5 shrink-0 rounded-full ${team.statusColor}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* View All Teams Toggle */}
            <button
              className="mb-4 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
              onClick={handleViewAllTeams}
            >
              <span>查看全部团队</span>
              {showAllTeams ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>

            {/* History */}
            <div>
              <div className="mb-2 px-2">
                <span className="text-xs font-medium text-neutral-500">
                  历史会话 (HISTORY)
                </span>
              </div>
              <div className="space-y-1">
                {histories.map((history) => (
                  <button
                    key={history.id}
                    className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-neutral-100"
                    onClick={() => handleHistoryClick(history.id, history.title)}
                  >
                    <History className="mt-0.5 size-3.5 shrink-0 text-neutral-400" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs text-neutral-700">
                        {history.title}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {history.date}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* User Info & Points */}
          <div className="border-t p-3">
            {/* Points & Upgrade */}
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-neutral-500">剩余积分</span>
              <Button
                size="sm"
                className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                onClick={() => toast.info("打开升级页面")}
              >
                升级
              </Button>
            </div>
            <div className="mb-2">
              <div className="mb-1 text-right text-xs font-medium text-neutral-900">
                0 剩余
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full w-[0%] bg-blue-600" />
              </div>
            </div>

            {/* User Card */}
            <button
              className="flex w-full items-center gap-2 rounded-lg bg-neutral-100 px-2 py-2 transition-colors hover:bg-neutral-200"
              onClick={handleUserSettings}
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-medium text-white">
                W
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-medium text-neutral-900">
                  Wang Eva
                </div>
                <div className="text-[10px] text-neutral-500">Free</div>
              </div>
              <Settings className="size-3.5 shrink-0 text-neutral-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel - Separate Floating Card */}
      {showSettings && (
        <>
          {/* Settings Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/20"
            onClick={() => setShowSettings(false)}
          />

          {/* Settings Card */}
          <div className="fixed left-2 bottom-2 z-[70] w-[240px] rounded-2xl border bg-white p-3 shadow-xl">
            {/* User Info */}
            <div className="mb-3 flex items-center gap-2 pb-3 border-b">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-medium text-white">
                W
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-900">
                  Wang Eva
                </div>
                <div className="truncate text-xs text-neutral-500">
                  wangxiuzi19890403@gmail...
                </div>
              </div>
            </div>

            {/* Settings Menu Items */}
            <div className="space-y-0.5">
              <button
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-neutral-700 transition-colors hover:bg-neutral-100"
                onClick={() => {
                  toast.info("打开设置");
                  setShowSettings(false);
                }}
              >
                <Settings className="size-4 text-neutral-500" />
                <span>设置</span>
              </button>

              <button
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-neutral-700 transition-colors hover:bg-neutral-100"
                onClick={() => {
                  toast.info("打开个人主页");
                  setShowSettings(false);
                }}
              >
                <User className="size-4 text-neutral-500" />
                <span>个人主页</span>
              </button>

              <button
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-neutral-700 transition-colors hover:bg-neutral-100"
                onClick={() => {
                  toast.info("套餐与积分");
                  setShowSettings(false);
                }}
              >
                <Heart className="size-4 text-neutral-500" />
                <span>套餐与积分</span>
              </button>

              <button
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-neutral-700 transition-colors hover:bg-neutral-100"
                onClick={() => {
                  toast.info("打开帮助中心");
                  setShowSettings(false);
                }}
              >
                <HelpCircle className="size-4 text-neutral-500" />
                <span>帮助中心</span>
              </button>

              <button
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-neutral-700 transition-colors hover:bg-neutral-100"
                onClick={() => {
                  toast.info("打开兑换");
                  setShowSettings(false);
                }}
              >
                <Gift className="size-4 text-neutral-500" />
                <span>兑换</span>
              </button>
            </div>

            {/* Theme Settings */}
            <div className="mt-3 pt-3 border-t">
              <div className="mb-2 px-2 text-xs text-neutral-500">
                偏好设置
              </div>
              <div className="mb-2 px-2 text-xs font-medium text-neutral-700">
                主题
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1">
                <button
                  className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1.5 text-xs transition-colors ${
                    theme === "system"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                  onClick={() => handleThemeChange("system")}
                >
                  <Monitor className="size-3.5" />
                </button>
                <button
                  className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1.5 text-xs transition-colors ${
                    theme === "light"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                  onClick={() => handleThemeChange("light")}
                >
                  <Sun className="size-3.5" />
                </button>
                <button
                  className={`flex flex-1 items-center justify-center gap-1 rounded px-2 py-1.5 text-xs transition-colors ${
                    theme === "dark"
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                  onClick={() => handleThemeChange("dark")}
                >
                  <Moon className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Logout */}
            <button
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-red-600 transition-colors hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              <span>退出登录</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}