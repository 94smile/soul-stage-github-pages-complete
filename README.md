# Soul Stage GitHub Pages 部署版

## 🚀 如何部署？

### 1. 初始化 Git 倉庫

```bash
git init
git remote add origin https://github.com/94smile/soul-stage-github-pages-complete.git
```

### 2. 安裝套件
```bash
npm install
```

### 3. 執行部署
```bash
npm run deploy
```

這會自動推送 `dist/` 到 GitHub 的 `gh-pages` 分支

### 4. 到 GitHub 設定 Pages
- Source: `gh-pages`
- Folder: `/ (root)`
- 完成後訪問網址：

👉 https://94smile.github.io/soul-stage-github-pages-complete/
