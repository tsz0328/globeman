package com.example.lucifer.client.assets.model;


import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Assets {

    private Long id;
    /**
     * 名称
     */
    private String name;

    /**
     * 型号
     */
    private String model;

    /**
     * 类型
     */
    private String type;

    /**
     * 价格
     */
    private BigDecimal price;

    /**
     * SN码
     */
    private String sn;

    /**
     * 使用人(用户账号)
     */
    private String account;

    /**
     * 放置位置
     */
    private String location;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime time;

    /**
     * 归属公司
     */
    private String company;

    /**
     * 登记人
     */
    private String register;

    private String status;

    private String reason;
    /**
     * 报废时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime scrap_time;

    /**
     * 获取主键
     */
    public Long getId() {
        return id;
    }

    /**
     * 设置主键
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * 获取名称
     */
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

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getSn() {
        return sn;
    }

    public void setSn(String sn) {
        this.sn = sn;
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
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

    public String getRegister() {
        return register;
    }

    public void setRegister(String register) {
        this.register = register;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getScrapTime() {
        return scrap_time;
    }

    public void setScrapTime(LocalDateTime scrap_time) {
        this.scrap_time = scrap_time;
    }

    @Override
    public String toString() {
        return "Assets{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", model='" + model + '\'' +
                ", type='" + type + '\'' +
                ", price=" + price +
                ", sn='" + sn + '\'' +
                ", account='" + account + '\'' +
                ", location='" + location + '\'' +
                ", time=" + time +
                ", company='" + company + '\'' +
                ", register='" + register + '\'' +
                ", status='" + status + '\'' +
                ", reason='" + reason + '\'' +
                ", scrap_time=" + scrap_time +
                '}';
    }
}
