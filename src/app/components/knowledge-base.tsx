import { useState, useRef } from "react";
import { Link } from "react-router";
import { FileNode } from "../types/knowledge-base";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown,
  Upload,
  Search,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  MoreVertical,
  FolderPlus,
  Eye,
  Download,
} from "lucide-react";
import { formatFileSize, formatDate, getFileIcon } from "../utils/file-utils";
import { toast } from "sonner";
import { cn } from "./ui/utils";

interface KnowledgeBaseProps {
  files: FileNode[];
  onFilesChange?: (files: FileNode[]) => void;
  onFileSelect?: (file: FileNode) => void;
  selectedFiles?: Set<string>;
  onSelectionChange?: (files: Set<string>) => void;
  /** 工作台内使用时传入，点击「收起」会关闭知识库侧栏，不影响 Logo 返回首页 */
  onClosePanel?: () => void;
}

export function KnowledgeBase({ files, onFilesChange, onFileSelect, selectedFiles, onSelectionChange, onClosePanel }: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["folder-1"]));
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // Toggle file selection
  const toggleSelection = (fileId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    const next = new Set(selectedFiles);
    if (next.has(fileId)) {
      next.delete(fileId);
    } else {
      next.add(fileId);
    }
    onSelectionChange?.(next);
  };

  // Select all files in a folder
  const selectAllInFolder = (node: FileNode) => {
    const ids = new Set<string>();
    
    function collectIds(n: FileNode) {
      ids.add(n.id);
      if (n.children) {
        n.children.forEach(collectIds);
      }
    }
    
    collectIds(node);
    onSelectionChange?.(ids);
    toast.success(`已选中 ${ids.size} 个项目`);
  };

  // Clear selection
  const clearSelection = () => {
    onSelectionChange?.(new Set());
  };

  // Start renaming
  const startRename = (node: FileNode) => {
    setRenamingId(node.id);
    setNewName(node.name);
  };

  // Confirm rename
  const confirmRename = () => {
    if (renamingId && newName.trim()) {
      toast.success("重命名成功");
      setRenamingId(null);
      setNewName("");
    }
  };

  // Delete files
  const handleDelete = (ids: string[]) => {
    toast.success(`已删除 ${ids.length} 个项目`);
    onSelectionChange?.(new Set());
  };

  // Upload files
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      toast.success(`已上传 ${uploadedFiles.length} 个文件`);
      setUploadDialogOpen(false);
    }
  };

  // Upload folder
  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      toast.success(`已上传文件夹，包含 ${uploadedFiles.length} 个文件`);
      setUploadDialogOpen(false);
    }
  };

  // Create new folder
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      toast.success(`已创建文件夹 "${newFolderName}"`);
      setNewFolderName("");
      setCreateFolderDialogOpen(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      toast.success(`已添加 ${droppedFiles.length} 个文件`);
    }
  };

  // Filter files based on search
  const filterNodes = (nodes: FileNode[]): FileNode[] => {
    if (!searchQuery) return nodes;
    
    return nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (node.type === "folder" && node.children) {
        const filteredChildren = filterNodes(node.children);
        return matchesSearch || filteredChildren.length > 0;
      }
      return matchesSearch;
    }).map(node => {
      if (node.type === "folder" && node.children) {
        return { ...node, children: filterNodes(node.children) };
      }
      return node;
    });
  };

  // Render file tree node
  const renderNode = (node: FileNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedFiles?.has(node.id);
    const isRenaming = renamingId === node.id;

    return (
      <div key={node.id}>
        <div
          className={cn(
            "group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors cursor-pointer relative",
            isSelected && "bg-blue-50 border border-blue-200",
            !isSelected && "hover:bg-neutral-100"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (node.type === "folder" && !isRenaming) {
              toggleFolder(node.id);
            } else if (!isRenaming) {
              onFileSelect?.(node);
            }
          }}
        >
          {/* Checkbox */}
          <div
            className="flex size-4 shrink-0 items-center justify-center"
            onClick={(e) => toggleSelection(node.id, e)}
          >
            <div className={cn(
              "size-4 rounded border-2 transition-all",
              isSelected 
                ? "border-blue-600 bg-blue-600 text-white" 
                : "border-neutral-300 group-hover:border-neutral-400"
            )}>
              {isSelected && <Check className="size-3" />}
            </div>
          </div>

          {/* Folder expand icon */}
          {node.type === "folder" && (
            <div className="shrink-0">
              {isExpanded ? (
                <ChevronDown className="size-4 text-neutral-500" />
              ) : (
                <ChevronRight className="size-4 text-neutral-500" />
              )}
            </div>
          )}

          {/* Icon */}
          <div className="shrink-0 text-base">
            {node.type === "folder" ? (
              <Folder className="size-4 text-blue-600" />
            ) : (
              <span>{getFileIcon(node.mimeType)}</span>
            )}
          </div>

          {/* Name */}
          {isRenaming ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmRename();
                if (e.key === "Escape") setRenamingId(null);
              }}
              onBlur={confirmRename}
              className="h-6 flex-1 text-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 truncate text-sm text-neutral-700">
              {node.name}
            </span>
          )}

          {/* File info */}
          {node.type === "file" && !isRenaming && (
            <span className="text-xs text-neutral-400 opacity-0 group-hover:opacity-100">
              {formatFileSize(node.size || 0)}
            </span>
          )}

          {/* Children count for folders */}
          {node.type === "folder" && node.children && !isRenaming && (
            <Badge variant="secondary" className="text-xs opacity-0 group-hover:opacity-100">
              {node.children.length}
            </Badge>
          )}

          {/* More Actions Menu */}
          {!isRenaming && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded hover:bg-neutral-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-4 text-neutral-500" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete([node.id]);
                  }}
                  variant="destructive"
                >
                  <Trash2 className="size-4" />
                  移除来源
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    startRename(node);
                  }}
                >
                  <Edit2 className="size-4" />
                  重命名来源
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Children */}
        {node.type === "folder" && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredFiles = filterNodes(files);
  const selectedCount = selectedFiles?.size || 0;

  return (
    <div className={cn(
      "flex h-full flex-col transition-all duration-300",
      collapsed ? "w-12" : "w-full"
    )}>
      {/* Header：Logo 仅返回首页，知识库标题+箭头 仅收起/展开，互不干扰 */}
      <div className={cn(
        "shrink-0 border-b p-4",
        collapsed && !onClosePanel ? "space-y-0" : "space-y-3"
      )}>
        <div className="flex items-center justify-between gap-2">
          {(!collapsed || onClosePanel) && (
            <>
              <Link
                to="/"
                className="flex shrink-0 items-center gap-2 rounded-md transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                title="返回首页"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-base text-white shrink-0">
                  🤖
                </div>
                {(!collapsed || onClosePanel) && (
                  <span className="font-semibold text-neutral-900 truncate">Jobcc</span>
                )}
              </Link>
              {!collapsed && (
                <div className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
                  <h3 className="font-medium text-neutral-900">知识库</h3>
                  <p className="text-xs text-neutral-500">参考文献与资料</p>
                </div>
              )}
              {onClosePanel ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClosePanel(); }}
                  className="shrink-0 rounded-lg"
                  title="收起知识库"
                  aria-label="收起知识库"
                >
                  <ChevronDown className="size-4 rotate-[-90deg]" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                  className={collapsed ? "mx-auto" : ""}
                >
                  {collapsed ? (
                    <ChevronRight className="size-4" />
                  ) : (
                    <ChevronDown className="size-4 rotate-[-90deg]" />
                  )}
                </Button>
              )}
            </>
          )}
          {collapsed && !onClosePanel && (
            <>
              <Link
                to="/"
                className="flex shrink-0 items-center justify-center rounded-md transition-opacity hover:opacity-80"
                title="返回首页"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-base text-white">
                  🤖
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(false)}
                className="mx-auto shrink-0"
                title="展开知识库"
              >
                <ChevronRight className="size-4" />
              </Button>
            </>
          )}
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文件..."
              className="h-8 pl-8 text-sm"
            />
          </div>
        )}
      </div>

      {/* File tree */}
      {!collapsed && (
        <ScrollArea className="flex-1">
          <div
            className="p-2 space-y-0.5"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {filteredFiles.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center">
                <Folder className="size-12 text-neutral-300" />
                <p className="mt-2 text-sm text-neutral-500">
                  {searchQuery ? "未找到匹配的文件" : "暂无文件"}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  点击 + 按钮或拖拽文件到此处
                </p>
              </div>
            ) : (
              filteredFiles.map(node => renderNode(node))
            )}
          </div>
        </ScrollArea>
      )}

      {/* Footer actions */}
      {!collapsed && (
        <div className="shrink-0 border-t p-3 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="mr-2 size-3" />
            上传文件
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => setCreateFolderDialogOpen(true)}
          >
            <FolderPlus className="mr-2 size-3" />
            新建文件夹
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传文件</DialogTitle>
            <DialogDescription>
              选择要上传的文件或文件夹
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              className="cursor-pointer rounded-lg border-2 border-dashed border-neutral-300 p-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto size-12 text-neutral-400" />
              <p className="mt-2 text-sm font-medium text-neutral-700">
                点击上传或拖拽文件到此处
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                支持所有常见文件格式
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-neutral-500">或</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => folderInputRef.current?.click()}
            >
              <FolderPlus className="mr-2 size-4" />
              上传整个文件夹
            </Button>

            <input
              ref={folderInputRef}
              type="file"
              {...({ webkitdirectory: "", directory: "" } as any)}
              multiple
              onChange={handleFolderUpload}
              className="hidden"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建文件夹</DialogTitle>
            <DialogDescription>
              输入文件夹名称
            </DialogDescription>
          </DialogHeader>

          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="文件夹名称"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
            }}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFolderDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}