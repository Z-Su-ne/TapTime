const Util = require("../../infrastructure/common/util");
  
class ObjectivesEntity {
  constructor(data) {
    this.uuid = data.uuid;
    this.userId = data.userId;
    this.title = data.title;
    this.description = data.description;
    this.reason = data.reason;
    this.priority = data.priority;
    this.scheduled = data.scheduled;
    this.progress = data.progress;
    this.status = data.status;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.delayDate = data.delayDate;
    this.rating = data.rating;
    this.review = data.review;
    this.sumFocus = data.sumFocus;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // 属性校验
  validate() {
    
  }
}

module.exports = ObjectivesEntity;