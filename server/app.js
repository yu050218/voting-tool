const express = require('express');
const cors = require('cors');
const {
  getTasks,
  getTask,
  getTasksByCreator,
  getTaskByAccount,
  createTask,
  updateTask,
  deleteTask,
  getUserByUsername,
  getUserById,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  initSampleData
} = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

let sessions = {};

function generateSessionId() {
  return 'session-' + Date.now() + '-' + Math.random().toString(36).slice(2, 15);
}

function authenticate(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId || !sessions[sessionId]) {
    return res.status(401).json({ error: '未登录' });
  }
  req.user = sessions[sessionId];
  next();
}

function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '权限不足' });
  }
  next();
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  getUserByUsername(username, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user || user.password !== password) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    const sessionId = generateSessionId();
    sessions[sessionId] = { id: user.id, username: user.username, name: user.name, role: user.role };
    res.json({
      sessionId,
      user: { id: user.id, username: user.username, name: user.name, role: user.role }
    });
  });
});

app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (sessionId) {
    delete sessions[sessionId];
  }
  res.json({ success: true });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json(req.user);
});

app.get('/api/users', authenticate, authorizeAdmin, (req, res) => {
  getUsers((err, users) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(users);
  });
});

app.post('/api/users', authenticate, authorizeAdmin, (req, res) => {
  const { username, password, name, role } = req.body;
  const id = 'user-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
  createUser({ id, username, password, name, role: role || 'user' }, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: user.id, username: user.username, name: user.name, role: user.role });
  });
});

app.put('/api/users/:id', authenticate, authorizeAdmin, (req, res) => {
  updateUser(req.params.id, req.body, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
  });
});

app.delete('/api/users/:id', authenticate, authorizeAdmin, (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: '不能删除自己' });
  }
  deleteUser(req.params.id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

app.get('/api/tasks', authenticate, (req, res) => {
  if (req.user.role === 'admin') {
    getTasks((err, tasks) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(tasks);
    });
  } else {
    getTasksByCreator(req.user.id, (err, tasks) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(tasks);
    });
  }
});

app.get('/api/tasks/:id', authenticate, (req, res) => {
  getTask(req.params.id, (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: '任务不存在' });
    if (req.user.role !== 'admin' && task.creatorId !== req.user.id) {
      return res.status(403).json({ error: '无权访问此任务' });
    }
    res.json(task);
  });
});

app.post('/api/tasks', authenticate, (req, res) => {
  const task = { ...req.body, creatorId: req.user.id };
  createTask(task, (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json(task);
  });
});

app.put('/api/tasks/:id', authenticate, (req, res) => {
  getTask(req.params.id, (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: '任务不存在' });
    if (req.user.role !== 'admin' && task.creatorId !== req.user.id) {
      return res.status(403).json({ error: '无权修改此任务' });
    }
    updateTask(req.params.id, req.body, (err, updatedTask) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(updatedTask);
    });
  });
});

app.delete('/api/tasks/:id', authenticate, (req, res) => {
  getTask(req.params.id, (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: '任务不存在' });
    if (req.user.role !== 'admin' && task.creatorId !== req.user.id) {
      return res.status(403).json({ error: '无权删除此任务' });
    }
    deleteTask(req.params.id, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    });
  });
});

app.post('/api/tasks/:id/status', authenticate, (req, res) => {
  getTask(req.params.id, (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: '任务不存在' });
    if (req.user.role !== 'admin' && task.creatorId !== req.user.id) {
      return res.status(403).json({ error: '无权修改此任务状态' });
    }
    updateTask(req.params.id, { status: req.body.status }, (err, updatedTask) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(updatedTask);
    });
  });
});

app.post('/api/accounts/verify', (req, res) => {
  const { taskId, account, password } = req.body;
  getTask(taskId, (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: '任务不存在' });
    const found = (task.accounts || []).find(
      item => item.account === account && item.password === password
    );
    if (!found) return res.json({ valid: false, message: '账号或密码不正确' });
    if (found.used) return res.json({ valid: false, message: '该账号已提交过' });
    res.json({ valid: true, account: found.account, taskId: task.id });
  });
});

