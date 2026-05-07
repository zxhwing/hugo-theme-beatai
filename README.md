# BeatAI Hugo Theme

一个以 `BeatAI` 阅读体验为蓝本的 Hugo 文档主题。

## 设计提炼

当前版本保留并补齐了这些特征：

- 左侧导航 + 右侧页内目录
- 偏浅色、冷色调、工程化但不死板的配色
- 适合长文阅读的留白和字号节奏
- 图片点击放大
- 多级侧边栏
- 上一页 / 下一页导航
- 深浅色模式切换
- taxonomy 页面骨架和基础 SEO meta
- 数学公式渲染
- FlexSearch 搜索页

没有直接照搬的部分：

- `mdBook` 的主题切换器
- `giscus` 评论集成
- `mdBook` 专属模板语法和导航机制

## 目录结构

- `layouts/`：页面模板
- `assets/css/main.css`：主题样式和色板
- `assets/js/theme.js`：移动端导航、TOC 高亮、图片放大
- `exampleSite/`：最小示例站点

## 数学公式

主题支持两种配置方式。

兼容旧写法：

```toml
[params]
  math = true
```

推荐新写法：

```toml
[params.math]
  enable = true
  engine = "katex" # or "mathjax"
```

内容层还需要启用 Goldmark passthrough，示例：

```toml
[markup]
  [markup.goldmark]
    [markup.goldmark.extensions.passthrough]
      enable = true

      [markup.goldmark.extensions.passthrough.delimiters]
        block = [['$$','$$'], ['\\[','\\]']]
        inline = [['$','$'], ['\\(','\\)']]
```

默认使用 `KaTeX`，适合大多数博客和文档站；如果需要更宽的 TeX 兼容性，可以改成 `MathJax`。

## 搜索

主题内置了 `FlexSearch` 搜索页模板，在 `hugo server` 下即可工作。

站点配置示例：

```toml
[params.search]
  enable = true
  provider = "flexsearch"
  placeholder = "Search notes, guides, and docs"
  indexURL = "/index.json"
  limit = 8
```

还需要确保首页输出 JSON：

```toml
[outputs]
  home = ["HTML", "RSS", "JSON"]
```

再创建一个搜索页入口，例如：

```toml
[[menu.main]]
  name = "Search"
  pageRef = "/search"
```

以及一个内容文件：

```text
content/search/_index.md
```

主题会自动请求 `/index.json`，不需要 `Pagefind` 的额外索引步骤，也不需要二次构建服务。

## 本地使用

把这个目录放进你的 Hugo 项目的 `themes/hugo-theme-beatai`，然后在站点配置中启用：

```toml
theme = "hugo-theme-beatai"
```

如果你要先本地试运行，可以在装好 Hugo 后进入当前目录执行：

```bash
hugo server --source exampleSite --themesDir ..
```

## 示例能力

- 首页 Hero
- 文档单页
- 文档列表页
- 多级侧边栏
- 标签和分类页
- 404 页面

## 建议的定制顺序

1. 修改 `assets/css/main.css` 的颜色和字体
2. 调整 `sidebar.html` 和 `header.html` 的品牌表达
3. 按你的内容结构重写 `single.html` 和 `list.html`
4. 再决定要不要补搜索、评论和暗色模式
