# Netlify 兼容性检查报告（HCM0107）

生成时间：2026-03-17  
检查范围：`HCM0107` 前端静态站点在 Netlify 上的构建与发布可行性、配置完备性、安全与可维护性。

## 结论
- **可部署（已具备必要条件）**：项目是 Vite + Vue3 的纯静态构建，`npm run build` 产物输出到 `dist/`，与 Netlify 静态托管模型匹配。
- **已修复一个关键兼容性问题**：当前 Git 仓库根目录在 `HCM/`，原 `HCM0107/netlify.toml` 不会被 Netlify 默认读取；已补充根目录 `netlify.toml` 并设置 `base = "HCM0107"`，确保 Netlify 正确进入子目录构建与发布。

## 关键配置检查

### 1) 项目结构与配置文件
- `netlify.toml`
  - 子目录存在：`HCM0107/netlify.toml`
  - **根目录已补充**：`HCM/netlify.toml`（Netlify 默认读取仓库根目录配置）
  - **要点**：
    - `base = "HCM0107"`
    - `command = "npm run build"`
    - `publish = "dist"`
    - SPA 重写：`/* -> /index.html (200)`
- 输出目录
  - `vite build` 默认输出 `dist/`，与 `publish = "dist"` 对齐。
- 重定向/Headers 文件
  - 目前使用 `netlify.toml` 的 `[[redirects]]` 实现 SPA history 路由重写。
  - `_redirects`、`_headers` 文件不是必需项（可选增强项）。
- `.gitignore`
  - 已忽略 `HCM0107/dist`，符合“构建产物不入库”的常规要求。

### 2) 依赖管理与版本兼容性
- Node 版本
  - Vite 5 需要 Node 18+。
  - 已在 `HCM/netlify.toml` 中固定：`NODE_VERSION = "20"`。
  - 已在 `HCM0107/package.json` 中增加 `engines.node >=18.18.0`，用于本地/CI 约束提示。
- 锁文件
  - `HCM0107/package-lock.json` 存在，Netlify 使用 npm 时可稳定解析依赖。
- 二进制依赖/平台相关依赖
  - 当前依赖以纯前端库为主（Vue/Ant Design/Vite），没有明显平台二进制模块风险。

### 3) 构建脚本与流程
- `HCM0107/package.json`：`build = "vue-tsc && vite build"`，无交互式步骤。
- 本地构建验证：已多次执行 `npm run build` 通过，构建时长约 8–22 秒，远低于 Netlify 15 分钟限制。
- 构建产物体积
  - `dist/assets/*.js` 约 1.4MB（gzip ~410KB），Netlify 可部署；仅存在 Rollup 的 chunk size 警告（非阻断）。

### 4) 静态资源与路径配置
- `vite.config.ts`：`base: '/'`，与 Netlify 根域名发布一致。
- SPA 路由：已配置重写到 `/index.html`。

### 5) 环境变量与密钥管理（安全）
- 未发现将服务端密钥硬编码到前端运行时的模式。
- `public/comment-widget.js` 使用 `<script data-supabase-url data-supabase-key data-webhook>` 方式注入配置；未在仓库中写死密钥。
  - 注意：即使是 Supabase anon key 也属于“可公开但需限制权限”的配置，应确保对应 Supabase RLS 与权限策略正确。

## 已做的兼容性修复
- 新增/修复根目录 Netlify 配置：`HCM/netlify.toml`
  - 解决“Netlify 读取不到子目录 netlify.toml 导致构建失败/配置不生效”的问题。
- 增加 Node 版本约束提示：`HCM0107/package.json` 增加 `engines.node`。

## 建议优化（非阻断）
- **缓存与安全 Headers**（可选）：添加 `HCM0107/public/_headers` 或在 `netlify.toml` 配置 headers，补充 CSP、X-Frame-Options、X-Content-Type-Options 等。
- **拆包优化**（可选）：当前 build 有 chunk size 警告，可在 `vite.config.ts` 增加 `build.rollupOptions.output.manualChunks` 或按路由懒加载减少首屏体积。

## Netlify 站点设置建议（操作清单）
- Site settings
  - Build command：由 `netlify.toml` 接管（无需手动填写）
  - Publish directory：由 `netlify.toml` 接管
  - Node version：由 `netlify.toml` 接管（20）
- 环境变量
  - 若未来接入后端 API、第三方服务：统一使用 Netlify 环境变量注入，避免写死在代码中。

