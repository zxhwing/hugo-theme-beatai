+++
title = "Getting Started"
weight = 1
description = "快速了解这个主题的结构和设计思路。"
+++

## 主题目标

这个主题不是复制 `BeatAI` 的技术实现，而是迁移它的阅读体验：

- 左侧固定导航
- 右侧页内目录
- 冷静的浅色配色
- 对长文档友好的排版节奏

## 如何使用

把主题放到 Hugo 项目的 `themes/hugo-theme-beatai`，然后在站点配置里声明：

```toml
theme = "hugo-theme-beatai"
```

## 你应该优先改什么

如果你想做成“你自己的主题”，建议先改这三部分：

1. `assets/css/main.css` 里的颜色变量
2. `layouts/partials/header.html` 的品牌区
3. `layouts/_default/single.html` 的文章头部结构

## 下一步

当你的内容规模起来以后，再考虑补这些能力：

- 多级侧边栏
- 深浅主题切换
- 评论系统
- 搜索
