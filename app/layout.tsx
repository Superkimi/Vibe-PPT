import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aihubhub.com"),
  title: {
    default: "Vibe PPT | 对话生成演示",
    template: "%s | Vibe PPT",
  },
  description: "从一句想法到一份能讲清楚的演示。对话生成、画布编辑、PPTX 导出。",
  alternates: { canonical: "/vibe-ppt" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/vibe-ppt",
    siteName: "Vibe PPT",
    title: "Vibe PPT | 对话生成演示",
    description: "从一句想法到一份能讲清楚的演示。对话生成、画布编辑、PPTX 导出。",
    images: [
      {
        url: "/vibe-ppt/images/presentation-editorial.png",
        width: 1536,
        height: 1024,
        alt: "Vibe PPT 演示设计工作台",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vibe PPT | 对话生成演示",
    description: "对话生成、画布编辑、PPTX 导出。",
    images: ["/vibe-ppt/images/presentation-editorial.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
