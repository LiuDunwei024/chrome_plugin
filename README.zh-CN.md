# Competitor Analysis

Shopify 竞争情报工具，适用于商品研究与目录分析。

## 项目概览

Competitor Analysis 是一款 Chrome 扩展，旨在帮助团队在浏览器中快速了解 Shopify 店铺的竞争信息。它会检测当前页面是否为 Shopify 商店，分析店铺特征，并在轻量化分析抽屉中直接展示商品目录数据。

该工具适用于竞争对手研究、目录基准分析和快速商品发现，能够在不离开当前页面的情况下完成大部分调研工作。

## 为什么值得使用

电商团队常常需要快速回答以下问题：

- 这个网站是否基于 Shopify？
- 它可能使用了什么主题和应用？
- 它卖了哪些产品，价格如何？
- 哪些目录信号表明该店铺的商品策略和营销方式？

Competitor Analysis 能在浏览过程中直接提供这些线索，让调研流程更高效、更自然。

## 核心功能

### 1. Shopify 商店识别

扩展会检查页面中的 Shopify 特征，包括：

- `window.Shopify`
- Shopify CDN 引用
- Shopify 主题元数据
- 店铺 cookies 和内嵌脚本

一旦识别成功，系统会记录域名、检测信号、主题名称和登录状态，以便后续分析。

### 2. 店铺画像分析

项目会识别店铺特征，例如：

- 主题信息
- 常见 Shopify 应用和集成服务
- 商店登录状态信号
- 可用于做竞争评估的店铺级元数据

### 3. 商品目录分析

扩展会从以下位置提取商品数据：

- `/products.json`
- `/collections/*/products.json`
- 当公开 JSON 接口不可用或信息不完整时，回退到页面 DOM 结构解析

它还会补充以下信息：

- 商品标题和 handle
- 价格与对比价
- 图片和变体
- 评分和评价数据（如可用）
- 徽章、版型、颜色等页面级商品信号

### 4. 搜索与对比体验

扩展内嵌分析抽屉，支持：

- 商品搜索
- 最畅销 / 最新排序
- 商品汇总与元数据查看
- 请求失败时的重试与错误处理
- CSV 导出，便于后续分析与报告

## 工作流

该扩展的典型使用流程如下：

1. 在 Chrome 中打开 Shopify 店铺页面。
2. 触发扩展分析抽屉。
3. 确认该页面已被识别为 Shopify 商店。
4. 查看目录信息、产品卡片和店铺数据。
5. 进行搜索、排序并导出结果用于研究或汇报。

## 技术架构

该项目基于 Chrome 扩展架构，由内容脚本和后台工具协同工作：

```text
src/
├── background.ts
├── popup.tsx
├── components/
├── contents/
│   ├── ShopifyDrawer.tsx
│   ├── csv-export.ts
│   ├── page-watcher.ts
│   ├── product-extractor.ts
│   ├── product-sorting.ts
│   ├── shopify-detector.tsx
│   ├── site-profile.ts
│   ├── types.ts
│   └── ...
├── lib/
└── ...
```

## 技术栈

- React + TypeScript
- Plasmo 用于 Chrome 扩展开发
- Tailwind CSS 用于界面样式
- Chrome 扩展 API 用于消息通信和浏览器集成

## 快速开始

### 环境要求

- Node.js 18+
- npm
- Chrome 浏览器

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

这会启动 Plasmo 开发服务器，并生成 Chrome 可用的开发版本构建。

### 在 Chrome 中加载扩展

1. 打开 `chrome://extensions`
2. 启用开发者模式
3. 点击 Load unpacked
4. 选择生成的目录，通常为 `build/chrome-mv3-dev`

### 生产构建

```bash
npm run build
```

### 打包扩展

```bash
npm run package
```

## 项目结构

```text
.
├── src/
│   ├── background.ts
│   ├── popup.tsx
│   ├── components/
│   └── contents/
│       ├── ShopifyDrawer.tsx
│       ├── csv-export.ts
│       ├── page-watcher.ts
│       ├── product-extractor.ts
│       ├── product-sorting.ts
│       ├── shopify-detector.tsx
│       ├── site-profile.ts
│       ├── types.ts
│       └── ...
├── build/
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── README.md
├── README.zh-CN.md
├── assets/
└── ...
```

## 说明

- 本扩展用于 Shopify 店铺分析，依赖公开店铺结构和页面模式。
- 由于主题、安装应用和店铺设置不同，部分元数据可能存在差异。
- 当 Shopify JSON 接口无法访问时，扩展会回退到页面标记和集合页数据解析。

## 开发说明

项目的核心逻辑主要集中在 `src/contents/` 中：

- `shopify-detector.tsx` — 店铺识别与消息注册
- `site-profile.ts` — 主题与应用识别、登录状态检测
- `product-extractor.ts` — 商品抓取与 DOM 提取
- `product-sorting.ts` — 商品排序逻辑
- `csv-export.ts` — CSV 导出支持
- `ShopifyDrawer.tsx` — 主要分析 UI

## 许可证

该项目作为竞争对手研究和店铺分析的内部工具持续维护。
