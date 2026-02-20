import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { X, ExternalLink } from "lucide-react";

interface UserInterventionCardProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  primaryAction: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export function UserInterventionCard({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  onDismiss,
}: UserInterventionCardProps) {
  return (
    <Card className="border-neutral-200 bg-white shadow-sm">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon && <div className="text-neutral-700">{icon}</div>}
            <h4 className="font-medium text-sm text-neutral-900">{title}</h4>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mb-3">
          <Button
            onClick={primaryAction.onClick}
            size="sm"
            className="h-8 text-sm"
          >
            {primaryAction.label}
          </Button>
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              size="sm"
              className="h-8 text-sm text-neutral-600"
            >
              {secondaryAction.label}
              <ExternalLink className="ml-1 size-3" />
            </Button>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-neutral-500">{description}</p>
        )}
      </div>
    </Card>
  );
}
