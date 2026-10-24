# 3x-ui 自用定制版

基于 [MHSanaei/3x-ui](https://github.com/MHSanaei/3x-ui) **v3.10.2**，
上游提交为 `608ef4e4010bf83e2e78328e08f77efc051ad4d7`。
保留上游许可证和版权声明，定制改动沿用仓库的 GPL-3.0 许可证。

## 定制功能

### Clash 订阅链接文件导出

- 入站操作菜单和入站列表总菜单增加“导出 Clash 订阅链接文件”。
- 使用面板已配置的 Clash 订阅地址，汇总启用客户端的订阅链接并去重。
- 导出 UTF-8 文本文件，每行一条订阅链接。
- 保留订阅未启用、无可导出客户端和请求失败时的提示。

### 登录页优化与去赞助

- 五层背景保留静态渐变，移除持续动画、大面积模糊及毛玻璃滤镜。
- 标题固定显示欢迎文字，移除每两秒触发页面状态更新的轮播。
- 移除登录页赞助组件及相关资源请求。
- 清理 13 种语言中不再使用的轮播问候语。

登录接口、双因素验证、主题切换和语言切换逻辑保持原有行为。
赞助展示的移除范围是登录页。

## 构建

本次验证使用 Node.js 26.12.1、npm 11.20.0、Go 1.27.2 和 musl-gcc。
需要先安装这些工具及 C 编译环境。前端产物会被嵌入 Go 程序，必须先构建前端。

```bash
cd frontend
npm ci
npm run typecheck
npm run test -- --project unit --project components --maxWorkers 1 \
  src/test/inbound-subscription-file.test.ts \
  src/test/inbound-subscription-menu.test.tsx \
  src/test/i18n-dead-keys.test.ts
npm run build
cd ..
CGO_ENABLED=1 CC=musl-gcc go build -p 2 -trimpath \
  -ldflags '-s -w -linkmode external -extldflags "-static"' \
  -o x-ui-custom .
```

上游安装脚本和官方发行包不包含这些定制，部署时应使用此源码构建的程序。
升级上游版本前应重新合并这些改动并完成验证，以免定制功能被覆盖。

## 已完成的验证

- TypeScript 类型检查、10 项订阅导出与国际化回归测试通过。
- 前端生产构建、Go 静态构建通过。
- Chromium 验证了输入、三种主题、手机布局、错误反馈和双因素验证码提交。
- 部署后实际登录成功并进入面板，登录页无赞助请求，无浏览器运行错误。
- 登录页首屏资源标签由 19 个减少为 15 个；实际加载速度取决于网络和设备。

仓库包含源码与构建说明。运行数据库、证书、账号凭据和服务器备份由部署环境单独管理。
