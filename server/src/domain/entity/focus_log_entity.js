const Util = require("../../infrastructure/common/util");
  
class FocuslogEntity {
  constructor(data) {
    this.uuid = data.uuid;
    this.objectiveId = data.objectiveId;
    this.keyResultsId = data.keyResultsId;
    this.times = data.times;
    this.timeStart = data.timeStart;
    this.timeEnd = data.timeEnd;
    this.description = data.description;
    this.isDel = data.isDel;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // 属性校验
  validate() {
    
  }
}

module.exports = FocuslogEntity;