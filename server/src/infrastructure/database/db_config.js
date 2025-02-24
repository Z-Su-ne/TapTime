const databaseConfig = {
  database_name: "taptime",

  table: {
    // 用户表
    users: {
      columns: {
        uuid: { type: "varchar", length: 36, primary: true },
        username: { type: "varchar", length: 50, unique: true },
        password: { type: "varchar", length: 255 },
        tel: { type: "varchar", length: 18, nullable: true },
        email: { type: "varchar", length: 64, unique: true },
        daily_focus: { type: "smallint" },
        role: { type: "varchar", length: 24, defaultTo: "user" },
        created_at: { type: "date", notNull: true },
        updated_at: { type: "date", notNull: true },
      },
      indexes: [{ columns: ["email"], unique: true }, { columns: ["created_at"] }],
    },

    // 目标表
    objectives: {
      columns: {
        uuid: { type: "varchar", length: 36, primary: true },
        user_id: { type: "varchar", length: 36 },
        title: { type: "varchar", length: 64 },
        description: { type: "text" },
        reason: { type: "text" },
        priority: { type: "tinyint" },
        scheduled: { type: "boolean", defaultTo: false },
        progress: { type: "decimal", precision: 5, scale: 2 },
        status: { type: "varchar", length: 24 },
        start_date: { type: "date" },
        end_date: { type: "date" },
        delay_date: { type: "date", nullable: true },
        rating: { type: "decimal", precision: 3, scale: 1 },
        review: { type: "text" },
        sum_focus: { type: "integer" },
        created_at: { type: "date", notNull: true },
        updated_at: { type: "date", notNull: true },
      },
    },

    // 关键目标表
    key_results: {
      columns: {
        uuid: { type: "varchar", length: 36, primary: true },
        objective_id: { type: "varchar", length: 36 },
        title: { type: "varchar", length: 64 },
        sum_focus: { type: "integer" },
        initial_value: { type: "varchar", length: 64 },
        target_value: { type: "varchar", length: 64 },
        current_value: { type: "varchar", length: 64 },
        value_type: { type: "varchar", length: 24 },
        progress: { type: "decimal", precision: 5, scale: 2 },
        description: { type: "text" },
        rating: { type: "decimal", precision: 3, scale: 1 },
        review: { type: "text" },
        created_at: { type: "date", notNull: true },
        updated_at: { type: "date", notNull: true },
      },
    },
  },
};

module.exports = databaseConfig;
