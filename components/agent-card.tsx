import { cn } from "@/lib/utils";
import { type AgentItems } from "@/types/agent";

interface AgentCardProps extends React.ComponentProps<"div"> {
  agentItem: AgentItems;
}

export default function AgentCard({ agentItem, ...props }: AgentCardProps) {
  return (
    <div className={cn("border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow", props.className)}>
      <div className="font-semibold text-lg">{agentItem.nik_name}</div>
      <div className="text-sm text-gray-500 mt-1">ID: {agentItem.id}</div>
      <div className="text-sm mt-2 line-clamp-2">{agentItem.sl_intro || "暂无介绍"}</div>
    </div>
  );
}