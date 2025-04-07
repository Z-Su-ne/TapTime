const Util = require("../../infrastructure/common/util");
  
class KeyresultsEntity {
  constructor(data) {
    this.uuid = data.uuid;
    this.objectiveId = data.objectiveId;
    this.title = data.title;
    this.sumFocus = data.sumFocus;
    this.targetFocus = data.targetFocus;
    this.valueType = data.valueType;
    this.valueCurrent = data.valueCurrent;
    this.valueOriginal = data.valueOriginal;
    this.valueTarget = data.valueTarget;
    this.progress = data.progress;
    this.description = data.description;
    this.rating = data.rating;
    this.review = data.review;
    this.isDel = data.isDel;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // 属性校验
  validate() {
    
  }
}

module.exports = KeyresultsEntity;