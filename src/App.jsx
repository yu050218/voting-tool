import { Component, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ClipboardList,
  Download,
  Eye,
  FilePlus2,
  Home,
  LockKeyhole,
  LogIn,
  Paperclip,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  Vote
} from "lucide-react";
import { 初始任务, 登录方式, 任务类型, 状态文本 } from "./data.js";

const 评分映射 = { 优秀: 10, 良好: 8, 合格: 6, 不合格: 4 };

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("应用渲染错误:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ maxWidth: 760, margin: "80px auto", padding: 24, border: "1px solid #ffd0aa", borderRadius: 8, background: "#fff7ed", color: "#7a3412", fontFamily: "Microsoft YaHei, Arial, sans-serif", lineHeight: 1.8 }}>
          <h1 style={{ marginTop: 0 }}>页面渲染出错</h1>
          <p>请尝试刷新页面。如果仍然失败，请联系管理员。</p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#fff", padding: 12, borderRadius: 6, fontSize: 13 }}>
            {String(this.state.error?.stack || this.state.error)}
          </pre>
          <button type="button" onClick={() => window.location.reload()} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#f97316", color: "#fff", cursor: "pointer" }}>刷新页面</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function getSessionId() {
  return sessionStorage.getItem("admin-session-id");
}

function setSessionId(sessionId) {
  sessionStorage.setItem("admin-session-id", sessionId);
}

function clearSessionId() {
  sessionStorage.removeItem("admin-session-id");
}

async function authenticatedFetch(url, options = {}) {
  const sessionId = getSessionId();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  if (sessionId) {
    headers["x-session-id"] = sessionId;
  }
  return fetch(url, { ...options, headers });
}

async function apiLogin(username, password) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (!response.ok) return { error: data.error || "登录失败" };
    return data;
  } catch {
    return { error: "网络错误" };
  }
}

async function apiLogout() {
  try {
    const response = await authenticatedFetch("/api/auth/logout", { method: "POST" });
    clearSessionId();
    return await response.json();
  } catch {
    clearSessionId();
    return { success: true };
  }
}

