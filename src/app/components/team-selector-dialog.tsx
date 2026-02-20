import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Users, Check } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Team {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  subtitle: string;
  members: Array<{
    id: string;
    avatar: string;
    name: string;
  }>;
  status: string;
  statusColor: string;
}

interface TeamSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: Team[];
  onSelectTeam: (team: Team) => void;
}

export function TeamSelectorDialog({
  open,
  onOpenChange,
  teams,
  onSelectTeam,
}: TeamSelectorDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTeam = (team: Team) => {
    setSelectedTeamId(team.id);
  };

  const handleConfirm = () => {
    const selectedTeam = teams.find((t) => t.id === selectedTeamId);
    if (selectedTeam) {
      onSelectTeam(selectedTeam);
      onOpenChange(false);
      setSelectedTeamId(null);
      setSearchQuery("");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedTeamId(null);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5" />
            呼叫团队
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="搜索团队名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Teams List */}
        <div className="max-h-[400px] space-y-2 overflow-y-auto">
          {filteredTeams.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              没有找到相关团队
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div
                key={team.id}
                className={`group cursor-pointer rounded-lg border p-4 transition-all hover:border-blue-300 hover:bg-blue-50 ${
                  selectedTeamId === team.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-neutral-200"
                }`}
                onClick={() => handleSelectTeam(team)}
              >
                <div className="flex items-start gap-4">
                  {/* Team Icon */}
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${team.iconBg}`}
                  >
                    <span className={`text-2xl ${team.iconColor}`}>
                      {team.icon}
                    </span>
                  </div>

                  {/* Team Info */}
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="font-semibold text-neutral-900">
                        {team.name}
                      </h3>
                      <Badge className={`${team.statusColor} border-0 text-white`}>
                        {team.status}
                      </Badge>
                    </div>
                    <p className="mb-3 text-xs text-neutral-500">
                      {team.subtitle}
                    </p>

                    {/* Members */}
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="size-7 overflow-hidden rounded-full border-2 border-white shadow-sm"
                            title={member.name}
                          >
                            <ImageWithFallback
                              src={member.avatar}
                              alt={member.name}
                              className="size-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-neutral-500">
                        {team.members.length} 名成员
                      </span>
                    </div>
                  </div>

                  {/* Check Icon */}
                  {selectedTeamId === team.id && (
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-500">
                      <Check className="size-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedTeamId}>
            确认呼叫
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
