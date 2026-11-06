# 名人/健康信息真伪核查工具 (Celebrity Fact Checker)

基于 X 热搜 Top 10 推文深度分析（Tweet 1 "巨石强森因经济下行饿的只剩皮包骨头" 4.15M 曝光）开发的 MVP。

## 功能
- 🔍 **可信度评估**：5 步核查流程（信息源、图片取证、交叉验证、专家解读、上下文）→ 评分 + 结论
- 📚 **核查知识库**：AI 图片识别、名人健康核查、谣言模式、媒体取证工具链、信息源评估、健康 misinformation
- 📁 **核查记录**：本地存储核查案件，含可信度评分

## 技术栈
- Node.js + Express
- 前端：纯 HTML/CSS/JS（无框架）
- 数据：本地 JSON 文件

## 运行
```bash
npm install
npm start
# 访问 http://localhost:3000
```

## 部署
推送到 GitHub 仓库 `wcl13311733120-create/devbot-celebrity-fact-checker`，启用 GitHub Pages。
