export interface Agent {
  id: string;
  name: string;
  avatar: string;
  title: string;
  skills: string[];
  description: string;
  baseModel: string;
  capabilities: {
    label: string;
    value: number;
  }[];
  hired: boolean;
  salary?: number;
  hireCount?: number;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
  workflowType: "sequential" | "parallel" | "adversarial";
  scenario: string;
  thumbnail?: string;
}

export interface Project {
  id: string;
  name: string;
  team: Team;
  createdAt: Date;
  status: "active" | "completed" | "paused";
  messages: Message[];
  artifacts: Artifact[];
}

export interface Message {
  id: string;
  agentId: string;
  agentName: string;
  avatar: string;
  content: string;
  timestamp: Date;
  type: "thinking" | "result" | "user" | "system" | "summary" | "progress" | "intervention";
  artifacts?: string[];
  interventionData?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    primaryAction: {
      label: string;
      action: string;
    };
    secondaryAction?: {
      label: string;
      action: string;
    };
  };
}

export interface Artifact {
  id: string;
  name: string;
  type: "document" | "image" | "code" | "data";
  url: string;
  createdBy: string;
  createdAt: Date;
}