app.post('/api/tasks/:id/submit', (req, res) => {
  const { record } = req.body;
  getTask(req.params.id, (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: '任务不存在' });
    if (task.status !== 'published') return res.status(400).json({ error: '任务当前不可提交' });
    const alreadySubmitted = task.loginMode !== 'none' &&
      (task.accounts || []).find(item => item.account === record.account)?.used;
    if (alreadySubmitted) return res.status(400).json({ error: '该账号已提交过' });
    const updatedRecords = [...(task.records || []), record];
    const updatedAccounts = (task.accounts || []).map(item =>
      item.account === record.account ? { ...item, used: true, loggedAt: new Date().toLocaleString() } : item
    );
    updateTask(req.params.id, { records: updatedRecords, accounts: updatedAccounts }, (err, updatedTask) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, task: updatedTask });
    });
  });
});

app.get('/api/public/tasks', (req, res) => {
  getTasks((err, tasks) => {
    if (err) return res.status(500).json({ error: err.message });
    const publishedTasks = tasks.filter(t => t.status === 'published');
    res.json(publishedTasks);
  });
});

app.get('/api/public/tasks/:id', (req, res) => {
  getTask(req.params.id, (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task || task.status !== 'published') {
      return res.status(404).json({ error: '任务不存在或未发布' });
    }
    res.json(task);
  });
});

app.get('/api/public/task-by-account/:account', (req, res) => {
  getTaskByAccount(req.params.account, (err, task) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!task) return res.status(404).json({ error: '未找到该账号对应的任务' });
    res.json(task);
  });
});

function initAdminUser(callback) {
  getUserByUsername('admin', (err, user) => {
    if (err) return callback(err);
    if (user) return callback(null);
    createUser({
      id: 'user-admin-001',
      username: 'admin',
      password: 'admin123',
      name: '系统管理员',
      role: 'admin'
    }, (err) => {
      if (err) return callback(err);
      console.log('管理员账号初始化完成: admin / admin123');
      callback(null);
    });
  });
}

function initSampleUsers(callback) {
  getUserByUsername('teacher', (err, teacher) => {
    if (err) return callback(err);
    if (!teacher) {
      createUser({
        id: 'user-teacher-001',
        username: 'teacher',
        password: 'teacher123',
        name: '班主任张老师',
        role: 'user'
      }, (err) => {
        if (err) return callback(err);
        console.log('示例用户初始化完成: teacher / teacher123');
        callback(null);
      });
    } else {
      callback(null);
    }
  });
}

function updateSampleTasksWithCreator(callback) {
  getUserByUsername('teacher', (err, teacher) => {
    if (err) return callback(err);
    if (!teacher) return callback(null);
    getTasks((err, tasks) => {
      if (err) return callback(err);
      const tasksWithoutCreator = tasks.filter(t => !t.creatorId);
      if (tasksWithoutCreator.length === 0) {
        return callback(null);
      }
      let updated = 0;
      tasksWithoutCreator.forEach(task => {
        updateTask(task.id, { creatorId: teacher.id }, (err) => {
          if (err) return callback(err);
          updated++;
          if (updated === tasksWithoutCreator.length) {
            console.log(`已更新 ${updated} 个任务的创建者关联`);
            callback(null);
          }
        });
      });
    });
  });
}

initAdminUser((err) => {
  if (err) console.error('初始化管理员失败:', err);
  initSampleUsers((err) => {
    if (err) console.error('初始化示例用户失败:', err);
    initSampleData((err) => {
      if (err) console.error('初始化示例数据失败:', err);
      updateSampleTasksWithCreator((err) => {
        if (err) console.error('更新任务创建者关联失败:', err);
        app.listen(PORT, () => {
          console.log(`服务器运行在 http://localhost:${PORT}`);
        });
      });
    });
  });
});