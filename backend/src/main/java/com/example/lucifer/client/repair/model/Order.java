package com.example.lucifer.client.repair.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;

public class Order {
    //订单编号
    private String id;
    //订单归属项目
    private String project;
    //订单名称
    private String name;
    //订单类型
    private String type;
    //订单创建时间
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime time;
    //订单负责人
    private String manager;
    //客户
    private String customer;
    //客户联系人
    private String contact;
    //客户联系人电话
    private String contactPhone;
    //执行地区省
    private String province;
    //执行地区市
    private String city;
    //执行地区区
    private String district;
    //送货地址
    private String address;
    //订单状态
    private String status;
    //订单创建人
    private String creator;
    //订单所属公司
    private String company;
    //是否已入库（维修入库：按订单登记工单到 sys_repair 后即视为已入库）
    private boolean inbound;
    //订单详情
    private List<OrderDetail> details;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProject() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    public String getManager() {
        return manager;
    }

    public void setManager(String manager) {
        this.manager = manager;
    }

    public String getCustomer() {
        return customer;
    }

    public void setCustomer(String customer) {
        this.customer = customer;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public boolean isInbound() {
        return inbound;
    }

    public void setInbound(boolean inbound) {
        this.inbound = inbound;
    }

    public List<OrderDetail> getDetails() {
        return details;
    }

    public void setDetails(List<OrderDetail> details) {
        this.details = details;
    }

    @Override
    public String toString() {
        return "Order{" +
                "id='" + id + '\'' +
                ", project='" + project + '\'' +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", time=" + time +
                ", manager='" + manager + '\'' +
                ", customer='" + customer + '\'' +
                ", contact='" + contact + '\'' +
                ", contactPhone='" + contactPhone + '\'' +
                ", province='" + province + '\'' +
                ", city='" + city + '\'' +
                ", district='" + district + '\'' +
                ", address='" + address + '\'' +
                ", status='" + status + '\'' +
                ", creator='" + creator + '\'' +
                ", company='" + company + '\'' +
                ", inbound=" + inbound +
                ", details=" + details +
                '}';
    }
}
