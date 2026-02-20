export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  mimeType?: string;
  createdAt: Date;
  modifiedAt: Date;
  children?: FileNode[];
  parentId?: string;
  selected?: boolean;
  expanded?: boolean;
}

export interface KnowledgeBaseAction {
  type: "upload" | "rename" | "delete" | "move" | "download" | "preview";
  files: FileNode[];
}
