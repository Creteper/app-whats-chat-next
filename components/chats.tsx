import { cn } from "@/lib/utils";

export function ChatLayOut({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("w-full h-full", className)} {...props}>
      {children}
    </div>
  );
}

export type ChatContentProps = React.ComponentProps<"div"> & {
  src: string;
  variant?: "friends" | "me"
  name?: string
  time?: string
  
};

export function ChatContent({
  src,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & ChatContentProps) {

}
