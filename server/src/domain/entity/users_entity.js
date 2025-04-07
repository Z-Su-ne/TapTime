const Util = require("../../infrastructure/common/util");
  
class UsersEntity {
  constructor(data) {
    this.uuid = data.uuid;
    this.username = data.username;
    this.password = data.password;
    this.tel = data.tel;
    this.email = data.email;
    this.okrFocus = data.okrFocus;
    this.dailyFocus = data.dailyFocus;
    this.role = data.role;
    this.isDel = data.isDel;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // 属性校验
  validate() {
    
  }
}

module.exports = UsersEntity;