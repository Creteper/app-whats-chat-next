"use client";

import Image from "next/image";
import Favicon from "@/public/favicon.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import localforage from "localforage";
import { Input } from "@/components/ui/input";
import CyberChatAPI from "@/lib/cyberchat";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const cyberChatApi = new CyberChatAPI();
      const res = await cyberChatApi.login({
        username: formData.get("email") as string,
        password: formData.get("password") as string,
      });

      if (res.code != 200) {
        throw new Error(res.message);
      }

      const userInfo = await cyberChatApi.getUserInfo();
      localforage.setItem("userInfo", userInfo);

      toast.success("登录成功,欢迎回来 " + userInfo[0].user_name)
      router.push("/home")

    } catch (error: Error | any) {
      toast.error(error.message)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <Image src={Favicon} alt="Whats Chat" className="h-12 w-12" />
              </div>
              <span className="sr-only">Whats Chat</span>
            </a>
            <h1 className="text-xl font-bold">欢迎回来 Whats Chat</h1>
            <FieldDescription>
              Don&apos;t have an account? <a href="#">暂时不支持注册</a>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="email">电子邮箱</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">密码</FieldLabel>
            <Input id="password" name="password" type="password" placeholder="密码" required />
          </Field>
          <Field>
            <Button type="submit">登录</Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Build By Creteper
      </FieldDescription>
    </div>
  );
}
