# BeatAI Hugo Theme

一个以 `BeatAI` 阅读体验为蓝本的 Hugo 文档主题骨架。

## 设计提炼

从原项目里保留了这些特征：

- 左侧导航 + 右侧页内目录
- 偏浅色、冷色调、工程化但不死板的配色
- 适合长文阅读的留白和字号节奏
- 图片点击放大

没有直接照搬的部分：

- `mdBook` 的主题切换器
- `giscus` 评论集成
- `mdBook` 专属模板语法和导航机制

## 目录结构

- `layouts/`：页面模板
- `assets/css/main.css`：主题样式和色板
- `assets/js/theme.js`：移动端导航、TOC 高亮、图片放大
- `exampleSite/`：最小示例站点

## 本地使用

把这个目录放进你的 Hugo 项目的 `themes/hugo-theme-beatai`，然后在站点配置中启用：

```toml
theme = "hugo-theme-beatai"
```

如果你要先本地试运行，可以在装好 Hugo 后进入当前目录执行：

```bash
hugo server --source exampleSite --themesDir ..
```

## 建议的定制顺序

1. 修改 `assets/css/main.css` 的颜色和字体
2. 调整 `sidebar.html` 和 `header.html` 的品牌表达
3. 按你的内容结构重写 `single.html` 和 `list.html`
4. 再决定要不要补搜索、评论和暗色模式
