import { Plus } from "lucide-react";
import { Button } from "./ui/button";

export default function CreateNewAgentButton() {
  return (
    <Button 
      variant={"default"} 
      className="bg-blue-600 hover:bg-blue-500 text-white relative overflow-hidden group transition-all duration-300 transform rounded-full px-6 py-3 w-full"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="wave-animation-before absolute inset-0 bg-blue-400 opacity-10"></div>
      </div>
      <div className="relative z-10 flex items-center">
        <Plus className="transition-transform group-hover:rotate-90 duration-300" />
        <span className="ml-2">创建专属角色</span>
      </div>
    </Button>
  );
}