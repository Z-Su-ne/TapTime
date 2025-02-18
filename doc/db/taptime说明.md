### **数据库结构**

#### 1. 用户表

存储每位用户的基本信息，包括用户名、邮箱、密码哈希值等。

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 2. 周期表

存储每个 OKR 的时间框架，包括目标、开始和结束日期，以及创建人。

```sql
CREATE TABLE cycles (
    id UUID PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('normal', 'focus') DEFAULT 'normal',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_by UUID NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_focus (created_by, type),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### 3. 目标表

存储每个目标的详细信息，包括标题、描述、颜色等。外键指向用户表和周期表。

```sql
CREATE TABLE objectives (
    id UUID PRIMARY KEY AUTO_INCREMENT,
    user_id UUID NOT NULL,
    cycle_id UUID NOT NULL,
    parent_id UUID DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    color_hex CHAR(7),
    motive TEXT,
    feasibility TEXT,
    start_date DATE,
    end_date DATE,
    is_scheduled BOOLEAN DEFAULT FALSE,
    status ENUM('not_started', 'in_progress', 'pending_review', 'reviewed') DEFAULT 'not_started',
    progress TINYINT UNSIGNED DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 外键
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (cycle_id) REFERENCES cycles(id),
FOREIGN KEY (parent_id) REFERENCES objectives(id)
```

#### 4. 关键结果表（Key Results）

存储每个关键结果的目标值、当前值等信息。外键指向目标表。

```sql
CREATE TABLE key_results (
    id UUID PRIMARY KEY AUTO_INCREMENT,
    objective_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    initial_value DECIMAL(10, 2),
    target_value DECIMAL(10, 2),
    current_value DECIMAL(10, 2) DEFAULT 0.00,
    value_type ENUM('final', 'average', 'max', 'sum'),
    weight TINYINT UNSIGNED DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 外键
FOREIGN KEY (objective_id) REFERENCES objectives(id)
```

#### 5. 专注记录表

存储用户在设备上开启专注模式的时间信息。

```sql
CREATE TABLE focus_sessions (
    id UUID PRIMARY KEY AUTO_INCREMENT,
    user_id UUID NOT NULL,
    task_id UUID NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration INT,
    device_type ENUM('phone', 'esp32'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 外键
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (task_id) REFERENCES tasks(id)
```

#### 6. 设备表

存储用户拥有的设备信息。

```sql
CREATE TABLE devices (
    id UUID PRIMARY KEY AUTO_INCREMENT,
    user_id UUID NOT NULL,
    device_type ENUM('phone', 'esp32'),
    device_identifier VARCHAR(255) UNIQUE NOT NULL,
    last_connected DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 外键
FOREIGN KEY (user_id) REFERENCES users(id)
```

#### 7. 复盘记录表

存储复盘时的目标评分和评价。

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY AUTO_INCREMENT,
    objective_id UUID NOT NULL,
    user_id UUID NOT NULL,
    score DECIMAL(3, 1),
    evaluation TEXT,
    problems TEXT,
    thoughts TEXT,
    is_shared BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

-- 外键
FOREIGN KEY (objective_id) REFERENCES objectives(id),
FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 8. 任务表

存储每个任务的详细信息，包括目标、当前进度等。外键指向用户表和关键结果表。

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY AUTO_INCREMENT,
    user_id UUID NOT NULL,
    kr_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 外键
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (kr_id) REFERENCES key_results(id)
```

---

### **字段注释说明**

1. **用户表**

   - `username`：用户的用户名。
   - `email`：用户的电子邮件地址。
   - `password_hash`：用户的密码哈希值。
   - `role`：用户的角色（'user'或'admin'）。
   - `created_at` 和 `updated_at`：记录创建和最后一次更新的时间。

2. **周期表**

   - `name`：目标的名称。
   - `type`：目标类型，'normal' 为常规目标，'focus' 为目标聚焦模式。
   - `start_date` 和 `end_date`：目标的时间范围。
   - `created_by`：目标的创建人。

3. **目标表**

   - `user_id`、`cycle_id` 和 `parent_id`：用户、周期和父级目标的关系。
   - `title`：目标的标题。
   - `color_hex`：目标的颜色，用于视觉化。
   - `motive` 和 `feasibility`：目标的动机和可行性。
   - `start_date` 和 `end_date`：目标的时间范围。
   - `is_scheduled`：是否已安排。
   - `status`：当前状态（'not_started'、'in_progress' 等）。
   - `progress`：目标的进度。

4. **关键结果表**

   - `objective_id`：对应的目标。
   - `title`：关键结果的标题。
   - `initial_value` 和 `target_value`：关键结果的目标值。
   - `value_type`：值类型（'final'、'average' 等）。
   - `weight`：关键结果的重要性权重。

5. **专注记录表**

   - `user_id` 和 `task_id`：用户和任务的关系。
   - `start_time` 和 `end_time`：专注的时间段。
   - `duration`：专注时长。
   - `device_type`：使用的设备类型。

6. **复盘记录表**

   - `objective_id`、`user_id` 和 `score`：复盘的目标、用户和得分。
   - `evaluation`：复盘的评价描述。
   - `problems`、`thoughts` 等：问题记录和思考总结。

7. **任务表**

   - `user_id` 和 `kr_id`：用户和关键结果的关系。
   - `title`、`description` 和 `status`：任务的标题、描述和当前状态。
   - `due_date`：任务的截止日期。

8. **设备表**
   - `user_id`：用户的 ID。
   - `device_type`：设备类型。
   - `device_identifier`：设备唯一标识符。
   - `last_connected`：设备最后连接时间。
   - `created_at` 和 `updated_at`：记录创建和最后一次更新的时间。

---

### **示例查询优化**

1. **目标进度计算**：

```sql
SELECT users.username,
       MIN((objectives.progress / 100) * 100) AS progress,
       objectives.progress AS current_progress
FROM users
JOIN objectives ON users.id = objectives.user_id
GROUP BY users.username;
```

2. **复盘评分计算**：

```sql
WITH Progress AS (
    SELECT (key_results.target_value - key_results.initial_value +
           COALESCE(key_results.current_value, 0)) /
           key_results.target_value * 100 AS progress,
    objectives.progress,
    objectives.progress AS baseline_progress
FROM key_results
JOIN objectives ON key_results.objective_id = objectives.id
)
SELECT users.username,
       avg(Progress.progress) AS average_progress,
       avg(Progress.baseline_progress) AS baseline_average
FROM Progress
JOIN users ON Progress.users_id = users.id
GROUP BY users.username;
```

通过优化字段注释、主键设置和表结构，确保数据库设计简洁高效，同时符合企业级应用的需求。
