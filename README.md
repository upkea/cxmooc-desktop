# cxmooc-desktop

学习通（超星）网课**学习辅助**桌面版：Electron 壳内嵌学习通网页，注入免费开源的[油猴脚本](https://github.com/upkea/cxmooc-autoplay)（基于 CodFrm/cxmooc-tools，MIT）。

> ⚠️ **仅供个人学习交流使用**，请勿用于代刷、代考等违反学校规定的用途。请遵守所在平台的服务条款，一切使用后果自负。

## 当前状态：MVP（v0.1）

- [x] Electron 壳 + 学习通网页登录（UA 伪装）
- [x] document-start 注入现有脚本（视频守护 / AI 答题 / 字体解密 / 自动切章全都在）
- [x] GM API 垫片（GM_xmlhttpRequest 走主进程，绕 CORS；GM_setValue 落 localStorage）
- [x] 页面内「小工具通知条」配置面板可用（服务商预设 + 自动答题开关 + 连接检测）

## 路线图

- [ ] M2：原生设置界面（AI 配置从页内搬家到应用内）、托盘、开机自启
- [ ] M2：electron-updater 自动更新（GitHub Releases）
- [ ] M2：拟人化选项（倍速上限 / 随机延迟 / 故意答错率 / 每日时长上限）
- [ ] M3：应用图标 / 名称 / 官网文档 / 代码签名 / 安装包分发

## 开发

```bash
# 1) 生成注入 bundle（vendor 下的头 + webpack 产物）
node make-bundle.js
# 2) 启动
start.bat   # 或 npm start
# 烟雾测试（隐藏窗口跑 30 秒，日志写 smoke.log）
npm run smoke
```

## 目录

```
main.js            主进程：窗口 / 注入 / GM 请求转发
preload.js         IPC 桥
shims.js           GM 垫片（document-start 注入）
make-bundle.js     拼 app-inject.js
vendor/            油猴脚本的头 + webpack 产物（源头见 cxmooc-autoplay）
get-electron-bin.js  从 npmmirror 下载 Electron 二进制（npm 装完跑一次）
start.bat          启动入口
```

## 已知限制

- MVP 注入跑在浏览器页面里，界面就是页面里的「小工具通知条」（正式版会换成原生面板）
- Electron 环境指纹与普通浏览器有差异，学习通若加强检测需要持续跟进
- 未签名（SmartScreen 会提示），正式分发前需要代码签名证书

## 致谢

- [CodFrm/cxmooc-tools](https://github.com/CodFrm/cxmooc-tools)（MIT）—— 原始工具
- [DaRin1403/xuexitong-autostudy](https://github.com/DaRin1403/xuexitong-autostudy)（MIT）—— 字体加密解密思路
- [lightagent-lab/web-llm-gateways](https://github.com/lightagent-lab/web-llm-gateways) —— 大模型反代思路参考

## License

MIT