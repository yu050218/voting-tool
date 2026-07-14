import React from "react";
import { createRoot } from "react-dom/client";
import { 万能投票工具应用 } from "./App.jsx";
import "./style.css";

try {
  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <万能投票工具应用 />
    </React.StrictMode>
  );
} catch (error) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div style="max-width:760px;margin:80px auto;padding:24px;border:1px solid #ffd0aa;border-radius:8px;background:#fff7ed;color:#7a3412;font-family:Microsoft YaHei,Arial,sans-serif;line-height:1.8">
      <h1 style="margin-top:0">页面脚本运行失败</h1>
      <p>请先按 Ctrl + F5 强制刷新。如果仍然失败，请把下面的错误内容发给开发者。</p>
      <pre style="white-space:pre-wrap;background:#fff;padding:12px;border-radius:6px">${String(error?.stack || error)}</pre>
    </div>
  `;
  console.error(error);
}
