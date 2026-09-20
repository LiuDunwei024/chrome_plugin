# Competitor Analysis

Shopify 竞争情报工具，用于产品研究、目录分析及跨店铺对比。

## 1. 项目概览

Competitor Analysis 是一款面向 Shopify 生态的 Chrome 扩展，旨在帮助团队在浏览器中直接获取竞争对手店铺的关键商业信息。它能够识别当前页面是否为 Shopify 商店，分析店铺特征，并在轻量化抽屉式界面中展示商品目录与相关指标，支持快速做竞争分析和市场调研。

该工具适用于电商运营、商品分析、跨店铺研究和市场情报整理，能够在不离开当前页面的情况下完成核心信息收集与评估。

## 2. 解决的问题

在电商分析场景中，团队通常需要快速回答以下问题：

- 当前页面是否为 Shopify 商店？
- 该店铺可能使用了哪些主题、应用与集成组件？
- 其主要商品结构、价格带和上架策略是什么？
- 商品目录中是否存在可参考的营销、定价或结构化信号？

Competitor Analysis 通过前台页面检测与后台数据补全，将这些信息整合在同一工作流中，显著降低调研成本。

## 3. 核心功能

### 3.1 Shopify 商店识别

扩展会对页面进行 Shopify 特征识别，重点检查以下信号：

- `window.Shopify`
- Shopify CDN 引用
- Shopify 主题元数据
- 店铺 cookies 与内嵌脚本

一旦检测到 Shopify 环境，系统会记录域名、识别信号、主题名称和登录状态，用于后续分析与展示。

### 3.2 店铺画像分析

项目支持识别店铺的关键属性，包括：

- 主题信息
- 常见 Shopify 应用与集成组件
- 登录状态信号
- 可用于对比分析的店铺级元数据

这些信息有助于快速判断店铺技术栈和运营方式，从而提高竞争评估效率。

### 3.3 商品目录分析

扩展会从以下来源拉取商品数据：

- `/products.json`
- `/collections/*/products.json`
- 当公开 JSON 接口受限或信息不完整时，回退至页面结构解析

并结合页面和商品级元数据进行补充，包括：

- 商品标题与 handle
- 价格与对比价
- 图片和商品变体
- 评分与评价信息（如可用）
- 徽章、颜色、版型等页面级卖点信号

### 3.4 搜索与对比体验

扩展内置分析抽屉，支持：

- 商品搜索
- 按“最畅销 / 最新”进行排序
- 目录汇总与商品详情查看
- 请求失败时重试与错误处理
- CSV 导出，便于后续整理和分析

## 4. 使用流程

该扩展的典型使用流程如下：

1. 在 Chrome 中打开目标 Shopify 店铺页面。
2. 触发扩展分析抽屉。
3. 验证当前页面已被识别为 Shopify 商店。
4. 查看店铺画像、商品目录和相关元数据。
5. 进行搜索、排序，并导出结果以支持分析或汇报。

## 5. 技术架构

该项目基于 Chrome 扩展标准架构，采用内容脚本与后台协作方式进行信息提取与交互：

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

## 6. 技术栈

- React + TypeScript
- Plasmo：用于 Chrome 扩展开发
- Tailwind CSS：用于界面样式
- Chrome Extension API：用于消息通信与浏览器集成

## 7. 快速开始

### 7.1 环境要求

- Node.js 18+
- npm
- Chrome 浏览器

### 7.2 安装依赖

```bash
npm install
```

### 7.3 开发模式运行

```bash
npm run dev
```

此命令会启动 Plasmo 开发服务器，并生成可供 Chrome 调试的开发版扩展。

### 7.4 在 Chrome 中加载扩展

1. 打开 `chrome://extensions`
2. 启用 Developer mode
3. 点击 Load unpacked
4. 选择生成的开发目录，通常为 `build/chrome-mv3-dev`

### 7.5 生产构建

```bash
npm run build
```

### 7.6 打包扩展

```bash
npm run package
```

## 8. 项目结构

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

## 9. 说明与限制

- 本扩展用于 Shopify 店铺分析，依赖公开店铺结构和页面模式。
- 由于主题、安装应用以及店铺配置不同，部分元数据可能存在差异。
- 当 Shopify JSON 接口不可用时，扩展会回退到页面结构解析与集合页数据抽取。

## 10. 开发说明

项目的核心逻辑主要位于 `src/contents/` 目录中：

- `shopify-detector.tsx`：店铺识别与消息注册
- `site-profile.ts`：主题与应用识别，以及登录状态检测
- `product-extractor.ts`：商品抓取与 DOM 提取逻辑
- `product-sorting.ts`：商品排序实现
- `csv-export.ts`：CSV 导出支持
- `ShopifyDrawer.tsx`：主要分析界面

## 11. 许可证

本项目作为竞争对手研究和店铺分析的内部工具持续维护与迭代。
