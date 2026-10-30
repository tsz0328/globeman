package com.example.lucifer.client.repair.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class Accept {
    private int id;
    private String sn;
    private String account;
    private String status;
    private String description;
    private String diagnosis;
    private String dispose;
    private String result;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime repairTime;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime time;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime takeTime;
    private String name;
    private String model;
    private String type;
    private String brand;
    private String spec;
    private String headName;

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDispose() {
        return dispose;
    }

    public void setDispose(String dispose) {
        this.dispose = dispose;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public LocalDateTime getRepairTime() {
        return repairTime;
    }

    public void setRepairTime(LocalDateTime repairTime) {
        this.repairTime = repairTime;
    }

    public LocalDateTime getTime() {
        return time;
    }

    public void setTime(LocalDateTime time) {
        this.time = time;
    }

    public LocalDateTime getTakeTime() {
        return takeTime;
    }

    public void setTakeTime(LocalDateTime takeTime) {
        this.takeTime = takeTime;
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

    public String getHeadName() {
        return headName;
    }

    public void setHeadName(String headName) {
        this.headName = headName;
    }

    @Override
    public String toString() {
        return "Accept{" +
                "id=" + id +
                ", sn='" + sn + '\'' +
                ", account='" + account + '\'' +
                ", status='" + status + '\'' +
                ", description='" + description + '\'' +
                ", diagnosis='" + diagnosis + '\'' +
                ", dispose='" + dispose + '\'' +
                ", result='" + result + '\'' +
                ", repairTime=" + repairTime +
                ", time=" + time +
                ", takeTime=" + takeTime +
                ", name='" + name + '\'' +
                ", model='" + model + '\'' +
                ", type='" + type + '\'' +
                ", brand='" + brand + '\'' +
                ", spec='" + spec + '\'' +
                ", headName='" + headName + '\'' +
                '}';
    }
}
