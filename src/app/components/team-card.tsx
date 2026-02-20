import { Team } from "../types";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowRight, Users } from "lucide-react";

interface TeamCardProps {
  team: Team;
  onStart?: (team: Team) => void;
}

const workflowTypeLabels = {
  sequential: "流水线",
  parallel: "脑暴组",
  adversarial: "对抗组",
};

export function TeamCard({ team, onStart }: TeamCardProps) {
  return (
    <Card className="p-5 hover:shadow-lg transition-shadow group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-pink-50 text-2xl">
            {team.thumbnail}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900">{team.name}</h3>
            <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
              {team.description}
            </p>
            
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {workflowTypeLabels[team.workflowType]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {team.scenario}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Users className="size-3" />
                <span>{team.agents.length} 位员工</span>
              </div>
            </div>

            <div className="mt-3 flex -space-x-2">
              {team.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-50 to-purple-50 text-sm"
                  title={agent.name}
                >
                  {agent.avatar}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button 
          size="sm" 
          onClick={() => onStart?.(team)}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          开始
          <ArrowRight className="ml-1 size-4" />
        </Button>
      </div>
    </Card>
  );
}
