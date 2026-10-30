package com.example.lucifer.util;


public class Role {

    private static final ThreadLocal<String> ACCOUNT = new ThreadLocal<>();
    private static final ThreadLocal<String> COMPANY = new ThreadLocal<>();
    private static final ThreadLocal<String> ROLE = new ThreadLocal<>();
    private static final ThreadLocal<String> DEPARTMENT = new ThreadLocal<>();

    public static void setLoginUser(String account, String company, String role, String department) {
        ACCOUNT.set(account);
        COMPANY.set(company);
        DEPARTMENT.set(department);
        ROLE.set(role);
    }

    // 获取当前登录账号
    public static String getAccount() {
        return ACCOUNT.get();
    }

    // 获取当前登录人公司
    public static String getCompany() {
        return COMPANY.get();
    }

    // 获取当前角色
    public static String getRole() {
        return ROLE.get();
    }

    public static String getDepartment() {return DEPARTMENT.get();}

    // 清空
    public static void clear() {
        ACCOUNT.remove();
        COMPANY.remove();
        DEPARTMENT.remove();
        ROLE.remove();
    }
}
