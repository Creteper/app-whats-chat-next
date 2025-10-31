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
import { setClientUserInfo } from "@/lib/client-storage";
import { Input } from "@/components/ui/input";
import CyberChatAPI from "@/lib/cyberchat";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
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
      await setClientUserInfo(userInfo);
      
      // 只存储必要的用户信息到 cookies（避免 cookie 大小限制）
      try {
        // 只存储用户的基本信息，避免 cookie 过大
        const basicUserInfo = {
          uuid: userInfo[0]?.uuid,
          user_name: userInfo[0]?.user_name,
          // 只存储必要的字段
        };
        const encodedUserInfo = encodeURIComponent(JSON.stringify(basicUserInfo));
        document.cookie = `userInfo=${encodedUserInfo}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `userNameMd5=${cyberChatApi.userNameMd5}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `passWordMd5=${cyberChatApi.passWordMd5}; path=/; max-age=86400; SameSite=Lax`;
        console.log("成功设置 cookies");
      } catch (cookieError) {
        console.error("设置 cookies 失败:", cookieError);
      }

      toast.success("登录成功,欢迎回来 " + userInfo[0].user_name);
      router.push("/home");
    } catch (error: Error | any) {
      toast.error(error.message);
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
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="密码"
              required
            />
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
