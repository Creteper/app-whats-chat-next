"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import localforage from "localforage";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

const fadeVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
  },
};
export default function SettingsPage() {
  const [apiSetting, setApiSetting] = useState<string>("");

  useEffect(() => {
    async function getApi() {
      const value = await localforage.getItem("api_setting"); // 改用 await 更清晰
      if (value) {
        setApiSetting(value as string);
      }
    }
    getApi();
  }, []); // 移除 apiSetting 依赖，只在组件挂载时执行一次

  function setAPISetting(value: string) {
    localforage.setItem("api_setting", value);
  }

  return (
    <div className="px-6 w-full h-full">
      <div className="flex flex-col justify-center gap-4">
        <form className="w-full md:w-1/3">
          <FieldGroup>
            <FieldSet>
              <FieldLegend>系统设置</FieldLegend>
              <FieldDescription>Whats Chat 全局的系统设置</FieldDescription>
            </FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel>选择 AI 供应商</FieldLabel>
                <Select
                  value={apiSetting}
                  onValueChange={(value) => {
                    setAPISetting(value);
                    setApiSetting(value);
                  }}
                >
                  <SelectTrigger className="w-full md:w-1/3">
                    <SelectValue placeholder="选择 API" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">DeepSeek API</SelectItem>
                    <SelectItem value="cyberchat">CyberChat API</SelectItem>
                    <SelectItem value="custom">自定义 API</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            {apiSetting === "custom" && (
              <FieldGroup>
                {/* 添加带动画的自定义 API 区域 */}
                <motion.div
                  variants={fadeVariants}
                  initial="hidden"
                  animate={apiSetting === "custom" ? "visible" : "hidden"}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <FieldGroup>
                    <Field>
                      <FieldLabel>自定义 AI 供应商配置</FieldLabel>
                      <Input placeholder="API Key" className="mb-2" />
                      <Input placeholder="API URL" />
                    </Field>
                  </FieldGroup>
                </motion.div>
              </FieldGroup>
            )}
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
