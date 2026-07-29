import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vibe PPT | 对话生成演示",
    template: "%s | Vibe PPT",
  },
  description: "从一句想法到一份能讲清楚的演示。对话生成、画布编辑、PPTX 导出。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
