package com.example.lucifer.client.repair.model;

import java.util.List;

public class OrderDetail {
    //订单详情编号
    private long id;
    //归属订单
    private String order;
    //订单详情名称
    private String name;
    //订单详情型号
    private String model;
    //订单详情类型
    private String type;
    //订单详情品牌
    private String brand;
    //订单详情规格
    private String spec;
    //订单详情计划数量
    private int number;
    //时间入库数量
    private int quantity;
    //SN码（建单/导入时随明细录入，order_details.sn；维修入库扫描的 SN 走下方 SN 列表）
    private String sn;
    // 派发员工账号（维修单入库前指定接单人；入库时写入 sys_repair.account）
    private String assignee;
    // 原型号（维修改造单：改造清单「原型号」列）
    private String originalModel;
    // 改型号（维修改造单：改造清单「改型号」列）
    private String refitModel;
    // 加工项目（维修单两种形态都有：改造清单/型号清单的「加工项目」列）
    private String processItem;
    //SN码
    private List<String> SN;

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

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
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

    public List<String> getSN() {
        return SN;
    }

    public void setSN(List<String> SN) {
        this.SN = SN;
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
                ", quantity=" + quantity +
                ", sn='" + sn + '\'' +
                ", assignee='" + assignee + '\'' +
                ", originalModel='" + originalModel + '\'' +
                ", refitModel='" + refitModel + '\'' +
                ", processItem='" + processItem + '\'' +
                ", SN=" + SN +
                '}';
    }
}
