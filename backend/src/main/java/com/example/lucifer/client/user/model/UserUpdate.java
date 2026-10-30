package com.example.lucifer.client.user.model;

import java.time.LocalDate;

/**
 * 修改用户信息的请求体。
 * account 允许被修改，因此用 originalAccount（修改前的账号）定位目标行；
 * role 存的是角色 code（sys_role.role），与查询返回的 UserInfo.role（中文名）语义不同。
 */
public class UserUpdate {
    private String originalAccount;
    private String account;
    private String name;
    private String company;
    private String department;
    private String role;
    private String sex;
    private String phone;
    private String email;
    private String card;
    private String address;
    private LocalDate birth;
    private String education;
    private String emergency;

    public String getOriginalAccount() {
        return originalAccount;
    }

    public void setOriginalAccount(String originalAccount) {
        this.originalAccount = originalAccount;
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCard() {
        return card;
    }

    public void setCard(String card) {
        this.card = card;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDate getBirth() {
        return birth;
    }

    public void setBirth(LocalDate birth) {
        this.birth = birth;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getEmergency() {
        return emergency;
    }

    public void setEmergency(String emergency) {
        this.emergency = emergency;
    }
}
