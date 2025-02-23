const Logger = require("../common/logger");
const dbConfig = require("./db_config");
const dbConnection = require("./db_connection");

const moduleName = "db_initialized.js";

async function databaseInitialize() {
  const knex = dbConnection;

  try {
    const dbName = dbConfig.name;
    const dbExists = await knex.raw(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`, [dbName]);

    if (dbExists[0].length === 0) {
      await adminKnex.raw(`CREATE DATABASE ??`, [dbName]);
      Logger.info(undefined, moduleName, Logger.status.SUCCESS, `Database ${dbName} created`);
    }

    // 按依赖顺序创建表
    const tables = ["user", "objectives", "key_results"];
    for (const tableName of tables) {
      const tableDef = dbConfig.table[tableName];

      // 检查表是否存在
      if (!(await knex.schema.hasTable(tableName))) {
        await knex.schema.createTable(tableName, (table) => {
          // 添加字段
          for (const [columnName, columnType] of Object.entries(tableDef)) {
            if (columnName === "FOREIGN_KEY") continue;
            defineColumn(table, columnName, columnType);
          }

          // 添加主键
          table.primary(["uuid"]);

          // 添加外键
          if (tableDef.FOREIGN_KEY) {
            for (const [fkColumn, refTable] of Object.entries(tableDef.FOREIGN_KEY)) {
              table.foreign(fkColumn).references("uuid").inTable(refTable);
            }
          }
        });
        Logger.info(undefined, moduleName, Logger.status.SUCCESS, `Table ${tableName} created`);
      } else {
        // 检查并添加缺失字段
        for (const [columnName, columnType] of Object.entries(tableDef)) {
          if (columnName === "FOREIGN_KEY") continue;

          if (!(await knex.schema.hasColumn(tableName, columnName))) {
            await knex.schema.alterTable(tableName, (table) => {
              defineColumn(table, columnName, columnType);
            });
            Logger.info(undefined, moduleName, Logger.status.SUCCESS, `Column ${columnName} added to ${tableName}`);
          }
        }

        // 检查并添加外键约束
        if (tableDef.FOREIGN_KEY) {
          for (const [fkColumn, refTable] of Object.entries(tableDef.FOREIGN_KEY)) {
            const constraintName = `${tableName}_${fkColumn}_foreign`;
            const constraintExists = await knex.select("*").from("information_schema.TABLE_CONSTRAINTS").where({
              CONSTRAINT_SCHEMA: dbName,
              TABLE_NAME: tableName,
              CONSTRAINT_NAME: constraintName,
              CONSTRAINT_TYPE: "FOREIGN KEY",
            });

            if (constraintExists.length === 0) {
              await knex.schema.alterTable(tableName, (table) => {
                table.foreign(fkColumn, constraintName).references("uuid").inTable(refTable);
              });
              Logger.info(undefined, moduleName, Logger.status.SUCCESS, `Foreign key ${fkColumn} added to ${tableName}`);
            }
          }
        }
      }
    }

    await knex.destroy();
    await adminKnex.destroy();
    Logger.info(undefined, moduleName, Logger.status.SUCCESS, "Database initialization completed");
  } catch (error) {
    Logger.error(undefined, moduleName, Logger.status.ERROR, error);
    await adminKnex.destroy();
    process.exit(1);
  }
}

function defineColumn(table, columnName, columnType) {
  const columnConfig = {
    // User Table
    uuid: () => table.uuid(columnName).notNullable(),
    username: () => table.string(columnName, 50),
    password: () => table.string(columnName, 255),
    tel: () => table.string(columnName, 18),
    email: () => table.string(columnName, 64),
    daily_focus: () => table.smallint(columnName).unsigned(),
    role: () => table.string(columnName, 24),

    // Common Columns
    created_at: () => table.timestamp(columnName).defaultTo(knexLib.fn.now()),
    updated_at: () => table.timestamp(columnName).defaultTo(knexLib.fn.now()),
    spare1: () => table.string(columnName, 64),
    spare2: () => table.string(columnName, 64),
    spare3: () => table.string(columnName, 64),

    // Objectives Table
    title: () => table.string(columnName, 64),
    description: () => table.text(columnName),
    reason: () => table.text(columnName),
    priority: () => table.tinyint(columnName).unsigned(),
    scheduled: () => table.boolean(columnName),
    progress: () => table.integer(columnName),
    status: () => table.string(columnName, 24),
    start_date: () => table.dateTime(columnName),
    end_date: () => table.dateTime(columnName),
    delay_date: () => table.dateTime(columnName),
    Rating: () => table.integer(columnName),
    Review: () => table.text(columnName),
    sum_focus: () => table.integer(columnName),

    // Key Results Table
    initial_value: () => table.string(columnName, 64),
    target_value: () => table.string(columnName, 64),
    current_value: () => table.string(columnName, 64),
    value_type: () => table.string(columnName, 24),
  };

  if (columnConfig[columnName]) {
    columnConfig[columnName]();
  } else {
    throw new Error(`Unsupported column type: ${columnName}`);
  }
}

databaseInitialize();
