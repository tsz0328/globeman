package com.example.lucifer.client.order.model;

public class OrderDetail {
    //订单详情编号
    private long id;
    //归属订单
    private String order;
    //订单详情名称
    private String name;
    //订单详情型号
    private String model;
    //订单详情类型：仅维修模块消费（getOrder 响应序列化），订单侧不再写入
    private String type;
    //订单详情品牌
    private String brand;
    //订单详情规格
    private String spec;
    //计划数量：仅维修模块消费（getOrder 响应序列化），订单侧按「一行一台」管理不再写入
    private int number;
    //设备序列号/SN
    private String sn;

    // 派发员工账号（维修单入库前指定接单人；入库时写入 sys_repair.account）
    private String assignee;


    // 原型号（改造/销售单特有）
    private String originalModel;

    // 改型号（改造/销售单特有）
    private String refitModel;

    // 加工项目（改造/销售单特有）
    private String processItem;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getOrder() {
        return order;
    }

    public void setOrder(String order) {
        this.order = order;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getSpec() {
        return spec;
    }

    public void setSpec(String spec) {
        this.spec = spec;
    }

    public int getNumber() {
        return number;
    }

    public void setNumber(int number) {
        this.number = number;
    }

    public String getSn() {
        return sn;
    }

    public void setSn(String sn) {
        this.sn = sn;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public String getOriginalModel() {
        return originalModel;
    }

    public void setOriginalModel(String originalModel) {
        this.originalModel = originalModel;
    }

    public String getRefitModel() {
        return refitModel;
    }

    public void setRefitModel(String refitModel) {
        this.refitModel = refitModel;
    }

    public String getProcessItem() {
        return processItem;
    }

    public void setProcessItem(String processItem) {
        this.processItem = processItem;
    }

    @Override
    public String toString() {
        return "OrderDetail{" +
                "id=" + id +
                ", order='" + order + '\'' +
                ", name='" + name + '\'' +
                ", model='" + model + '\'' +
                ", type='" + type + '\'' +
                ", brand='" + brand + '\'' +
                ", spec='" + spec + '\'' +
                ", number=" + number +
                ", sn='" + sn + '\'' +
                ", assignee='" + assignee + '\'' +
                ", originalModel='" + originalModel + '\'' +
                ", refitModel='" + refitModel + '\'' +
                ", processItem='" + processItem + '\'' +
                '}';
    }
}
