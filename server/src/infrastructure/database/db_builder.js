const fs = require("fs");
const path = require("path");
const dbConfig = require("./db_config");

const ENTITY_DIR = path.join(__dirname, "../../domain/entity");
const REPO_DIR = path.join(__dirname, "../../domain/repo");

// 转换为驼峰命名
function toCamelCase(str) {
  return str.replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
}

// 生成实体类
function generateEntity(tableName, columns) {
  const className = `${tableName.charAt(0).toUpperCase()}${tableName.slice(1).replace(/_/g, "")}Entity`;
  const camelColumns = Object.keys(columns).map(toCamelCase);

  return `const Util = require("../../infrastructure/common/util");
  
class ${className} {
  constructor(data) {
    ${camelColumns
      .map(
        (col) => `this.${col} = data.${col};`
        // {
        // return col === "uuid"
        //   ? `this.${col} = data.${col} || Util.uuid();`
        //   : `this.${col} = data.${col};`;
        // }
      )
      .join("\n    ")}
  }

  // 属性校验
  validate() {
    
  }
}

module.exports = ${className};`;
}

// 生成仓库类
function generateRepo(tableName, columns) {
  const className = `${tableName.charAt(0).toUpperCase()}${tableName.slice(1).replace(/_/g, "")}Repo`;
  const entityName = `${className.replace("Repo", "Entity")}`;

  return `const { AppError, ErrorMap } = require("../../interfaces/error");
const Logger = require("../../infrastructure/common/logger");

const BaseRepo = require("./base_repo");
const ${entityName} = require("../entity/${tableName}_entity");

moduleName = "${tableName}_repo.js";

class ${className} extends BaseRepo {
  constructor() {
    try {
      super( "${tableName}", ${entityName}); 
    } catch (error) {
      throw new AppError(Logger.SYSTEM, moduleName, ErrorMap.SYSTEM.DB_QUERY_FAILED, "constructor", true, error);
    }
  }

  // 自定义方法
}

module.exports = ${className};`;
}

// 主构建函数
function build() {
  [ENTITY_DIR, REPO_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  Object.entries(dbConfig.table).forEach(([tableName, tableConfig]) => {
    // 生成实体文件
    const entityCode = generateEntity(tableName, tableConfig.columns);
    fs.writeFileSync(path.join(ENTITY_DIR, `${tableName}_entity.js`), entityCode);

    // 生成仓库文件
    const repoCode = generateRepo(tableName, tableConfig.columns);
    fs.writeFileSync(path.join(REPO_DIR, `${tableName}_repo.js`), repoCode);
  });
}

build();
