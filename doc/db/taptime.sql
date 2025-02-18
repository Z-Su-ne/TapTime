-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 周期表
CREATE TABLE cycles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('normal','focus') DEFAULT 'normal',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_focus (created_by, type), -- 确保每个用户只有一个专注周期
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 目标表
CREATE TABLE objectives (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  cycle_id INT,
  parent_id INT DEFAULT NULL, -- 实现目标节点功能
  title VARCHAR(255) NOT NULL,
  color_hex CHAR(7) DEFAULT '#4CAF50',
  motive TEXT, -- 目标动机
  feasibility TEXT, -- 可行性分析
  start_date DATE,
  end_date DATE,
  is_scheduled BOOLEAN DEFAULT FALSE,
  status ENUM('not_started','in_progress','pending_review','reviewed') DEFAULT 'not_started',
  progress TINYINT UNSIGNED DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id),
  FOREIGN KEY (parent_id) REFERENCES objectives(id)
);

-- 关键结果表
CREATE TABLE key_results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  objective_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  initial_value DECIMAL(10,2) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) DEFAULT 0.00,
  value_type ENUM('final','average','max','sum') NOT NULL,
  weight TINYINT UNSIGNED DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (objective_id) REFERENCES objectives(id)
);

-- 专注周期目标权重表
CREATE TABLE cycle_objectives (
  cycle_id INT NOT NULL,
  objective_id INT NOT NULL,
  weight TINYINT UNSIGNED DEFAULT 1,
  PRIMARY KEY (cycle_id, objective_id),
  FOREIGN KEY (cycle_id) REFERENCES cycles(id),
  FOREIGN KEY (objective_id) REFERENCES objectives(id)
);

-- 关键结果记录表
CREATE TABLE kr_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  kr_id INT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  memo TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kr_id) REFERENCES key_results(id)
);

-- 复盘记录表
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  objective_id INT NOT NULL,
  user_id INT NOT NULL,
  score DECIMAL(3,1) NOT NULL, -- 综合评分
  evaluation TEXT NOT NULL, -- 复盘评价
  problems TEXT, -- 问题总结
  thoughts TEXT, -- 个人感想
  is_shared BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (objective_id) REFERENCES objectives(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
-- 任务表
CREATE TABLE tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  kr_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
  due_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (kr_id) REFERENCES key_results(id)
);
-- 专注记录表
CREATE TABLE focus_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  task_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration INT,
  device_type ENUM('phone', 'esp32') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
-- 设备表
CREATE TABLE devices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  device_type ENUM('phone', 'esp32') NOT NULL,
  device_identifier VARCHAR(255) UNIQUE NOT NULL,
  last_connected DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);