import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { mockAgents, mockTeams } from "../data/mock-data";
import { Agent } from "../types";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Search,
  X,
  Sparkles,
  Users,
  Check,
  Info,
  AlertCircle,
  TrendingUp,
  Briefcase,
  Code,
  Palette,
  Target,
  Shield,
  FileText,
  Plus,
  ChevronDown,
  ChevronUp,
  Upload,
  MoreVertical,
  Trash2,
  Edit2,
  File,
  Folder,
  ChevronRight,
  FolderPlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

// 真实职位维度的分类
const jobCategories = [
  { id: "all", label: "全部", icon: Users },
  { id: "data-analyst", label: "数据分析师", icon: TrendingUp },
  { id: "content-writer", label: "内容创作者", icon: FileText },
  { id: "designer", label: "设计师", icon: Palette },
  { id: "engineer", label: "工程师", icon: Code },
  { id: "product-manager", label: "产品经理", icon: Target },
  { id: "pr-specialist", label: "公关专家", icon: Shield },
];

// 团队图标选项
const teamIcons = ["📊", "✍️", "🎨", "💻", "🎯", "📷", "🎵", "📝", "🛡️", "📁"];

export function TalentMarketPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const teamId = searchParams.get("teamId");
  const isEditMode = !!teamId;

  // 左侧团队配置状态
  const [teamIcon, setTeamIcon] = useState("📁");
  const [teamName, setTeamName] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 右侧筛选状态
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 确认对话框状态
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // 知识库状态
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(true);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [files, setFiles] = useState([
    { id: "1", name: "产品需求文档.pdf", size: "2.4 MB", uploadedAt: "2024-01-15", type: "file" as const, parentId: null },
    { id: "2", name: "用户研究报告.docx", size: "1.8 MB", uploadedAt: "2024-01-14", type: "file" as const, parentId: null },
    { id: "3", name: "竞品分析.xlsx", size: "856 KB", uploadedAt: "2024-01-13", type: "file" as const, parentId: null },
  ]);
  const [folders, setFolders] = useState([
    { id: "f1", name: "产品文档", createdAt: "2024-01-10", expanded: true },
    { id: "f2", name: "设计资源", createdAt: "2024-01-12", expanded: false },
  ]);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renamingFileName, setRenamingFileName] = useState("");
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renamingFolderName, setRenamingFolderName] = useState("");

  // 从团队数据加载（编辑模式）
  useEffect(() => {
    if (isEditMode && teamId) {
      const team = mockTeams.find((t) => t.id === teamId);
      if (team) {
        setTeamIcon(team.thumbnail);
        setTeamName(team.name);
        setSelectedAgents(team.agents);
        toast.success(`已加载团队：${team.name}`);
      }
    }
  }, [isEditMode, teamId]);

  // 监听变更
  useEffect(() => {
    if (isEditMode && (teamName || selectedAgents.length > 0)) {
      setHasUnsavedChanges(true);
    }
  }, [teamName, selectedAgents, isEditMode]);

  // AI生成团队名称
  const handleAIGenerateName = () => {
    if (selectedAgents.length === 0) {
      toast.error("请先添加团队成员");
      return;
    }

    toast.success("AI正在分析团队能力...");
    
    setTimeout(() => {
      // 基于成员能力生成名称
      const skills = selectedAgents
        .flatMap((a) => a.skills)
        .slice(0, 3)
        .join("、");
      const generatedName = `${skills}专业组`;
      setTeamName(generatedName);
      toast.success("团队名称已生成！");
    }, 1000);
  };

  // 添加成员
  const handleAddAgent = (agent: Agent) => {
    if (selectedAgents.find((a) => a.id === agent.id)) {
      toast.error("该员工已在团队中");
      return;
    }

    setSelectedAgents([...selectedAgents, agent]);
    toast.success(`已添加 ${agent.name}`);
    setHasUnsavedChanges(true);
  };

  // 移除成员
  const handleRemoveAgent = (agentId: string) => {
    const agent = selectedAgents.find((a) => a.id === agentId);
    setSelectedAgents(selectedAgents.filter((a) => a.id !== agentId));
    if (agent) {
      toast.success(`已移除 ${agent.name}`);
    }
    setHasUnsavedChanges(true);
  };

  // 保存团队
  const handleSaveTeam = () => {
    if (!teamName.trim()) {
      toast.error("请输入团队名称");
      return;
    }
    if (selectedAgents.length === 0) {
      toast.error("请至少添加一位员工");
      return;
    }

    if (isEditMode) {
      toast.success(`团队 "${teamName}" 已更新！`);
    } else {
      toast.success(`团队 "${teamName}" 创建成功！`);
    }
    
    setHasUnsavedChanges(false);
    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  // 取消/返回
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      navigate("/");
    }
  };

  // 确认不保存
  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
    navigate("/");
  };

  // 知识库处理函数
  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.md";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const uploadedFiles = Array.from(target.files || []);
      uploadedFiles.forEach((file) => {
        const newFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          uploadedAt: new Date().toISOString().split("T")[0],
          type: "file" as const,
          parentId: null,
        };
        setFiles((prev) => [...prev, newFile]);
        toast.success(`已上传 ${file.name}`);
      });
    };
    input.click();
  };

  const handleDeleteFile = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    setFiles(files.filter((f) => f.id !== fileId));
    if (file) {
      toast.success(`已删除 ${file.name}`);
    }
  };

  const handleStartRename = (fileId: string, currentName: string) => {
    setRenamingFileId(fileId);
    setRenamingFileName(currentName);
  };

  const handleSaveRename = (fileId: string) => {
    if (!renamingFileName.trim()) {
      toast.error("文件名不能为空");
      return;
    }
    setFiles(
      files.map((f) =>
        f.id === fileId ? { ...f, name: renamingFileName } : f
      )
    );
    toast.success("重命名成功");
    setRenamingFileId(null);
    setRenamingFileName("");
  };

  const handleCancelRename = () => {
    setRenamingFileId(null);
    setRenamingFileName("");
  };

  // 文件夹处理函数
  const handleCreateFolder = () => {
    const newFolder = {
      id: "f" + Date.now().toString(),
      name: "新文件夹",
      createdAt: new Date().toISOString().split("T")[0],
      expanded: true,
    };
    setFolders((prev) => [...prev, newFolder]);
    toast.success("已创建新文件夹");
    // 自动进入重命名模式
    setTimeout(() => {
      handleStartFolderRename(newFolder.id, newFolder.name);
    }, 100);
  };

  const handleToggleFolder = (folderId: string) => {
    setFolders(
      folders.map((f) =>
        f.id === folderId ? { ...f, expanded: !f.expanded } : f
      )
    );
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    // 删除文件夹时，也删除其中的文件
    const filesInFolder = files.filter((f) => f.parentId === folderId);
    if (filesInFolder.length > 0) {
      toast.error(`文件夹中有 ${filesInFolder.length} 个文件，请先清空`);
      return;
    }
    setFolders(folders.filter((f) => f.id !== folderId));
    if (folder) {
      toast.success(`已删除文件夹 ${folder.name}`);
    }
  };

  const handleStartFolderRename = (folderId: string, currentName: string) => {
    setRenamingFolderId(folderId);
    setRenamingFolderName(currentName);
  };

  const handleSaveFolderRename = (folderId: string) => {
    if (!renamingFolderName.trim()) {
      toast.error("文件夹名不能为空");
      return;
    }
    setFolders(
      folders.map((f) =>
        f.id === folderId ? { ...f, name: renamingFolderName } : f
      )
    );
    toast.success("重命名成功");
    setRenamingFolderId(null);
    setRenamingFolderName("");
  };

  const handleCancelFolderRename = () => {
    setRenamingFolderId(null);
    setRenamingFolderName("");
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(fileSearchQuery.toLowerCase())
  );

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(fileSearchQuery.toLowerCase())
  );

  const getFilesInFolder = (folderId: string) =>
    files.filter(
      (file) =>
        file.parentId === folderId &&
        file.name.toLowerCase().includes(fileSearchQuery.toLowerCase())
    );

  const getRootFiles = () =>
    files.filter(
      (file) =>
        file.parentId === null &&
        file.name.toLowerCase().includes(fileSearchQuery.toLowerCase())
    );

  // 筛选员工
  const filteredAgents = mockAgents.filter((agent) => {
    // 搜索匹配
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // 分类匹配（简单示例，实际应该有更复杂的映射）
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "data-analyst" && agent.name.includes("数据")) ||
      (selectedCategory === "content-writer" && agent.name.includes("文案")) ||
      (selectedCategory === "designer" && agent.name.includes("设计")) ||
      (selectedCategory === "engineer" && agent.name.includes("工程")) ||
      (selectedCategory === "product-manager" && agent.name.includes("产品")) ||
      (selectedCategory === "pr-specialist" && agent.name.includes("公关"));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full bg-neutral-50">
      {/* 左侧 - 团队配置 */}
      <div className="w-[400px] border-r bg-white flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-5">
          <h1 className="text-lg font-semibold text-neutral-900">
            {isEditMode ? "编辑团队" : "创建团队"}
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            从右侧选择AI员工组建团队
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* 团队图标选择 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                团队图标
              </label>
              <div className="flex flex-wrap gap-2">
                {teamIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => {
                      setTeamIcon(icon);
                      setHasUnsavedChanges(true);
                    }}
                    className={`flex size-12 items-center justify-center rounded-lg border-2 text-2xl transition-all hover:border-blue-400 ${
                      teamIcon === icon
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-neutral-200 bg-white"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* 团队名称 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                团队名称
              </label>
              <div className="flex gap-2">
                <Input
                  value={teamName}
                  onChange={(e) => {
                    setTeamName(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="例如：财报组"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAIGenerateName}
                  title="AI智能生成团队名称"
                >
                  <Sparkles className="size-4 text-blue-600" />
                </Button>
              </div>
            </div>

            {/* 团队成员 */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                团队成员 ({selectedAgents.length})
              </label>

              {/* AI分析提示 */}
              {selectedAgents.length > 0 && (
                <div className="mb-3 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
                  <Info className="size-4 shrink-0 text-blue-600 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    添加的员工会通过AI自动分析执行逻辑和顺序
                  </p>
                </div>
              )}

              {/* 空状态 */}
              {selectedAgents.length === 0 ? (
                <Card className="border-2 border-dashed p-8 text-center">
                  <Users className="mx-auto size-12 text-neutral-300" />
                  <h3 className="mt-3 text-sm font-medium text-neutral-900">
                    尚未添加成员
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    从右侧人才市场选择合适的AI员工
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    点击员工卡片即可添加到团队
                  </p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {selectedAgents.map((agent, index) => (
                    <Card
                      key={agent.id}
                      className="p-3 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        {/* 序号 + 头像 */}
                        <div className="relative">
                          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 text-xl border-2 border-white shadow-sm">
                            {agent.avatar}
                          </div>
                          <div className="absolute -top-1 -left-1 flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                            {index + 1}
                          </div>
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-neutral-900 mb-0.5">
                            {agent.name}
                          </div>
                          <div className="text-xs text-neutral-500 mb-2">
                            {agent.title}
                          </div>
                          {/* Skills 标签 */}
                          <div className="flex flex-wrap gap-1">
                            {agent.skills.slice(0, 3).map((skill, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-[10px] px-2 py-0 h-5"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {agent.skills.length > 3 && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-2 py-0 h-5"
                              >
                                +{agent.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* 删除按钮 */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveAgent(agent.id)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* 知识库模块 */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    📚 知识库
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    为团队添加参考文档
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setKnowledgeExpanded(!knowledgeExpanded)}
                >
                  {knowledgeExpanded ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                </Button>
              </div>

              {knowledgeExpanded && (
                <div className="space-y-3">
                  {/* 搜索框 */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                      value={fileSearchQuery}
                      onChange={(e) => setFileSearchQuery(e.target.value)}
                      placeholder="搜索文件..."
                      className="pl-9 h-9 text-xs"
                    />
                  </div>

                  {/* 上传按钮 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFileUpload}
                      className="flex-1 h-9 text-xs"
                    >
                      <Upload className="mr-2 size-3.5" />
                      上传文件
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateFolder}
                      className="flex-1 h-9 text-xs"
                    >
                      <FolderPlus className="mr-2 size-3.5" />
                      新建文件夹
                    </Button>
                  </div>

                  {/* 文件和文件夹列表 */}
                  {filteredFiles.length === 0 && filteredFolders.length === 0 ? (
                    <Card className="border-2 border-dashed p-6 text-center">
                      <File className="mx-auto size-8 text-neutral-300" />
                      <p className="mt-2 text-xs text-neutral-500">
                        {fileSearchQuery
                          ? "未找到匹配的文件或文件夹"
                          : "暂无文件，点击上传或创建文件夹"}
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {/* 渲染文件夹 */}
                      {filteredFolders.map((folder) => {
                        const filesInFolder = getFilesInFolder(folder.id);
                        return (
                          <div key={folder.id}>
                            {/* 文件夹卡片 */}
                            <Card className="group relative p-3 transition-all hover:shadow-sm hover:border-blue-300">
                              <div className="flex items-start gap-2">
                                {/* 展开/收起图标 */}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-5 shrink-0"
                                  onClick={() => handleToggleFolder(folder.id)}
                                >
                                  <ChevronRight
                                    className={`size-3.5 transition-transform ${
                                      folder.expanded ? "rotate-90" : ""
                                    }`}
                                  />
                                </Button>

                                <Folder className="size-4 shrink-0 text-amber-500 mt-0.5" />

                                <div className="flex-1 min-w-0">
                                  {renamingFolderId === folder.id ? (
                                    <div className="flex gap-1">
                                      <Input
                                        value={renamingFolderName}
                                        onChange={(e) =>
                                          setRenamingFolderName(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            handleSaveFolderRename(folder.id);
                                          } else if (e.key === "Escape") {
                                            handleCancelFolderRename();
                                          }
                                        }}
                                        className="h-6 text-xs flex-1"
                                        autoFocus
                                      />
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-6"
                                        onClick={() =>
                                          handleSaveFolderRename(folder.id)
                                        }
                                      >
                                        <Check className="size-3 text-green-600" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-6"
                                        onClick={handleCancelFolderRename}
                                      >
                                        <X className="size-3 text-red-600" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="text-xs font-medium text-neutral-900 truncate">
                                      {folder.name} ({filesInFolder.length})
                                    </div>
                                  )}
                                </div>

                                {/* 更多操作按钮 - hover显示 */}
                                {renamingFolderId !== folder.id && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <MoreVertical className="size-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleStartFolderRename(
                                            folder.id,
                                            folder.name
                                          )
                                        }
                                      >
                                        <Edit2 className="mr-2 size-3.5" />
                                        <span className="text-xs">重命名</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDeleteFolder(folder.id)
                                        }
                                        className="text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="mr-2 size-3.5" />
                                        <span className="text-xs">删除</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </Card>

                            {/* 文件夹内的文件 - 展开时显示 */}
                            {folder.expanded && filesInFolder.length > 0 && (
                              <div className="ml-7 mt-1 space-y-1">
                                {filesInFolder.map((file) => (
                                  <Card
                                    key={file.id}
                                    className="group relative p-2.5 transition-all hover:shadow-sm hover:border-blue-300"
                                  >
                                    <div className="flex items-start gap-2">
                                      <File className="size-3.5 shrink-0 text-blue-600 mt-0.5" />
                                      <div className="flex-1 min-w-0">
                                        {renamingFileId === file.id ? (
                                          <div className="flex gap-1">
                                            <Input
                                              value={renamingFileName}
                                              onChange={(e) =>
                                                setRenamingFileName(
                                                  e.target.value
                                                )
                                              }
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  handleSaveRename(file.id);
                                                } else if (e.key === "Escape") {
                                                  handleCancelRename();
                                                }
                                              }}
                                              className="h-5 text-xs flex-1"
                                              autoFocus
                                            />
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="size-5"
                                              onClick={() =>
                                                handleSaveRename(file.id)
                                              }
                                            >
                                              <Check className="size-3 text-green-600" />
                                            </Button>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              className="size-5"
                                              onClick={handleCancelRename}
                                            >
                                              <X className="size-3 text-red-600" />
                                            </Button>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="text-xs font-medium text-neutral-900 truncate">
                                              {file.name}
                                            </div>
                                            <div className="text-[10px] text-neutral-500">
                                              {file.size}
                                            </div>
                                          </>
                                        )}
                                      </div>

                                      {/* 更多操作按钮 - hover显示 */}
                                      {renamingFileId !== file.id && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="size-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <MoreVertical className="size-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleStartRename(
                                                  file.id,
                                                  file.name
                                                )
                                              }
                                            >
                                              <Edit2 className="mr-2 size-3.5" />
                                              <span className="text-xs">
                                                重命名
                                              </span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleDeleteFile(file.id)
                                              }
                                              className="text-red-600 focus:text-red-600"
                                            >
                                              <Trash2 className="mr-2 size-3.5" />
                                              <span className="text-xs">
                                                删除
                                              </span>
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* 渲染根目录文件 */}
                      {getRootFiles().map((file) => (
                        <Card
                          key={file.id}
                          className="group relative p-3 transition-all hover:shadow-sm hover:border-blue-300"
                        >
                          <div className="flex items-start gap-2">
                            <File className="size-4 shrink-0 text-blue-600 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              {renamingFileId === file.id ? (
                                <div className="flex gap-1">
                                  <Input
                                    value={renamingFileName}
                                    onChange={(e) =>
                                      setRenamingFileName(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        handleSaveRename(file.id);
                                      } else if (e.key === "Escape") {
                                        handleCancelRename();
                                      }
                                    }}
                                    className="h-6 text-xs flex-1"
                                    autoFocus
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-6"
                                    onClick={() => handleSaveRename(file.id)}
                                  >
                                    <Check className="size-3 text-green-600" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-6"
                                    onClick={handleCancelRename}
                                  >
                                    <X className="size-3 text-red-600" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <div className="text-xs font-medium text-neutral-900 truncate">
                                    {file.name}
                                  </div>
                                  <div className="text-[10px] text-neutral-500 mt-0.5">
                                    {file.size} • {file.uploadedAt}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* 更多操作按钮 - hover显示 */}
                            {renamingFileId !== file.id && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="size-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStartRename(file.id, file.name)
                                    }
                                  >
                                    <Edit2 className="mr-2 size-3.5" />
                                    <span className="text-xs">重命名</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteFile(file.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 size-3.5" />
                                    <span className="text-xs">删除</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* 底部操作栏 */}
        <div className="border-t bg-white p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              取消
            </Button>
            <Button onClick={handleSaveTeam} className="flex-1">
              {isEditMode ? "保存更改" : "保存团队配置"}
            </Button>
          </div>
        </div>
      </div>

      {/* 右侧 - 人才市场 */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-white px-6 py-5">
          <h2 className="text-lg font-semibold text-neutral-900">人才市场</h2>
          <p className="mt-1 text-xs text-neutral-500">
            按职位筛选，点击卡片添加到团队
          </p>
        </div>

        {/* 筛选栏 */}
        <div className="border-b bg-white px-6 py-4 space-y-4">
          {/* 搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索员工名称、职位或技能..."
              className="pl-10"
            />
          </div>

          {/* 职位分类 Tab */}
          <div className="flex flex-wrap gap-2">
            {jobCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Badge
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  className="cursor-pointer gap-1.5 px-3 py-1.5"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="size-3" />
                  {category.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* 员工列表 */}
        <ScrollArea className="flex-1 bg-neutral-50">
          <div className="p-6">
            {filteredAgents.length === 0 ? (
              <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-neutral-100">
                    <Search className="size-8 text-neutral-400" />
                  </div>
                  <h3 className="mt-4 font-medium text-neutral-900">
                    未找到匹配的员工
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    尝试调整搜索条件或选择其他职位分类
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {filteredAgents.map((agent) => {
                  const isInTeam = selectedAgents.some(
                    (a) => a.id === agent.id
                  );

                  return (
                    <Card
                      key={agent.id}
                      className={`p-4 transition-all ${
                        isInTeam
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                          : "hover:border-neutral-300 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 text-2xl border-2 border-white shadow-sm">
                          {agent.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm text-neutral-900 truncate">
                              {agent.name}
                            </h3>
                            {isInTeam && (
                              <Check className="size-4 text-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-neutral-600 truncate">
                            {agent.title}
                          </p>
                        </div>
                      </div>

                      {/* Skills 标签 */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {agent.skills.slice(0, 4).map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[10px] px-2 py-0 h-5"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {agent.skills.length > 4 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-2 py-0 h-5"
                          >
                            +{agent.skills.length - 4}
                          </Badge>
                        )}
                      </div>

                      {/* 描述 */}
                      <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                        {agent.description}
                      </p>

                      {/* 底部信息 */}
                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <Users className="size-3" />
                          <span>{agent.hireCount.toLocaleString()} 次雇佣</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] h-5">
                          {agent.baseModel}
                        </Badge>
                      </div>

                      {/* 添加按钮 */}
                      <Button
                        onClick={() => handleAddAgent(agent)}
                        disabled={isInTeam}
                        className="mt-3 w-full h-8 text-xs"
                        variant={isInTeam ? "secondary" : "default"}
                      >
                        {isInTeam ? (
                          <>
                            <Check className="mr-1 size-3" />
                            已在团队中
                          </>
                        ) : (
                          <>
                            <Plus className="mr-1 size-3" />
                            添加到团队
                          </>
                        )}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 确认对话框 */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 text-orange-600" />
              确认离开？
            </AlertDialogTitle>
            <AlertDialogDescription>
              你有未保存的更改。离开此页面将丢失所有修改，是否确认离开？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>返回编辑</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              确认离开
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}