package com.example.lucifer.client.user;

import com.example.lucifer.client.user.model.UserInfo;
import com.example.lucifer.client.user.model.UserUpdate;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserMapper {

    @MapKey("id")
    @Select("SELECT sys_user.id,sys_user.account,sys_user.name, sys_user.company ,sys_user.department, sys_role.name AS role ,sys_user.status ,sys_user.time " +
            "FROM sys_user " +
            "LEFT JOIN sys_role ON sys_user.role = sys_role.role ")
    Map<String, Map<String,Object>> getAllUser();

    @MapKey("id")
    @Select("SELECT sys_user.id,sys_user.account,sys_user.name, sys_user.department, sys_role.name AS role ,sys_user.status ,sys_user.time " +
            "FROM sys_user " +
            "LEFT JOIN sys_role ON sys_user.role = sys_role.role " +
            "WHERE sys_user.company = #{company}")
    Map<String,Map<String,Object>> getUserByCompany(String company);

    @Select("select name from sys_company")
    List<String> getCompanyInfo();

    @Select("select role,name from sys_role")
    List<Map<String,Object>> getRoleInfo();

    @Select("select name from company_department where company = #{company}")
    List<String> getDepartmentInfo(String company);

    @Select("select status from sys_user where account = #{account}")
    String getUserStatus(String account);

    @Update("update sys_user set status = #{i} where account = #{account}")
    void updateUserStatus(int i,String account);

    @Delete("delete from sys_user where account = #{account}")
    void deleteUserByAccount(String account);

    @Select("select sys_user.account, sys_user.name, sys_user.company, sys_user.department, sys_role.name AS role, sys_role.role AS roleCode, sys_user.status, sys_user.time, sys_user.birth, sys_user.email, sys_user.phone, sys_user.address, sys_user.card, sys_user.sex, sys_user.education, sys_user.emergency " +
            "FROM sys_user " +
            "LEFT JOIN sys_role ON sys_user.role = sys_role.role " +
            "WHERE sys_user.account = #{account}")
    UserInfo getUserByAccount(String account);

    // 修改用户信息（account 允许修改，故用 originalAccount 定位；role 存角色 code）
    @Update("update sys_user set account = #{account}, name = #{name}, company = #{company}, department = #{department}, role = #{role}, sex = #{sex}, phone = #{phone}, email = #{email}, card = #{card}, address = #{address}, birth = #{birth}, education = #{education}, emergency = #{emergency} where account = #{originalAccount}")
    int updateUserInfo(UserUpdate userUpdate);

    // 账号是否已存在（修改账号时校验唯一）
    @Select("select count(1) from sys_user where account = #{account}")
    int countByAccount(String account);

    @Insert("insert into user_certificate set account = #{account},url = #{url},time = #{time}")
    void updateImg(String account, String url, String time);

    @Select("select url from user_certificate where account = #{account}")
    List<String> getCertificateByUser(String account);

    @Delete("delete from user_certificate where url = #{url}")
    void deleteCertificate(String url);
}
