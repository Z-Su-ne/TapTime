### 说明

- 用户创建多个目标，每个目标有多个关键结果，通过达成关键结果来实现目标，目标和关键结果之间都有权重。关键结果有预计专注时间，根据预计专注时间计算每日专注时间和目标总专注时间。
- 设备特定动作开始专注计时，计时时间分配给当前权重最高的关键结果。用户每日计时任务进行记录。
- 数据看板中显示用户相较于所有任务的计时比较，目标看报中查看燃尽图。
- 任务结束后进行复盘，对各关键目标进行评价，根据目标完成度来分析时候需要延期。

### 用户表

user：{
uuid：主键
username：用户名
password：密码
tel：电话
email：邮件
role：用户角色

times：每日时长

created_at：创建时间
updated_at：更新时间
}

- 由于用户类型比较简单，预制管理员，角色区分仅用 role 区分

### 目标表

objectives：{
uuid：主键
title：目标名
motive：动机
feasibility：可行性
starttime：目标开始时间
endtime：目标结束时间

created_at：创建时间
updated_at：更新时间
}

- 用户创建多个目标，

### 关键结果表

key_results：{

}
