import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Search,
  Plus,
  X,
  Sparkles,
  Brain,
  TrendingUp,
  Users,
  Target,
  Edit2,
  Check,
  Trash2,
  ArrowLeftRight,
  AlertCircle,
} from "lucide-react";
import { mockAgents } from "../data/mock-data";
import { Agent } from "../types";
import { toast } from "sonner";

interface TeamEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string | null;
}

const agentCategories = [
  { id: "all", name: "全部", icon: Sparkles },
  { id: "analysis", name: "数据分析", icon: TrendingUp },
  { id: "content", name: "内容创作", icon: Brain },
  { id: "management", name: "项目管理", icon: Target },
  { id: "collaboration", name: "团队协作", icon: Users },
];

export function TeamEditDialog({
  open,
  onOpenChange,
  teamId,
}: TeamEditDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isEditingName, setIsEditingName] = useState(false);
  const [replacingMemberId, setReplacingMemberId] = useState<string | null>(null);

  // Get team info from teamId (in a real app, this would fetch from API)
  const teamInfo = teamId
    ? {
        id: teamId,
        name:
          teamId === "team-daily-report"
            ? "财报组"
            : teamId === "team-xiaohongshu"
              ? "小红书运营组"
              : teamId === "team-tiktok"
                ? "TikTok 视频组"
                : "未知团队",
        icon:
          teamId === "team-daily-report"
            ? "📊"
            : teamId === "team-xiaohongshu"
              ? "📷"
              : teamId === "team-tiktok"
                ? "🎵"
                : "📁",
        memberIds:
          teamId === "team-daily-report"
            ? ["1", "2", "3"]
            : teamId === "team-xiaohongshu"
              ? ["4", "5", "6"]
              : teamId === "team-tiktok"
                ? ["7", "8"]
                : [],
      }
    : null;

  const [teamName, setTeamName] = useState(teamInfo?.name || "");
  const [teamMembers, setTeamMembers] = useState<Agent[]>(
    teamInfo
      ? mockAgents.filter((agent) =>
          teamInfo.memberIds.includes(agent.id),
        )
      : [],
  );

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      agent.role
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAddMember = (agent: Agent) => {
    if (teamMembers.find((m) => m.id === agent.id)) {
      toast.error("该员工已在团队中");
      return;
    }
    setTeamMembers([...teamMembers, agent]);
    toast.success(`已添加 ${agent.name}`);
  };

  const handleRemoveMember = (agentId: string) => {
    const agent = teamMembers.find((m) => m.id === agentId);
    setTeamMembers(teamMembers.filter((m) => m.id !== agentId));
    if (agent) {
      toast.success(`已移除 ${agent.name}`);
    }
  };

  const handleReplaceMember = (newAgent: Agent) => {
    if (!replacingMemberId) return;

    const oldAgent = teamMembers.find((m) => m.id === replacingMemberId);
    const index = teamMembers.findIndex((m) => m.id === replacingMemberId);
    
    if (index !== -1) {
      const newMembers = [...teamMembers];
      newMembers[index] = newAgent;
      setTeamMembers(newMembers);
      toast.success(`已将 ${oldAgent?.name} 替换为 ${newAgent.name}`);
      setReplacingMemberId(null);
    }
  };

  const handleSaveTeamName = () => {
    if (teamName.trim()) {
      setIsEditingName(false);
      toast.success("团队名称已更新");
    } else {
      toast.error("团队名称不能为空");
    }
  };

  const handleSave = () => {
    if (teamMembers.length === 0) {
      toast.error("团队至少需要一名成员");
      return;
    }
    toast.success("团队配置已保存");
    onOpenChange(false);
  };

  const replacingMember = replacingMemberId 
    ? teamMembers.find((m) => m.id === replacingMemberId)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1400px] h-[90vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {teamInfo ? `编辑团队：${teamName}` : "编辑团队"}
          </DialogTitle>
          <DialogDescription>
            管理团队成员，从人才市场选择 AI 员工加入团队
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-full">
          {/* Left Side - Current Team Members */}
          <div className="w-[420px] flex flex-col border-r bg-white">
            {/* Team Header */}
            <div className="border-b px-6 py-5">
              <div className="flex items-start gap-3 mb-4">
                {teamInfo && (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-3xl">
                    {teamInfo.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="h-9"
                        placeholder="输入团队名称"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveTeamName();
                          }
                          if (e.key === "Escape") {
                            setIsEditingName(false);
                            setTeamName(teamInfo?.name || "");
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-9 p-0 shrink-0"
                        onClick={handleSaveTeamName}
                      >
                        <Check className="size-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-9 p-0 shrink-0"
                        onClick={() => {
                          setIsEditingName(false);
                          setTeamName(teamInfo?.name || "");
                        }}
                      >
                        <X className="size-4 text-neutral-400" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-neutral-900 truncate">
                        {teamName}
                      </h2>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-8 p-0 shrink-0"
                        onClick={() => setIsEditingName(true)}
                        title="编辑团队名称"
                      >
                        <Edit2 className="size-4 text-neutral-400 hover:text-neutral-600" />
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-neutral-500 mt-1">
                    {teamMembers.length === 0
                      ? "还没有团队成员"
                      : `当前有 ${teamMembers.length} 名成员`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                    style={{ width: `${Math.min((teamMembers.length / 10) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-neutral-500">
                  {teamMembers.length}/10
                </span>
              </div>
            </div>

            {/* Replacing Mode Banner */}
            {replacingMemberId && replacingMember && (
              <div className="border-b bg-orange-50 px-6 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="size-4 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-900">
                    替换模式
                  </span>
                </div>
                <p className="text-xs text-orange-700 mb-2">
                  正在替换：<span className="font-medium">{replacingMember.name}</span>
                </p>
                <p className="text-xs text-orange-600">
                  请从右侧人才市场选择新员工
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full h-7 text-xs"
                  onClick={() => setReplacingMemberId(null)}
                >
                  取消替换
                </Button>
              </div>
            )}

            {/* Current Members List */}
            <div className="flex-1 overflow-hidden">
              <div className="px-6 py-4 bg-neutral-50">
                <h3 className="text-sm font-semibold text-neutral-700">
                  团队成员列表
                </h3>
              </div>
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="px-6 py-4 space-y-3">
                  {teamMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-neutral-100">
                        <Users className="size-10 text-neutral-300" />
                      </div>
                      <p className="text-sm font-medium text-neutral-900 mb-1">
                        还没有团队成员
                      </p>
                      <p className="text-xs text-neutral-500 max-w-[200px]">
                        从右侧人才市场选择 AI 员工加入团队
                      </p>
                    </div>
                  ) : (
                    teamMembers.map((member, index) => (
                      <Card 
                        key={member.id} 
                        className={`p-4 transition-all border-2 ${
                          replacingMemberId === member.id 
                            ? "border-orange-400 bg-orange-50 shadow-lg ring-2 ring-orange-200" 
                            : "border-neutral-200 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="relative">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 text-xl border border-neutral-100">
                              {member.avatar}
                            </div>
                            <div className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                              {index + 1}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-neutral-900 mb-0.5 truncate">
                              {member.name}
                            </h4>
                            <p className="text-xs text-neutral-600 mb-2 truncate">
                              {member.role}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {member.skills.slice(0, 2).map((skill, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-[10px] px-2 py-0 h-5"
                                >
                                  {skill}
                                </Badge>
                              ))}
                              {member.skills.length > 2 && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-2 py-0 h-5"
                                >
                                  +{member.skills.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          {replacingMemberId === member.id ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs border-orange-400 text-orange-700 hover:bg-orange-100"
                              onClick={() => setReplacingMemberId(null)}
                            >
                              取消替换
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs"
                              onClick={() => setReplacingMemberId(member.id)}
                              disabled={!!replacingMemberId}
                            >
                              <ArrowLeftRight className="mr-1.5 size-3.5" />
                              替换
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={!!replacingMemberId}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Bottom Actions */}
            <div className="border-t bg-white px-6 py-5">
              <div className="space-y-2">
                <Button
                  onClick={handleSave}
                  disabled={teamMembers.length === 0 || !!replacingMemberId}
                  className="w-full h-11 font-medium"
                  size="lg"
                >
                  保存团队配置
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="w-full h-10"
                  disabled={!!replacingMemberId}
                >
                  取消
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Talent Marketplace */}
          <div className="flex-1 flex flex-col bg-neutral-50">
            {/* Marketplace Header */}
            <div className="border-b bg-white px-8 py-5">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-lg font-semibold text-neutral-900">
                    🎯 人才市场
                  </h2>
                  {replacingMemberId && (
                    <Badge variant="default" className="bg-orange-600">
                      替换模式
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-neutral-500">
                  {replacingMemberId 
                    ? "选择一名员工替换当前成员" 
                    : "浏览并选择适合的 AI 员工加入您的团队"}
                </p>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索员工姓名、职位或技能..."
                  className="pl-9 h-10"
                />
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {agentCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="shrink-0 h-9"
                    >
                      <Icon className="mr-2 size-4" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Agents Grid */}
            <ScrollArea className="flex-1">
              <div className="p-8">
                <div className="grid grid-cols-2 gap-5">
                  {filteredAgents.map((agent) => {
                    const isInTeam = teamMembers.some(
                      (m) => m.id === agent.id,
                    );
                    const isReplacingTarget = replacingMemberId === agent.id;
                    const canSelect = !isInTeam || isReplacingTarget;
                    
                    return (
                      <Card
                        key={agent.id}
                        className={`p-5 transition-all ${
                          isReplacingTarget
                            ? "border-orange-400 bg-orange-50 shadow-md ring-2 ring-orange-200"
                            : isInTeam
                            ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-100"
                            : "hover:border-neutral-300 hover:shadow-lg bg-white"
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Avatar */}
                          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 text-3xl border-2 border-white shadow-sm">
                            {agent.avatar}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base text-neutral-900 mb-1 truncate">
                              {agent.name}
                            </h3>
                            <p className="text-sm text-neutral-600 mb-3 truncate">
                              {agent.role}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {agent.skills.slice(0, 3).map((skill, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-[11px] px-2 py-0.5 h-5"
                                >
                                  {skill}
                                </Badge>
                              ))}
                              {agent.skills.length > 3 && (
                                <Badge
                                  variant="secondary"
                                  className="text-[11px] px-2 py-0.5 h-5"
                                >
                                  +{agent.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                            <div>
                              {replacingMemberId ? (
                                // 替换模式
                                isReplacingTarget ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full h-9 text-sm border-orange-400 text-orange-700"
                                    disabled
                                  >
                                    当前要替换的成员
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="w-full h-9 text-sm bg-orange-600 hover:bg-orange-700"
                                    onClick={() => handleReplaceMember(agent)}
                                  >
                                    <ArrowLeftRight className="mr-2 size-4" />
                                    选择替换
                                  </Button>
                                )
                              ) : (
                                // 正常模式
                                isInTeam ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full h-9 text-sm border-blue-300 text-blue-700 hover:bg-blue-100"
                                    onClick={() => handleRemoveMember(agent.id)}
                                  >
                                    <Check className="mr-2 size-4" />
                                    已在团队
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="w-full h-9 text-sm"
                                    onClick={() => handleAddMember(agent)}
                                  >
                                    <Plus className="mr-2 size-4" />
                                    添加到团队
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Empty State */}
                {filteredAgents.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-neutral-100">
                      <Search className="size-10 text-neutral-300" />
                    </div>
                    <p className="text-sm font-medium text-neutral-900 mb-1">
                      没有找到匹配的员工
                    </p>
                    <p className="text-xs text-neutral-500">
                      试试其他搜索关键词或分类
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
