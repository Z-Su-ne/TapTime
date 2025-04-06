const databaseConfig = {
  database_name: "taptime",
  table: {
    // 用户表
    users: {
      columns: {
        uuid: {
          type: "varchar",
          length: 36,
          primary: true,
          comment: "用户唯一标识符",
        },
        username: {
          type: "varchar",
          length: 50,
          unique: true,
          notNull: true,
          comment: "用户登录名",
        },
        password: {
          type: "varchar",
          length: 255,
          comment: "密码",
        },
        tel: {
          type: "varchar",
          length: 18,
          comment: "联系电话（允许为空）",
        },
        email: {
          type: "varchar",
          length: 64,
          unique: true,
          notNull: true,
          comment: "邮箱地址（唯一标识）",
        },
        daily_focus: {
          type: "smallint",
          unsigned: true,
          comment: "每日专注时间（单位：分钟）",
        },
        role: {
          type: "varchar",
          length: 24,
          defaultTo: "user",
          comment: "用户角色（user/admin 等）",
        },
        created_at: {
          type: "datetime",
          notNull: true,
          comment: "创建时间",
        },
        updated_at: {
          type: "datetime",
          notNull: true,
          comment: "最后更新时间",
        },
      },
    },

    // 目标表
    objectives: {
      columns: {
        uuid: {
          type: "varchar",
          length: 36,
          primary: true,
          comment: "目标唯一标识符",
        },
        user_id: {
          type: "varchar",
          length: 36,
          comment: "关联用户的 UUID",
        },
        title: {
          type: "varchar",
          length: 64,
          comment: "目标标题",
        },
        description: {
          type: "text",
          comment: "目标详细描述",
        },
        reason: {
          type: "text",
          comment: "设定目标的原因",
        },
        priority: {
          type: "tinyint",
          unsigned: true,
          comment: "优先级（1-5，数值越大优先级越高）",
        },
        scheduled: {
          type: "boolean",
          defaultTo: false,
          comment: "是否已安排计划",
        },
        progress: {
          type: "decimal",
          precision: 5,
          scale: 2,
          comment: "进度百分比（如 50.00 表示 50%）",
        },
        status: {
          type: "varchar",
          length: 24,
          comment: "目标状态（如 pending, in_progress, completed）",
        },
        start_date: {
          type: "date",
          comment: "计划开始日期",
        },
        end_date: {
          type: "date",
          comment: "计划结束日期",
        },
        delay_date: {
          type: "date",
          nullable: true,
          comment: "延期后的截止日期（允许为空）",
        },
        rating: {
          type: "decimal",
          precision: 3,
          scale: 1,
          comment: "评分（范围 0-10）",
        },
        review: {
          type: "text",
          comment: "目标完成后的总结",
        },
        sum_focus: {
          type: "integer",
          unsigned: true,
          comment: "总专注时间（单位：分钟）",
        },
        created_at: {
          type: "datetime",
          notNull: true,
          comment: "创建时间",
        },
        updated_at: {
          type: "datetime",
          notNull: true,
          comment: "最后更新时间",
        },
      },
    },

    // 关键结果表
    key_results: {
      columns: {
        uuid: {
          type: "varchar",
          length: 36,
          primary: true,
          comment: "关键结果唯一标识符",
        },
        objective_id: {
          type: "varchar",
          length: 36,
          comment: "关联目标的 UUID",
        },
        title: {
          type: "varchar",
          length: 64,
          comment: "关键结果标题",
        },
        sum_focus: {
          type: "integer",
          unsigned: true,
          comment: "总专注时间（单位：分钟）",
        },
        value_type: {
          type: "varchar",
          length: 24,
          comment: "值类型（如 numeric, percentage）",
        },
        value_current: {
          type: "integer",
          comment: "当前值",
        },
        value_original: {
          type: "integer",
          comment: "原始值",
        },
        value_target: {
          type: "integer",
          comment: "目标值",
        },
        progress: {
          type: "decimal",
          precision: 5,
          scale: 2,
          comment: "进度百分比（如 50.00 表示 50%）",
        },
        description: {
          type: "text",
          comment: "关键结果描述",
        },
        rating: {
          type: "decimal",
          precision: 3,
          scale: 1,
          comment: "评分（范围 0-10）",
        },
        review: {
          type: "text",
          comment: "关键结果完成后的总结",
        },
        created_at: {
          type: "datetime",
          notNull: true,
          comment: "创建时间",
        },
        updated_at: {
          type: "datetime",
          notNull: true,
          comment: "最后更新时间",
        },
      },
    },

    // 专注日志记录
    focus_log: {
      columns: {
        uuid: {
          type: "varchar",
          length: 36,
          primary: true,
          comment: "专注日志标识符",
        },
        objective_id: {
          type: "varchar",
          length: 36,
          comment: "关联目标的 UUID",
        },
        key_results_id: {
          type: "varchar",
          length: 64,
          comment: "关联关键结果的 UUID",
        },
        times: {
          type: "integer",
          comment: "专注时间（单位：分钟）",
        },
        time_start: {
          type: "datetime",
          comment: "专注开始时间",
        },
        time_end: {
          type: "datetime",
          comment: "专注结束时间",
        },
        description: {
          type: "text",
          comment: "关键结果描述",
        },
        created_at: {
          type: "datetime",
          notNull: true,
          comment: "创建时间",
        },
        updated_at: {
          type: "datetime",
          notNull: true,
          comment: "最后更新时间",
        },
      },
    },
  },
  foreignKeys: [
    {
      table: "objectives",
      columns: "user_id",
      references: {
        table: "users",
        columns: "uuid",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    {
      table: "key_results",
      columns: "objective_id",
      references: {
        table: "objectives",
        columns: "uuid",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  ],
};

module.exports = databaseConfig;
