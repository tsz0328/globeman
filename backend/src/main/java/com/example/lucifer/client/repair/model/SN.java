package com.example.lucifer.client.repair.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class SN {
    // SN码
    private String sn;
    //归属订单详情id
    private String id;
    //入库人
    private String register;
    //创建时间
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime time;

    public String getSn() {
        return sn;
    }

    public void setSn(String sn) {
        this.sn = sn;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRegister() {
        return register;
    }

    public void setRegister(String register) {
        this.register = register;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    @Override
    public String toString() {
        return "SN{" +
                "sn='" + sn + '\'' +
                ", id='" + id + '\'' +
                ", register='" + register + '\'' +
                ", time=" + time +
                '}';
    }
}
