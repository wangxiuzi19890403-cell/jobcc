import { Agent } from "../types";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Check, TrendingUp } from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  onHire?: (agent: Agent) => void;
  compact?: boolean;
}

export function AgentCard({ agent, onHire, compact = false }: AgentCardProps) {
  if (compact) {
    return (
      <Card className="flex items-center gap-3 p-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-purple-50 text-xl">
          {agent.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-neutral-900">{agent.name}</div>
          <div className="text-xs text-neutral-500 truncate">{agent.title}</div>
        </div>
        {agent.hired && (
          <Check className="size-4 text-green-600" />
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 text-3xl">
          {agent.avatar}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-neutral-900">{agent.name}</h3>
              <p className="text-sm text-neutral-500">{agent.title}</p>
            </div>
            {agent.hired ? (
              <Badge variant="secondary" className="gap-1">
                <Check className="size-3" />
                已雇佣
              </Badge>
            ) : (
              <Button size="sm" onClick={() => onHire?.(agent)}>
                雇佣
              </Button>
            )}
          </div>

          <p className="mt-3 text-sm text-neutral-600 line-clamp-2">
            {agent.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {agent.skills.slice(0, 4).map((skill) => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {agent.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{agent.skills.length - 4}
              </Badge>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {agent.capabilities.slice(0, 4).map((cap) => (
              <div key={cap.label} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600">{cap.label}</span>
                    <span className="font-medium text-neutral-900">{cap.value}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${cap.value}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <TrendingUp className="size-3" />
              <span>{agent.hireCount?.toLocaleString()} 次雇佣</span>
            </div>
            <div>模型: {agent.baseModel}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
