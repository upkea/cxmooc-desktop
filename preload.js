// preload：给页面暴露 IPC 通道，GM 垫片用它发跨域请求
const { ipcRenderer } = require('electron');
window.__cxIpcRequest = (details) => ipcRenderer.invoke('cx-request', details);