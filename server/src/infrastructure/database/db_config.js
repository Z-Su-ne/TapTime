const database = {
  name: "taptime",

  table: {
    // 用户表
    user: {
      uuid: uuid,
      username: varchart(50),
      password: varchart(255),
      tel: varchart(18),
      email: varchart(64),
      daily_focus: Uint16Array,
      role: varchart(24),
      created_at: Date,
      updated_at: Date,
      spare1: varchart(64),
      spare2: varchart(64),
      spare3: varchart(64),
    },
    // 目标表
    objectives: {
      uuid: uuid,
      user_id: uuid,
      title: varchart(64),
      description: Text,
      reason: Text,
      priority: Uint8Array,
      scheduled: Boolean,
      progress: Number,
      status: varchart(24),
      start_date: Date,
      end_date: Date,
      delay_date: Date,
      Rating: Number,
      Review: Text,
      sum_focus: Number,
      created_at: Date,
      updated_at: Date,
      spare1: varchart(64),
      spare2: varchart(64),
      spare3: varchart(64),

      FOREIGN_KEY: { user_id: "user" },
    },
    // 关键目标表
    key_results: {
      uuid: uuid,
      objectives_id: uuid,
      title: varchart(64),
      sum_focus: Number,
      initial_value: varchart(64),
      target_value: varchart(64),
      current_value: varchart(64),
      value_type: varchart(24),
      progress: Number,
      description: Text,
      Rating: Number,
      Review: Text,
      created_at: Date,
      updated_at: Date,
      spare1: varchart(64),
      spare2: varchart(64),
      spare3: varchart(64),

      FOREIGN_KEY: { objectives_id: "objectives" },
    },
  },
};

module.exports = database;
