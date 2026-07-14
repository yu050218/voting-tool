export const 任务类型 = {
  election: "校内选举",
  evaluation: "民主测评",
  work: "作品投票"
};

export const 登录方式 = {
  none: "免密参与",
  random: "随机账号",
  assigned: "指定账号"
};

export const 状态文本 = {
  draft: "草稿",
  published: "已发布",
  cancelled: "已取消",
  ended: "已结束"
};

export const 初始任务 = [
  {
    id: "task-election-2026",
    name: "2026年学生会干部选举",
    description: "面向全体同学开放，请从候选人中最多选择 3 名支持对象。匿名统计，不展示投票人与选择内容的对应关系。",
    type: "election",
    status: "published",
    anonymous: true,
    loginMode: "random",
    voteLimit: 3,
    accountCount: 8,
    startAt: "2026-07-10T09:00",
    endAt: "2026-07-20T18:00",
    creator: "团委老师",
    objects: [
      { id: "obj-e-1", name: "李明明", meta: "高三(1)班 / 竞选主席", description: "学习成绩稳定，曾组织校园志愿活动和班级文体活动。", color: "#2f80ed", enabled: true },
      { id: "obj-e-2", name: "王晓红", meta: "高三(2)班 / 竞选副主席", description: "擅长沟通协调，负责过校运会志愿者组织工作。", color: "#9b51e0", enabled: true },
      { id: "obj-e-3", name: "陈志远", meta: "高三(3)班 / 竞选学习部长", description: "长期参与学习帮扶，关注同学反馈与学习资源整理。", color: "#27ae60", enabled: true },
      { id: "obj-e-4", name: "张建华", meta: "高三(4)班 / 竞选文体部长", description: "组织过班级篮球赛、校园艺术节节目统筹。", color: "#f2994a", enabled: true }
    ],
    questions: [],
    accounts: [
      { account: "XH-2026-001", password: "1001", used: false },
      { account: "XH-2026-002", password: "1002", used: false },
      { account: "XH-2026-003", password: "1003", used: false },
      { account: "XH-2026-004", password: "1004", used: false },
      { account: "XH-2026-005", password: "1005", used: false },
      { account: "XH-2026-006", password: "1006", used: false },
      { account: "XH-2026-007", password: "1007", used: false },
      { account: "XH-2026-008", password: "1008", used: false }
    ],
    records: [
      { id: "rec-e-1", account: "XH-2026-004", createdAt: "2026-07-10 10:22", answers: { selections: ["obj-e-1", "obj-e-2", "obj-e-3"] } },
      { id: "rec-e-2", account: "XH-2026-005", createdAt: "2026-07-10 10:35", answers: { selections: ["obj-e-1", "obj-e-3"] } }
    ]
  },
  {
    id: "task-evaluation-2026",
    name: "班委干部民主测评",
    description: "请逐一对班委工作表现进行评价。每个对象使用同一套测评题目，系统自动生成维度均分和总分排名。",
    type: "evaluation",
    status: "published",
    anonymous: true,
    loginMode: "random",
    voteLimit: 1,
    accountCount: 10,
    startAt: "2026-07-10T09:00",
    endAt: "2026-07-25T20:00",
    creator: "班主任",
    objects: [
      { id: "obj-m-1", name: "李明明", meta: "班长", description: "负责班级日常协调、活动通知和纪律维护。", color: "#2f80ed", enabled: true },
      { id: "obj-m-2", name: "王晓红", meta: "团支书", description: "负责团支部工作、主题团日和志愿服务安排。", color: "#eb5757", enabled: true },
      { id: "obj-m-3", name: "陈志远", meta: "学习委员", description: "负责作业收发、学习资料整理和学业反馈。", color: "#27ae60", enabled: true }
    ],
    questions: [
      { id: "q-m-1", title: "责任意识与工作态度", type: "score", dimension: "思想表现", maxScore: 10 },
      { id: "q-m-2", title: "组织能力与协调能力", type: "grade", dimension: "工作能力", options: ["优秀", "良好", "合格", "不合格"] },
      { id: "q-m-3", title: "服务意识与沟通表现", type: "score", dimension: "服务态度", maxScore: 10 }
    ],
    accounts: [
      { account: "MP-2026-001", password: "2001", used: false },
      { account: "MP-2026-002", password: "2002", used: false },
      { account: "MP-2026-003", password: "2003", used: false },
      { account: "MP-2026-004", password: "2004", used: false },
      { account: "MP-2026-005", password: "2005", used: false },
      { account: "MP-2026-006", password: "2006", used: false },
      { account: "MP-2026-007", password: "2007", used: false },
      { account: "MP-2026-008", password: "2008", used: false },
      { account: "MP-2026-009", password: "2009", used: false },
      { account: "MP-2026-010", password: "2010", used: false }
    ],
    records: [
      {
        id: "rec-m-1",
        account: "MP-2026-009",
        createdAt: "2026-07-10 11:08",
        answers: {
          evaluation: {
            "obj-m-1": { "q-m-1": 9, "q-m-2": "优秀", "q-m-3": 8 },
            "obj-m-2": { "q-m-1": 8, "q-m-2": "良好", "q-m-3": 9 },
            "obj-m-3": { "q-m-1": 8, "q-m-2": "优秀", "q-m-3": 8 }
          }
        }
      }
    ]
  },
  {
    id: "task-work-2026",
    name: "校园海报作品评选",
    description: "浏览作品简介后选择你支持的作品，最多可投 2 个。适合摄影、海报、征文和信息技术作品展示。",
    type: "work",
    status: "published",
    anonymous: true,
    loginMode: "none",
    voteLimit: 2,
    accountCount: 0,
    startAt: "2026-07-09T08:00",
    endAt: "2026-07-18T18:00",
    creator: "学生处",
    objects: [
      { id: "obj-w-1", name: "光影校园", meta: "作者：刘小燕", description: "用摄影记录清晨校园的光线变化和学生日常。", color: "#f2c94c", enabled: true, attachment: "作品说明.pdf" },
      { id: "obj-w-2", name: "绿色未来", meta: "作者：赵一帆", description: "以环保主题设计校园公益海报，强调低碳生活。", color: "#27ae60", enabled: true, attachment: "海报源文件.zip" },
      { id: "obj-w-3", name: "代码之美", meta: "作者：周晨", description: "信息技术社团作品，展示算法与视觉设计结合。", color: "#56ccf2", enabled: true, attachment: "演示材料.pptx" }
    ],
    questions: [],
    accounts: [],
    records: [
      { id: "rec-w-1", account: "免密用户-1", createdAt: "2026-07-10 09:40", answers: { selections: ["obj-w-1", "obj-w-2"] } },
      { id: "rec-w-2", account: "免密用户-2", createdAt: "2026-07-10 10:12", answers: { selections: ["obj-w-2"] } }
    ]
  }
];
