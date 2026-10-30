package com.example.lucifer.client.project.model;

import java.time.LocalDateTime;

public class Project {

    /**
     * 项目编号
     */
    private String id;

    /**
     * 项目名称
     */
    private String name;

    /**
     * 项目类型
     */
    private String type;

    /**
     * 项目状态
     */
    private String status;

    /**
     * 客户
     */
    private String customer;

    /**
     * 客户联系人
     */
    private String contact;

    /**
     * 负责人
     */
    private String manager;

    /**
     * 创建时间
     */
    private LocalDateTime time;

    /**
     * 归属公司
     */
    private String company;

    /**
     * 创建人
     */
    private String account;


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public String getManager() {
        return manager;
    }

    public void setManager(String manager) {
        this.manager = manager;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    @Override
    public String toString() {
        return "Project{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", status='" + status + '\'' +
                ", customer='" + customer + '\'' +
                ", contact='" + contact + '\'' +
                ", manager='" + manager + '\'' +
                ", time=" + time +
                ", company='" + company + '\'' +
                ", account='" + account + '\'' +
                '}';
    }
}
