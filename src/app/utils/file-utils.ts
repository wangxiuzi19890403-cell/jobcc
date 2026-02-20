export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getFileIcon(mimeType?: string): string {
  if (!mimeType) return "📄";
  
  if (mimeType.includes("pdf")) return "📕";
  if (mimeType.includes("word")) return "📘";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) return "📊";
  if (mimeType.includes("image")) return "🖼️";
  if (mimeType.includes("video")) return "🎬";
  if (mimeType.includes("audio")) return "🎵";
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "🗜️";
  if (mimeType.includes("json")) return "📋";
  if (mimeType.includes("csv")) return "📈";
  if (mimeType.includes("text")) return "📝";
  
  return "📄";
}

export function getAllFiles(nodes: any[]): any[] {
  const files: any[] = [];
  
  function traverse(node: any) {
    if (node.type === "file") {
      files.push(node);
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }
  
  nodes.forEach(traverse);
  return files;
}

export function findNodeById(nodes: any[], id: string): any | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}