async function apiGetCurrentUser() {
  try {
    const response = await authenticatedFetch("/api/auth/me");
    if (response.status === 401) {
      clearSessionId();
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

async function apiGetUsers() {
  try {
    const response = await authenticatedFetch("/api/users");
    return await response.json();
  } catch {
    return [];
  }
}

async function apiCreateUser(user) {
  try {
    const response = await authenticatedFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(user)
    });
    return await response.json();
  } catch {
    return null;
  }
}

async function apiUpdateUser(id, updates) {
  try {
    const response = await authenticatedFetch(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
    return await response.json();
  } catch {
    return null;
  }
}

async function apiDeleteUser(id) {
  try {
    const response = await authenticatedFetch(`/api/users/${id}`, {
      method: "DELETE"
    });
    return await response.json();
  } catch {
    return { success: false };
  }
}

async function apiGetTasks() {
  try {
    const response = await authenticatedFetch("/api/tasks");
    if (response.status === 401) {
      clearSessionId();
      return [];
    }
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function apiGetTask(id) {
  try {
    const response = await authenticatedFetch(`/api/tasks/${id}`);
    return await response.json();
  } catch {
    return null;
  }
}

async function apiCreateTask(task) {
  try {
    const response = await authenticatedFetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify(task)
    });
    return await response.json();
  } catch {
    return null;
  }
}

async function apiUpdateTask(id, updates) {
  try {
    const response = await authenticatedFetch(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
    const data = await response.json();
    if (!response.ok) return { error: data.error || "更新失败" };
    return data;
  } catch {
    return { error: "网络错误" };
  }
}

async function apiDeleteTask(id) {
  try {
    const response = await authenticatedFetch(`/api/tasks/${id}`, {
      method: "DELETE"
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.error || "删除失败" };
    return data;
  } catch {
    return { success: false, error: "网络错误" };
  }
}

async function apiVerifyAccount(taskId, account, password) {
  try {
    const response = await fetch("/api/accounts/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, account, password })
    });
    return await response.json();
  } catch {
    return { valid: false, message: "网络错误" };
  }
}

async function apiSubmitRecord(taskId, record) {
  try {
    const response = await fetch(`/api/tasks/${taskId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record })
    });
    return await response.json();
  } catch {
    return { success: false, error: "网络错误" };
  }
}

async function apiGetPublicTasks() {
  try {
    const response = await fetch("/api/public/tasks");
    return await response.json();
  } catch {
    return [];
  }
}

async function apiGetPublicTask(id) {
  try {
    const response = await fetch(`/api/public/tasks/${id}`);
    return await response.json();
  } catch {
    return null;
  }
}

async function apiGetTaskByAccount(account) {
  try {
    const response = await fetch(`/api/public/task-by-account/${account}`);
    return await response.json();
  } catch {
    return null;
  }
}

function 创建编号(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function 格式化日期(value) {
  if (!value) return "未设置";
  if (typeof value !== "string") return String(value);
  return value.replace("T", " ");
}

function 下载文本(filename, content, type = "text/csv;charset=utf-8") {
  const blob = new Blob(["\ufeff" + content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function 生成账号(taskId, taskName, count) {
  const namePrefix = taskName
    .replace(/[^\u4e00-\u9fa5A-Za-z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase() || "VT";
  const taskHash = taskId ? taskId.slice(-6).toUpperCase() : "";
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const prefix = `${namePrefix}${taskHash}`;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const genPassword = () => {
    let result = "";
    const array = new Uint32Array(12);
    crypto.getRandomValues(array);
    for (let i = 0; i < 12; i++) {
      result += chars[array[i] % chars.length];
    }
    return result;
  };
  return Array.from({ length: Number(count) || 0 }, (_, index) => ({
    account: `${prefix}-${timestamp}-${randomSuffix}-${String(index + 1).padStart(3, "0")}`,
    password: genPassword(),
    used: false
  }));
}

function 计算统计(task) {
  try {
    if (!task) return { 应参与人数: 0, 已完成人数: 0, 完成率: 0, 排名: [], 维度: {} };
    const records = Array.isArray(task.records) ? task.records : [];
    const allObjects = Array.isArray(task.objects) ? task.objects : [];
    const enabledObjects = allObjects.filter((item) => item && item.enabled !== false);
    const allAccounts = Array.isArray(task.accounts) ? task.accounts : [];
    const target = task.loginMode === "none" ? Math.max(records.length, 1) : Math.max(allAccounts.length || task.accountCount || 0, 1);
  const base = {
    应参与人数: target,
    已完成人数: records.length,
    完成率: Math.round((records.length / target) * 1000) / 10,
    排名: [],
    维度: {}
  };

  if (task.type === "evaluation") {
    const result = enabledObjects.map((object) => {
      const dimensionBucket = {};
      let total = 0;
      let count = 0;

      records.forEach((record) => {
        const objectAnswers = record.answers?.evaluation?.[object.id] || {};
        (task.questions || []).forEach((question) => {
          const raw = objectAnswers[question.id];
          const score = typeof raw === "number" ? raw : 评分映射[raw] || 0;
          if (score > 0) {
            const dimension = question.dimension || "综合评价";
            dimensionBucket[dimension] = dimensionBucket[dimension] || [];
            dimensionBucket[dimension].push(score);
            total += score;
            count += 1;
          }
        });
      });

      const dimensions = Object.fromEntries(
        Object.entries(dimensionBucket).map(([name, values]) => [
          name,
          Math.round((values.reduce((sum, item) => sum + item, 0) / values.length) * 10) / 10
        ])
      );

      return {
        id: object.id,
        name: object.name,
        meta: object.meta,
        total: count ? Math.round((total / count) * 10) / 10 : 0,
        dimensions,
        votes: records.length
      };
    });

    base.排名 = result.sort((a, b) => b.total - a.total);
    base.维度 = base.排名.reduce((map, row) => ({ ...map, [row.name]: row.dimensions }), {});
    return base;
  }

  const voteMap = Object.fromEntries(enabledObjects.map((object) => [object.id, 0]));
  records.forEach((record) => {
    (record.answers?.selections || []).forEach((id) => {
      voteMap[id] = (voteMap[id] || 0) + 1;
    });
  });

  base.排名 = enabledObjects
    .map((object) => ({
      id: object.id,
      name: object.name,
      meta: object.meta,
      votes: voteMap[object.id] || 0,
      total: voteMap[object.id] || 0
    }))
    .sort((a, b) => b.votes - a.votes);
  return base;
  } catch (e) {
    console.error("计算统计出错:", e, task);
    return { 应参与人数: 0, 已完成人数: 0, 完成率: 0, 排名: [], 维度: {} };
  }
}

function 导出统计(task) {
  const stats = 计算统计(task);
  const header = task.type === "evaluation" ? "排名,对象,身份,总分,维度统计,参与人数" : "排名,对象,说明,票数";
  const rows = stats.排名.map((row, index) => {
    if (task.type === "evaluation") {
      const dimensions = Object.entries(row.dimensions)
        .map(([key, value]) => `${key}:${value}`)
        .join("；");
      return `${index + 1},${row.name},${row.meta || ""},${row.total},${dimensions},${row.votes}`;
    }
    return `${index + 1},${row.name},${row.meta || ""},${row.votes}`;
  });
  下载文本(`${task.name}-统计结果.csv`, [header, ...rows].join("\n"));
}

function 导出账号(task) {
  const rows = ["账号,密码,是否已提交", ...(task.accounts || []).map((item) => `${item.account},${item.password},${item.used ? "是" : "否"}`)];
  下载文本(`${task.name}-任务账号.csv`, rows.join("\n"));
}

function 类型徽标({ type }) {
  return <span className={`badge type-${type}`}>{任务类型[type]}</span>;
}

function 状态徽标({ status }) {
  return <span className={`badge status-${status}`}>{状态文本[status]}</span>;
}

function 空状态({ title, description }) {
  return (
    <div className="empty-state">
      <ClipboardList size={34} />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function 万能投票工具应用() {
  const [tasks, setTasks] = useState([]);
  const [publicTasks, setPublicTasks] = useState([]);
  const [page, setPage] = useState("home");
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [notice, setNotice] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    apiGetPublicTasks().then((data) => {
      setPublicTasks(data);
    });
    apiGetCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        loadTasks();
      }
    });
  }, []);

  const activeTask = tasks.length > 0 ? (tasks.find((task) => task.id === activeTaskId) || tasks[0]) : null;
  const activePublicTask = publicTasks.length > 0 ? (publicTasks.find((task) => task.id === activeTaskId) || publicTasks[0]) : null;

  async function loadTasks() {
    const data = await apiGetTasks();
    setTasks(data);
    if (data.length > 0 && !activeTaskId) {
      setActiveTaskId(data[0].id);
    }
  }

  async function loadUsers() {
    const data = await apiGetUsers();
    setUsers(data);
  }

  async function handleLogin(username, password) {
    const result = await apiLogin(username, password);
    if (result.error) {
      flash(result.error);
      return false;
    }
    setSessionId(result.sessionId);
    setCurrentUser(result.user);
    flash(`登录成功，欢迎 ${result.user.name}`);
    loadTasks();
    if (result.user.role === 'admin') {
      loadUsers();
    }
    jump("admin");
    return true;
  }

  async function handleLogout() {
    await apiLogout();
    setCurrentUser(null);
    setTasks([]);
    setUsers([]);
    flash("已退出登录");
    jump("home");
  }

  async function updateTask(taskId, updater) {
    const oldTask = tasks.find((t) => t.id === taskId);
    if (!oldTask) return { error: "任务不存在" };
    const updated = updater(oldTask);
    const result = await apiUpdateTask(taskId, updated);
    if (result && !result.error) {
      setTasks(tasks.map((t) => (t.id === taskId ? result : t)));
    }
    return result;
  }

  async function createTask(task) {
    const result = await apiCreateTask(task);
    if (result) {
      setTasks([result, ...tasks]);
      return result;
    }
    return null;
  }

  async function removeTask(taskId) {
    const result = await apiDeleteTask(taskId);
    if (result && result.success) {
      let remainingTasks = [];
      setTasks((prevTasks) => {
        const arr = Array.isArray(prevTasks) ? prevTasks : [];
        remainingTasks = arr.filter((t) => t.id !== taskId);
        return remainingTasks;
      });
      if (activeTaskId === taskId) {
        const newId = remainingTasks.length > 0 ? remainingTasks[0].id : null;
        setActiveTaskId(newId);
        if (page !== "admin") setPage("admin");
      }
    }
    return result;
  }

  async function handleCreateUser(user) {
    const result = await apiCreateUser(user);
    if (result && !result.error) {
      setUsers([result, ...users]);
      flash("用户创建成功");
    } else {
      flash(result?.error || "创建用户失败");
    }
  }

  async function handleUpdateUser(id, updates) {
    const result = await apiUpdateUser(id, updates);
    if (result && !result.error) {
      setUsers(users.map((u) => (u.id === id ? result : u)));
      flash("用户更新成功");
    } else {
      flash(result?.error || "更新用户失败");
    }
  }

  async function handleDeleteUser(id) {
    if (!confirm("确认删除该用户？")) return;
    const result = await apiDeleteUser(id);
    if (result.success) {
      setUsers(users.filter((u) => u.id !== id));
      flash("用户删除成功");
    } else {
      flash(result?.error || "删除用户失败");
    }
  }

  function jump(target, taskId = activeTaskId) {
    if (target === "admin" && !currentUser) {
      setPage("admin-login");
      return;
    }
    if (taskId) setActiveTaskId(taskId);
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function flash(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  const publishedTasks = useMemo(
    () =>
      publicTasks.filter((task) => {
        const visible = task.status === "published";
        const matched = !keyword || `${task.name}${task.description}`.toLowerCase().includes(keyword.toLowerCase());
        return visible && matched;
      }),
    [publicTasks, keyword]
  );

  return (
    <ErrorBoundary>
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => jump("home")}>
          <Vote size={24} />
          <span>万能投票工具</span>
        </button>
        <nav>
          <button className={page === "home" ? "active" : ""} type="button" onClick={() => jump("home")}>
            <Home size={17} />
            前台首页
          </button>
          <button className={page.startsWith("admin") ? "active" : ""} type="button" onClick={() => jump("admin")}>
            <Settings size={17} />
            后台管理
          </button>
        </nav>
        {currentUser && (
          <div className="user-info">
            <span>{currentUser.name} ({currentUser.role === 'admin' ? '管理员' : '普通用户'})</span>
            <button className="text-button" type="button" onClick={handleLogout}>退出登录</button>
          </div>
        )}
      </header>

      {notice && <div className="toast">{notice}</div>}

      {page === "home" && <前台首页 tasks={publishedTasks} keyword={keyword} setKeyword={setKeyword} jump={jump} />}
      {page === "login" && activePublicTask && <任务登录页 task={activePublicTask} updateTask={updateTask} jump={jump} flash={flash} />}
      {page === "vote" && activePublicTask && <投票测评页 task={activePublicTask} updateTask={updateTask} jump={jump} flash={flash} />}
      {page === "admin-login" && <后台登录页 onLogin={handleLogin} jump={jump} />}
      {page === "admin" && <后台任务管理页 tasks={tasks} createTask={createTask} updateTask={updateTask} removeTask={removeTask} jump={jump} flash={flash} currentUser={currentUser} />}
      {page === "admin-users" && <用户管理页 users={users} onCreate={handleCreateUser} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} jump={jump} currentUser={currentUser} />}
      {page === "admin-edit" && activeTask && <任务编辑页 task={activeTask} updateTask={updateTask} jump={jump} flash={flash} currentUser={currentUser} />}
      {page === "admin-config" && activeTask && <题目对象配置页 task={activeTask} updateTask={updateTask} jump={jump} flash={flash} currentUser={currentUser} />}
      {page === "admin-stats" && activeTask && <数据统计页 task={activeTask} jump={jump} currentUser={currentUser} />}
    </div>
    </ErrorBoundary>
  );
}

function 前台首页({ tasks, keyword, setKeyword, jump }) {
  return (
    <main className="page">
      <section className="hero-band">
        <div>
          <p className="eyebrow">校内选举 / 民主测评 / 作品投票</p>
          <h1>统一创建、参与、统计和导出校内投票任务</h1>
          <p>支持免密参与、随机账号、指定账号、防重复提交、匿名统计和 Excel/CSV 下载，适合课程实训演示和校内活动落地。</p>
        </div>
        <div className="hero-panel">
          <ShieldCheck size={28} />
          <strong>内部数据优先</strong>
          <span>任务、对象、账号和提交记录均按任务隔离管理。</span>
        </div>
      </section>

      <section className="toolbar">
        <div className="searchbox">
          <Search size={17} />
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索投票任务..." />
        </div>
        <span className="muted">当前可参与任务 {tasks.length} 个</span>
      </section>

      <section className="task-grid">
        {tasks.map((task) => (
          <article className={`task-card accent-${task.type}`} key={task.id}>
            <div className="card-row">
              <类型徽标 type={task.type} />
              <状态徽标 status={task.status} />
            </div>
            <h2>{task.name}</h2>
            <p>{task.description}</p>
            <dl>
              <div>
                <dt>截止时间</dt>
                <dd>{格式化日期(task.endAt)}</dd>
              </div>
              <div>
                <dt>参与方式</dt>
                <dd>{登录方式[task.loginMode]}</dd>
              </div>
              <div>
                <dt>已参与</dt>
                <dd>{task.records?.length || 0} 人</dd>
              </div>
            </dl>
            <div className="card-actions">
              <button className="secondary" type="button" onClick={() => jump("vote", task.id)}>
                <Eye size={16} />
                查看详情
              </button>
              {task.loginMode === "none" ? (
                <button type="button" onClick={() => jump("vote", task.id)}>
                  <Vote size={16} />
                  开始投票
                </button>
              ) : (
                <button type="button" onClick={() => jump("login", task.id)}>
                  <LogIn size={16} />
                  登录参与
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
      {!tasks.length && <空状态 title="暂无可参与任务" description="后台发布任务后，会自动显示在前台首页。" />}
    </main>
  );
}

function 任务登录页({ task, updateTask, jump, flash }) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    const result = await apiVerifyAccount(task.id, account.trim(), password.trim());
    if (!result.valid) {
      setError(result.message || "账号或密码不正确，请核对后重新输入。");
      return;
    }
    sessionStorage.setItem(`当前账号-${task.id}`, result.account);
    updateTask(task.id, (old) => ({ ...old, accounts: old.accounts.map((item) => (item.account === result.account ? { ...item, loggedAt: new Date().toLocaleString() } : item)) }));
    flash("登录成功，可以开始填写。");
    jump("vote", task.id);
  }

  return (
    <main className="center-page">
      <section className="login-hero">
        <button className="text-button" type="button" onClick={() => jump("home")}>返回首页</button>
        <h1>{task.name}</h1>
        <p>{task.description}</p>
      </section>
      <form className="login-card" onSubmit={submit}>
        <LockKeyhole size={34} />
        <h2>任务账号登录</h2>
        <p>请输入后台生成或指定分发的账号密码。每个账号只能提交一次。</p>
        <label>
          账号
          <input value={account} onChange={(event) => setAccount(event.target.value)} placeholder="请输入账号" />
        </label>
        <label>
          密码 / 验证码
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="请输入密码或验证码" />
        </label>
        {error && <div className="warning">{error}</div>}
        <button type="submit">登录</button>
      </form>
    </main>
  );
}

function 后台登录页({ onLogin, jump }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    const success = await onLogin(username.trim(), password.trim());
    if (!success) {
      setError("用户名或密码错误，请重试");
    }
  }

  return (
    <main className="center-page">
      <section className="login-hero">
        <button className="text-button" type="button" onClick={() => jump("home")}>返回首页</button>
        <h1>后台管理</h1>
        <p>请使用管理员或用户账号登录后台管理系统</p>
      </section>
      <form className="login-card" onSubmit={submit}>
        <Settings size={34} />
        <h2>后台登录</h2>
        <label>
          用户名
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="请输入用户名" />
        </label>
        <label>
          密码
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="请输入密码" />
        </label>
        {error && <div className="warning">{error}</div>}
        <button type="submit">登录</button>
      </form>
    </main>
  );
}

function 用户管理页({ users, onCreate, onUpdate, onDelete, jump, currentUser }) {
  const [form, setForm] = useState({ username: "", password: "", name: "", role: "user" });
  const [editingId, setEditingId] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onCreate(form);
    }
    setForm({ username: "", password: "", name: "", role: "user" });
    setEditingId(null);
  }

  function startEdit(user) {
    setForm({ username: user.username, password: "", name: user.name, role: user.role });
    setEditingId(user.id);
  }

  return (
    <main className="admin-layout">
      <后台侧栏 active="users" jump={jump} currentUser={currentUser} />
      <section className="admin-content">
        <div className="admin-title">
          <div>
            <p className="eyebrow">后台管理端</p>
            <h1>用户管理</h1>
          </div>
        </div>

        <div className="panel">
          <h3>{editingId ? "编辑用户" : "新建用户"}</h3>
          <form onSubmit={handleSubmit}>
            <label>
              用户名
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="用户名" required />
            </label>
            <label>
              密码 {editingId && <span className="muted">（留空表示不修改）</span>}
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="密码" />
            </label>
            <label>
              姓名
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="姓名" required />
            </label>
            <label>
              角色
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </label>
            <div className="form-actions">
              <button type="submit">{editingId ? "保存修改" : "创建用户"}</button>
              {editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm({ username: "", password: "", name: "", role: "user" }); }}>取消</button>}
            </div>
          </form>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>用户名</th>
                <th>姓名</th>
                <th>角色</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.name}</td>
                  <td><span className={`badge ${user.role === 'admin' ? 'status-published' : 'status-draft'}`}>{user.role === 'admin' ? '管理员' : '普通用户'}</span></td>
                  <td>{user.createdAt}</td>
                  <td>
                    <button className="secondary" type="button" onClick={() => startEdit(user)}>编辑</button>
                    <button className="icon-button danger-soft" type="button" title="删除" onClick={() => onDelete(user.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function 投票测评页({ task, updateTask, jump, flash }) {
  const currentAccount = task.loginMode === "none" ? `免密用户-${(task.records?.length || 0) + 1}` : sessionStorage.getItem(`当前账号-${task.id}`);
  const [selected, setSelected] = useState([]);
  const [answers, setAnswers] = useState({});

  const objects = (task.objects || []).filter((item) => item.enabled !== false);
  const alreadySubmitted = task.loginMode !== "none" && task.accounts?.find((item) => item.account === currentAccount)?.used;

  function toggleSelection(id) {
    setSelected((old) => {
      if (old.includes(id)) return old.filter((item) => item !== id);
      if (old.length >= (task.voteLimit || 1)) {
        flash(`最多只能选择 ${task.voteLimit || 1} 个对象。`);
        return old;
      }
      return [...old, id];
    });
  }

  function setEvaluation(objectId, questionId, value) {
    setAnswers((old) => ({
      ...old,
      [objectId]: {
        ...(old[objectId] || {}),
        [questionId]: value
      }
    }));
  }

  async function submit() {
    if (task.status !== "published") {
      flash("任务当前不可提交。");
      return;
    }
    if (task.loginMode !== "none" && !currentAccount) {
      flash("请先登录任务账号。");
      jump("login", task.id);
      return;
    }
    if (task.loginMode !== "none" && task.accounts?.find((item) => item.account === currentAccount)?.used) {
      flash("该账号已经提交过，不能重复提交。");
      return;
    }
    if (task.type === "evaluation") {
      const complete = objects.every((object) => (task.questions || []).every((question) => answers[object.id]?.[question.id] !== undefined));
      if (!complete) {
        flash("请完成每个对象的所有测评题目。");
        return;
      }
    } else if (!selected.length) {
      flash("请至少选择一个对象后再提交。");
      return;
    }

    const record = {
      id: 创建编号("record"),
      account: currentAccount,
      createdAt: new Date().toLocaleString(),
      answers: task.type === "evaluation" ? { evaluation: answers } : { selections: selected }
    };

    const result = await apiSubmitRecord(task.id, record);
    if (result.success) {
      flash("提交成功，感谢参与。");
      jump("home");
    } else {
      flash(result.error || "提交失败，请重试。");
    }
  }

  return (
    <main className="page">
      <section className="vote-header">
        <button className="text-button" type="button" onClick={() => jump("home")}>返回首页</button>
        <类型徽标 type={task.type} />
        <h1>{task.name}</h1>
        <p>{task.description}</p>
        <div className="vote-meta">
          <span>参与方式：{登录方式[task.loginMode]}</span>
          <span>匿名：{task.anonymous ? "是" : "否"}</span>
          <span>截止：{格式化日期(task.endAt)}</span>
        </div>
      </section>

      {task.type === "evaluation" ? (
        <section className="evaluation-list">
          {objects.map((object, index) => (
            <article className="evaluation-card" key={object.id}>
              <对象名片 object={object} index={index} />
              <div className="question-stack">
                {(task.questions || []).map((question) => (
                  <div className="question-card" key={question.id}>
                    <div>
                      <strong>{question.title}</strong>
                      <span>{question.dimension || "综合评价"}</span>
                    </div>
                    {question.type === "grade" ? (
                      <div className="segmented">
                        {(question.options || ["优秀", "良好", "合格", "不合格"]).map((option) => (
                          <button
                            className={answers[object.id]?.[question.id] === option ? "selected" : ""}
                            type="button"
                            key={option}
                            onClick={() => setEvaluation(object.id, question.id, option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <label className="range-row">
                        <input
                          type="range"
                          min="0"
                          max={question.maxScore || 10}
                          value={answers[object.id]?.[question.id] ?? 5}
                          onChange={(event) => setEvaluation(object.id, question.id, Number(event.target.value))}
                        />
                        <b>{answers[object.id]?.[question.id] ?? 5} 分</b>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="object-grid">
          {objects.map((object, index) => (
            <button className={`object-card ${selected.includes(object.id) ? "selected" : ""}`} type="button" key={object.id} onClick={() => toggleSelection(object.id)}>
              <对象名片 object={object} index={index} />
              {object.attachment && (
                typeof object.attachment === "object" && object.attachment.data ? (
                  <a className="attachment" href={object.attachment.data} download={object.attachment.name} onClick={(e) => e.stopPropagation()}>
                    <Paperclip size={14} />{object.attachment.name}
                  </a>
                ) : (
                  <span className="attachment">附件：{object.attachment}</span>
                )
              )}
            </button>
          ))}
        </section>
      )}

      <footer className="submit-bar">
        <span>{task.type === "evaluation" ? "请完成全部对象的同一套问卷" : `已选择 ${selected.length}/${task.voteLimit || 1}`}</span>
        <button type="button" onClick={submit}>
          <Save size={17} />
          提交
        </button>
      </footer>
    </main>
  );
}

function 对象名片({ object, index }) {
  const imageData = object.image && typeof object.image === "object" ? object.image.data : null;
  return (
    <div className="object-profile">
      <div className="object-cover" style={{ background: object.color || "#2f80ed" }}>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div>
        <h3>{object.name}</h3>
        <p className="meta">{object.meta}</p>
        <p>{object.description}</p>
        {imageData && <img src={imageData} alt={object.name} className="object-image" />}
      </div>
    </div>
  );
}

function 后台任务管理页({ tasks, createTask, updateTask, removeTask, jump, flash, currentUser }) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const stats = useMemo(() => safeTasks.map((task) => ({ task, stats: 计算统计(task) })), [safeTasks]);

  async function handleCreateTask() {
    const newTask = {
      id: 创建编号("task"),
      name: "新建投票任务",
      description: "请填写任务说明，明确参与范围、投票规则和截止时间。",
      type: "election",
      status: "draft",
      anonymous: true,
      loginMode: "random",
      voteLimit: 1,
      accountCount: 20,
      startAt: "2026-07-10T09:00",
      endAt: "2026-07-20T18:00",
      creator: currentUser?.name || "未知",
      objects: [],
      questions: [],
      accounts: [],
      records: []
    };
    const result = await createTask(newTask);
    if (result) {
      flash("已创建草稿任务。");
      jump("admin-edit", result.id);
    } else {
      flash("创建任务失败，请重试。");
    }
  }

  async function changeStatus(taskId, status) {
    await updateTask(taskId, (old) => ({ ...old, status }));
    flash(`任务状态已更新为：${状态文本[status]}`);
  }

  async function handleRemoveTask(taskId) {
    if (!window.confirm("确认删除该任务？删除后数据不可恢复。")) return;
    try {
      const result = await removeTask(taskId);
      if (result && result.success) {
        flash("任务已删除。");
      } else {
        flash("删除任务失败：" + (result?.error || "未知错误"));
      }
    } catch (e) {
      console.error("删除任务异常:", e);
      flash("删除任务异常：" + (e?.message || "未知错误"));
    }
  }

  return (
    <main className="admin-layout">
      <后台侧栏 active="tasks" jump={jump} currentUser={currentUser} />
      <section className="admin-content">
        <div className="admin-title">
          <div>
            <p className="eyebrow">后台管理端</p>
            <h1>任务管理</h1>
          </div>
          <button type="button" onClick={handleCreateTask}>
            <FilePlus2 size={17} />
            新建任务
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>任务名称</th>
                <th>类型</th>
                <th>创建者</th>
                <th>状态</th>
                <th>参与人数</th>
                <th>截止时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(({ task, stats }) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.name}</strong>
                  </td>
                  <td><类型徽标 type={task.type} /></td>
                  <td>{task.creator || '未知'}</td>
                  <td><状态徽标 status={task.status} /></td>
                  <td>{stats.已完成人数}/{stats.应参与人数}</td>
                  <td>{格式化日期(task.endAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="secondary" type="button" onClick={() => jump("admin-edit", task.id)}>编辑</button>
                      <button className="secondary" type="button" onClick={() => jump("admin-config", task.id)}>配置</button>
                      <button className="secondary" type="button" onClick={() => jump("admin-stats", task.id)}>统计</button>
                      {task.status !== "published" && <button className="success" type="button" onClick={() => changeStatus(task.id, "published")}>发布</button>}
                      {task.status === "published" && <button className="danger-soft" type="button" onClick={() => changeStatus(task.id, "cancelled")}>取消</button>}
                      <button className="icon-button danger-soft" type="button" title="删除" onClick={() => handleRemoveTask(task.id)}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function 后台侧栏({ active, jump, currentUser }) {
  return (
    <aside className="admin-sidebar">
      <strong>后台管理</strong>
      <button className={active === "tasks" ? "active" : ""} type="button" onClick={() => jump("admin")}><ClipboardList size={17} />任务管理</button>
      <button className={active === "stats" ? "active" : ""} type="button" onClick={() => jump("admin-stats")}><BarChart3 size={17} />统计总览</button>
      {currentUser?.role === 'admin' && (
        <button className={active === "users" ? "active" : ""} type="button" onClick={() => jump("admin-users")}><Users size={17} />用户管理</button>
      )}
      <button type="button" onClick={() => jump("home")}><Home size={17} />返回前台</button>
    </aside>
  );
}

function 任务编辑页({ task, updateTask, jump, flash, currentUser }) {
  const [form, setForm] = useState(task);

  function setField(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function save(nextPage) {
    const normalized = {
      ...form,
      voteLimit: Math.max(1, Number(form.voteLimit) || 1),
      accountCount: Math.max(0, Number(form.accountCount) || 0)
    };
    const result = await updateTask(task.id, () => normalized);
    if (result && result.error) {
      flash("保存失败：" + result.error);
      return;
    }
    flash("任务基本信息已保存。");
    if (nextPage) jump(nextPage, task.id);
  }

  return (
    <main className="admin-layout">
      <后台侧栏 active="tasks" jump={jump} currentUser={currentUser} />
      <section className="admin-content">
        <步骤条 step={1} />
        <div className="form-panel">
          <h1>新建 / 编辑任务</h1>
          <div className="form-grid">
            <label className="wide">任务名称<input value={form.name} onChange={(event) => setField("name", event.target.value)} /></label>
            <label className="wide">任务简介<textarea value={form.description} onChange={(event) => setField("description", event.target.value)} rows="4" /></label>
            <label>任务类型<select value={form.type} onChange={(event) => setField("type", event.target.value)}>{Object.entries(任务类型).map(([key, value]) => <option value={key} key={key}>{value}</option>)}</select></label>
            <label>登录方式<select value={form.loginMode} onChange={(event) => setField("loginMode", event.target.value)}>{Object.entries(登录方式).map(([key, value]) => <option value={key} key={key}>{value}</option>)}</select></label>
            <label>投票限额<input type="number" min="1" value={form.voteLimit} onChange={(event) => setField("voteLimit", event.target.value)} /></label>
            <label>账号数量<input type="number" min="0" value={form.accountCount} onChange={(event) => setField("accountCount", event.target.value)} /></label>
            <label>开始时间<input type="datetime-local" value={form.startAt} onChange={(event) => setField("startAt", event.target.value)} /></label>
            <label>结束时间<input type="datetime-local" value={form.endAt} onChange={(event) => setField("endAt", event.target.value)} /></label>
          </div>
          <label className="check-row">
            <input type="checkbox" checked={form.anonymous} onChange={(event) => setField("anonymous", event.target.checked)} />
            匿名统计：结果页不展示投票人与具体选择的对应关系
          </label>
          <div className="form-actions">
            <button className="secondary" type="button" onClick={() => save()}>保存草稿</button>
            <button type="button" onClick={() => save("admin-config")}>下一步：题目与对象</button>
          </div>
        </div>
      </section>
    </main>
  );
}

function 题目对象配置页({ task, updateTask, jump, flash, currentUser }) {
  const [objectDraft, setObjectDraft] = useState({ name: "", meta: "", description: "", color: "#2f80ed", image: null, attachment: null });
  const [questionDraft, setQuestionDraft] = useState({ title: "", type: "score", dimension: "", maxScore: 10, options: "优秀,良好,合格,不合格" });

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      flash("请上传图片文件。");
      event.target.value = "";
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      flash("图片大小不能超过 3MB。");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      setObjectDraft((prev) => ({ ...prev, image: { name: file.name, data: e.target.result } }));
      flash(`已选择图片：${file.name}`);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function handleAttachmentUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      flash("附件大小不能超过 5MB。");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      setObjectDraft((prev) => ({ ...prev, attachment: { name: file.name, data: e.target.result } }));
      flash(`已选择附件：${file.name}`);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function addObject() {
    if (!objectDraft.name.trim()) return flash("请先填写对象名称。");
    updateTask(task.id, (old) => ({
      ...old,
      objects: [...(old.objects || []), { ...objectDraft, id: 创建编号("object"), enabled: true }]
    }));
    setObjectDraft({ name: "", meta: "", description: "", color: "#2f80ed", image: null, attachment: null });
    flash("应用对象已添加。");
  }

  function addQuestion() {
    if (!questionDraft.title.trim()) return flash("请先填写题目标题。");
    updateTask(task.id, (old) => ({
      ...old,
      questions: [
        ...(old.questions || []),
        {
          ...questionDraft,
          id: 创建编号("question"),
          maxScore: Number(questionDraft.maxScore) || 10,
          options: questionDraft.options.split(",").map((item) => item.trim()).filter(Boolean)
        }
      ]
    }));
    setQuestionDraft({ title: "", type: "score", dimension: "", maxScore: 10, options: "优秀,良好,合格,不合格" });
    flash("题目已添加。");
  }

  function removeObject(id) {
    updateTask(task.id, (old) => ({ ...old, objects: old.objects.filter((item) => item.id !== id) }));
  }

  function removeQuestion(id) {
    updateTask(task.id, (old) => ({ ...old, questions: old.questions.filter((item) => item.id !== id) }));
  }

  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  function handleAccountUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      return flash("请上传 CSV 格式的文件。");
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const content = e.target.result;
        const lines = content.split(/\r?\n/).filter(line => line.trim());
        const accounts = [];
        let hasHeader = false;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line || line.startsWith('#')) continue;
          
          const parts = parseCSVLine(line);
          
          if (i === 0 && (parts[0] === '账号' || parts[0] === 'account' || parts[0] === '用户名')) {
            hasHeader = true;
            continue;
          }
          
          if (parts.length >= 2) {
            const account = parts[0];
            const password = parts[1];
            if (account && password) {
              accounts.push({ account, password, used: false });
            }
          }
        }
        
        if (accounts.length === 0) {
          return flash("未解析到有效的账号数据，请确保CSV文件第一列是账号，第二列是密码。");
        }
        
        updateTask(task.id, (old) => ({ ...old, accounts }));
        flash(`已导入 ${accounts.length} 个账号。`);
      } catch (err) {
        flash("解析 CSV 文件失败：" + err.message);
      }
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  }

  function publish() {
    updateTask(task.id, (old) => ({ ...old, status: "published" }));
    flash("任务已发布，前台首页可见。");
    jump("admin", task.id);
  }

  return (
    <main className="admin-layout">
      <后台侧栏 active="tasks" jump={jump} currentUser={currentUser} />
      <section className="admin-content">
        <步骤条 step={2} />
        <div className="config-grid">
          <section className="form-panel">
            <h2>{task.type === "evaluation" ? "测评题目" : "投票规则"}</h2>
            {task.type === "evaluation" ? (
              <>
                <div className="form-grid compact">
                  <label className="wide">题目标题<input value={questionDraft.title} onChange={(event) => setQuestionDraft({ ...questionDraft, title: event.target.value })} placeholder="如：责任意识与工作态度" /></label>
                  <label>题目类型<select value={questionDraft.type} onChange={(event) => setQuestionDraft({ ...questionDraft, type: event.target.value })}><option value="score">评分题</option><option value="grade">等级评价题</option></select></label>
                  <label>所属维度<input value={questionDraft.dimension} onChange={(event) => setQuestionDraft({ ...questionDraft, dimension: event.target.value })} placeholder="思想表现" /></label>
                  <label>最高分<input type="number" value={questionDraft.maxScore} onChange={(event) => setQuestionDraft({ ...questionDraft, maxScore: event.target.value })} /></label>
                  <label className="wide">等级选项<input value={questionDraft.options} onChange={(event) => setQuestionDraft({ ...questionDraft, options: event.target.value })} /></label>
                </div>
                <button type="button" onClick={addQuestion}><Plus size={16} />添加题目</button>
                <列表 items={task.questions || []} remove={removeQuestion} empty="暂无题目，民主测评至少需要一套题目。" />
              </>
            ) : (
              <div className="rule-card">
                <Vote size={24} />
                <strong>{task.type === "election" ? "差额 / 等额选举" : "作品单选 / 多选"}</strong>
                <span>当前限制每人最多选择 {task.voteLimit || 1} 个对象，提交后自动统计得票数和排名。</span>
              </div>
            )}
          </section>

          <section className="form-panel">
            <h2>{task.type === "work" ? "作品对象" : task.type === "election" ? "候选对象" : "测评对象"}</h2>
            <div className="form-grid compact">
              <label>对象名称<input value={objectDraft.name} onChange={(event) => setObjectDraft({ ...objectDraft, name: event.target.value })} /></label>
              <label>身份 / 作者<input value={objectDraft.meta} onChange={(event) => setObjectDraft({ ...objectDraft, meta: event.target.value })} /></label>
              <label className="wide">简介<textarea rows="3" value={objectDraft.description} onChange={(event) => setObjectDraft({ ...objectDraft, description: event.target.value })} /></label>
              <div className="upload-row wide">
                <label className="image-upload-label">
                  图片
                  <label className="secondary upload-btn" htmlFor="image-upload">
                    <Upload size={16} />{objectDraft.image ? objectDraft.image.name : "上传图片"}
                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {objectDraft.image && (
                    <button type="button" className="text-btn" onClick={() => setObjectDraft({ ...objectDraft, image: null })}>移除</button>
                  )}
                </label>
                <label className="attachment-upload-label">
                  附件
                  <label className="secondary upload-btn" htmlFor="attachment-upload">
                    <Upload size={16} />{objectDraft.attachment ? objectDraft.attachment.name : "上传附件"}
                    <input id="attachment-upload" type="file" onChange={handleAttachmentUpload} />
                  </label>
                  {objectDraft.attachment && (
                    <button type="button" className="text-btn" onClick={() => setObjectDraft({ ...objectDraft, attachment: null })}>移除</button>
                  )}
                </label>
              </div>
              <label className="color-upload-label wide">展示色<input type="color" value={objectDraft.color} onChange={(event) => setObjectDraft({ ...objectDraft, color: event.target.value })} /></label>
            </div>
            <button type="button" onClick={addObject}><Plus size={16} />添加对象</button>
            <列表 items={task.objects || []} remove={removeObject} empty="暂无应用对象，请添加候选人、测评对象或作品。" />
          </section>
        </div>

        {task.loginMode !== "none" && (
        <section className="account-panel">
          <div>
            <h2>任务账号</h2>
            <p>请上传 CSV 文件导入账号密码。您可以用 Excel 制作：第一列填账号，第二列填密码，然后保存为 CSV 格式。</p>
          </div>
          <div className="account-actions">
            <label className="secondary upload-btn" htmlFor="account-upload">
              <Upload size={16} />上传账号
              <input id="account-upload" type="file" accept=".csv" onChange={handleAccountUpload} />
            </label>
            <button className="secondary" disabled={!task.accounts?.length} type="button" onClick={() => 导出账号(task)}><Download size={16} />下载账号</button>
            <button type="button" onClick={publish}>发布任务</button>
          </div>
        </section>
        )}

        {task.loginMode === "none" && (
        <section className="publish-panel">
          <button type="button" onClick={publish}>发布任务</button>
        </section>
        )}
      </section>
    </main>
  );
}

function 列表({ items, remove, empty }) {
  if (!items.length) return <p className="muted list-empty">{empty}</p>;
  return (
    <div className="mini-list">
      {items.map((item) => (
        <div key={item.id}>
          <span><strong>{item.title || item.name}</strong><small>{item.dimension || item.meta || item.type}</small></span>
          <button className="icon-button danger-soft" type="button" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function 步骤条({ step }) {
  const steps = ["基本信息", "题目与对象", "发布设置"];
  return (
    <div className="steps">
      {steps.map((label, index) => (
        <div className={index + 1 <= step ? "done" : ""} key={label}>
          <span>{index + 1}</span>
          <b>{label}</b>
        </div>
      ))}
    </div>
  );
}

function 数据统计页({ task, jump, currentUser }) {
  const stats = 计算统计(task);
  const dimensions = task.type === "evaluation" ? Array.from(new Set((task.questions || []).map((question) => question.dimension || "综合评价"))) : [];

  return (
    <main className="admin-layout">
      <后台侧栏 active="stats" jump={jump} currentUser={currentUser} />
      <section className="admin-content">
        <div className="admin-title">
          <div>
            <p className="eyebrow">数据统计</p>
            <h1>{task.name}</h1>
          </div>
          <button type="button" onClick={() => 导出统计(task)}><Download size={17} />导出 CSV</button>
        </div>

        <section className="stat-cards">
          <div><strong>{stats.应参与人数}</strong><span>应参与人数</span></div>
          <div><strong>{stats.已完成人数}</strong><span>已完成人数</span></div>
          <div><strong>{stats.完成率}%</strong><span>完成率</span></div>
          <div><strong>{task.objects?.length || 0}</strong><span>{task.type === "work" ? "作品数量" : "对象数量"}</span></div>
        </section>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>排名</th>
                <th>对象</th>
                <th>{task.type === "evaluation" ? "总分" : "得票数"}</th>
                {dimensions.map((dimension) => <th key={dimension}>{dimension}</th>)}
                <th>参与完成</th>
              </tr>
            </thead>
            <tbody>
              {stats.排名.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td><strong>{row.name}</strong><span>{row.meta}</span></td>
                  <td><b className="score">{task.type === "evaluation" ? row.total : row.votes}</b></td>
                  {dimensions.map((dimension) => <td key={dimension}>{row.dimensions?.[dimension] ?? "-"}</td>)}
                  <td>{stats.已完成人数}/{stats.应参与人数}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="chart">
          {stats.排名.map((row) => {
            const value = task.type === "evaluation" ? row.total : row.votes;
            const max = Math.max(...stats.排名.map((item) => (task.type === "evaluation" ? item.total : item.votes)), 1);
            return (
              <div className="bar-row" key={row.id}>
                <span>{row.name}</span>
                <div><i style={{ width: `${(value / max) * 100}%` }} /></div>
                <b>{value}</b>
              </div>
            );
          })}
        </section>
      </section>
    </main>
  );
}
