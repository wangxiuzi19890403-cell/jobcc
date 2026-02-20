import { useState } from "react";
import { useParams } from "react-router";
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
} from "lucide-react";
import { mockAgents, mockTeams } from "../data/mock-data";
import { mockKnowledgeBase } from "../data/mock-knowledge-base";
import { Message, Agent } from "../types";
import { FileNode } from "../types/knowledge-base";
import { KnowledgeBase } from "../components/knowledge-base";
import { UserInterventionCard } from "../components/user-intervention-card";
import { Github } from "lucide-react";
import { toast } from "sonner";

interface WorkingAgent {
  agent: Agent;
  status: "waiting" | "working" | "completed";
  messages: Message[];
}

export function WorkspacePage() {
  const { projectId } = useParams();
  const [input, setInput] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [knowledgeFiles, setKnowledgeFiles] = useState<FileNode[]>(mockKnowledgeBase);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(true);
  const [selectedKnowledgeFiles, setSelectedKnowledgeFiles] = useState<Set<string>>(new Set());
  
  // Mock data for demonstration
  const team = mockTeams[0];
  const [workingAgents, setWorkingAgents] = useState<WorkingAgent[]>(([
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

  const handleSend = () => {
    if (input.trim() && currentAgent) {
      // Add user message
      setInput("");
    }
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
    { 
      id: "1", 
      name: "财务数据分析.xlsx", 
      type: "data", 
      icon: FileText,
      createdBy: mockAgents[0].name,
      createdByAvatar: mockAgents[0].avatar,
    },
    { 
      id: "2", 
      name: "月度报告初稿.docx", 
      type: "document", 
      icon: FileText,
      createdBy: mockAgents[1].name,
      createdByAvatar: mockAgents[1].avatar,
    },
    { 
      id: "3", 
      name: "数据可视化图表.png", 
      type: "image", 
      icon: ImageIcon,
      createdBy: mockAgents[0].name,
      createdByAvatar: mockAgents[0].avatar,
    },
    { 
      id: "4", 
      name: "财报文案v1.pdf", 
      type: "document", 
      icon: FileText,
      createdBy: mockAgents[1].name,
      createdByAvatar: mockAgents[1].avatar,
    },
  ];

  const handleFileSelect = (file: FileNode) => {
    console.log("Selected file:", file);
  };

  return (
    <div className="flex h-full relative">
      {/* Left Sidebar - Knowledge Base (Collapsible) */}
      {showKnowledgeBase && (
        <div className="w-72 border-r bg-white">
          <KnowledgeBase 
            files={knowledgeFiles}
            onFilesChange={setKnowledgeFiles}
            onFileSelect={handleFileSelect}
            selectedFiles={selectedKnowledgeFiles}
            onSelectionChange={setSelectedKnowledgeFiles}
          />
        </div>
      )}
      
      {/* Toggle Button */}
      <button
        onClick={() => setShowKnowledgeBase(!showKnowledgeBase)}
        className="absolute left-0 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 bg-white shadow-sm transition-all hover:bg-neutral-50"
        style={{ left: showKnowledgeBase ? '288px' : '0px' }}
      >
        {showKnowledgeBase ? (
          <ChevronLeft className="size-4 text-neutral-600" />
        ) : (
          <ChevronRight className="size-4 text-neutral-600" />
        )}
      </button>

      {/* Main Content - Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Team Header */}
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

            {/* 右侧：员工标签（紧凑横向布局） */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
              {workingAgents.map((wa) => (
                <button
                  key={wa.agent.id}
                  onClick={() => setSelectedAgent(wa.agent.id)}
                  className={`group relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 transition-all ${
                    selectedAgent === wa.agent.id || (!selectedAgent && wa === workingAgents[0])
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-md"
                      : "bg-neutral-50 hover:bg-neutral-100 border border-neutral-200"
                  }`}
                >
                  {/* 头像 */}
                  <div className="relative">
                    <div className={`flex size-7 items-center justify-center rounded-full text-sm transition-all ${
                      selectedAgent === wa.agent.id || (!selectedAgent && wa === workingAgents[0])
                        ? "bg-white/90"
                        : "bg-gradient-to-br from-blue-50 to-purple-50"
                    }`}>
                      {wa.agent.avatar}
                    </div>
                    {/* 状态指示器 */}
                    {wa.status === "working" && (
                      <div className="absolute -right-0.5 -top-0.5">
                        <span className="relative flex size-2.5">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex size-2.5 rounded-full bg-green-500 ring-1 ring-white"></span>
                        </span>
                      </div>
                    )}
                    {wa.status === "completed" && (
                      <div className="absolute -right-0.5 -top-0.5">
                        <div className="flex size-2.5 items-center justify-center rounded-full bg-blue-500 ring-1 ring-white">
                          <Check className="size-1.5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 员工名称 */}
                  <span className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedAgent === wa.agent.id || (!selectedAgent && wa === workingAgents[0])
                      ? "text-white"
                      : "text-neutral-700"
                  }`}>
                    {wa.agent.name}
                  </span>

                  {/* 选中指示器 */}
                  {(selectedAgent === wa.agent.id || (!selectedAgent && wa === workingAgents[0])) && (
                    <div className="absolute -bottom-0.5 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-white"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 bg-neutral-50 p-6">
          {currentAgent?.messages.length === 0 ? (
            <div className="flex h-full items-center justify-center px-8">
              <div className="w-full max-w-2xl">
                {/* Waiting Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-orange-50 mb-4">
                    <Clock className="size-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {currentAgent?.agent.name} 等待前序任务完成
                  </h3>
                  <p className="text-sm text-neutral-500">
                    预计 5 分钟后开始工作
                  </p>
                </div>

                {/* Current Agent Waiting Card */}
                <Card className="p-4 border-orange-200 bg-orange-50">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
                      <Clock className="size-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-neutral-900">
                          {currentAgent?.agent.name} - 等待中
                        </h4>
                        <Badge variant="outline" className="bg-white text-xs">
                          预计 5 分钟后
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600 mb-3">
                        等待内容撰写完成后进行质量审核和优化建议
                      </p>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-neutral-700 mb-1">
                          预计工作内容：
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-neutral-600">
                            <div className="size-1.5 rounded-full bg-orange-400"></div>
                            <span>审核文案质量与准确性</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-600">
                            <div className="size-1.5 rounded-full bg-orange-400"></div>
                            <span>检查数据引用的正确性</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-600">
                            <div className="size-1.5 rounded-full bg-orange-400"></div>
                            <span>提供优化建议和修改意见</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Team Stats */}
                <Card className="mt-6 p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-neutral-500" />
                      <span className="text-sm font-medium text-neutral-700">团队协作进度</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">67% 完成</span>
                  </div>
                  <div className="mt-3 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: '67%' }}></div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                    <span>1 已完成 · 1 进行中 · 1 等待中</span>
                    <span>预计总时长 10 分钟</span>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentAgent?.messages.map((message, index) => {
                // Check if this thinking message is completed (has messages after it)
                const isThinkingCompleted = message.type === "thinking" && 
                  index < currentAgent.messages.length - 1;

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

                // Summary card for completed agent
                if (message.type === "summary") {
                  return (
                    <Card key={message.id} className="p-4 border-green-200 bg-green-50">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                          <CheckCircle2 className="size-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-neutral-900">
                              {message.agentName} - 已完成
                            </h4>
                            <Badge variant="outline" className="bg-white text-xs">
                              2 分钟前
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-600 mb-2">
                            完成了数据收集、清洗和分析工作
                          </p>
                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <div className="flex items-center gap-1">
                              <FileCheck className="size-3" />
                              <span>生成 2 个文件</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="size-3" />
                              <span>分析准确率 95%</span>
                            </div>
                          </div>
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
            </div>
          )}
        </ScrollArea>

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
          
          <div className="mb-2 text-xs text-neutral-500">
            当前与 <span className="font-medium text-neutral-700">{currentAgent?.agent.name}</span> 对话
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

      {/* Right Sidebar - Output */}
      <div className="w-96 border-l bg-white">
        <Tabs defaultValue="artifacts" className="flex h-full flex-col">
          <div className="border-b px-4">
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

          <TabsContent value="artifacts" className="flex-1 overflow-auto p-4 mt-0">
            <div className="mb-4">
              <h3 className="font-medium text-neutral-900">项目中的文件</h3>
              <p className="text-xs text-neutral-500">AI 员工生成的所有文件</p>
            </div>

            <div className="space-y-2">
              {artifacts.map((artifact) => {
                const Icon = artifact.icon;
                return (
                  <Card key={artifact.id} className="group p-3 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start gap-3">
                      {/* 文件图标 */}
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Icon className="size-5 text-blue-600" />
                      </div>
                      
                      {/* 文件信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium text-neutral-900">
                          {artifact.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 text-[10px]">
                            {artifact.createdByAvatar}
                          </div>
                          <span className="text-xs text-neutral-500">
                            {artifact.createdBy}
                          </span>
                          <span className="text-xs text-neutral-400">·</span>
                          <span className="text-xs text-neutral-400">2分钟前</span>
                        </div>
                      </div>

                      {/* 操作按钮组 */}
                      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* @ 引用按钮 */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            const mention = `@${artifact.name} `;
                            setInput((prev) => prev + mention);
                            toast.success(`已引用 ${artifact.name}`);
                          }}
                          title="引用文件"
                        >
                          <span className="text-sm font-medium text-neutral-600">@</span>
                        </Button>

                        {/* 下载按钮 */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success(`正在下载 ${artifact.name}`);
                          }}
                          title="下载文件"
                        >
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </Button>

                        {/* 删除按钮 */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:bg-red-50 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`确定要删除 ${artifact.name} 吗？`)) {
                              toast.success(`已删除 ${artifact.name}`);
                            }
                          }}
                          title="删除文件"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
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
    </div>
  );
}