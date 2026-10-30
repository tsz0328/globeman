package com.example.lucifer.client.person;

import com.example.lucifer.client.person.model.Person;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface PersonMapper {

    @Update("update sys_user set email = #{email} where account = #{account}")
    String uploadEmail(String account, String email);

    @Select("select sys_user.account, sys_user.name, sys_user.company, sys_user.department, sys_role.name AS role, sys_user.status, sys_user.time, sys_user.birth, sys_user.email, sys_user.phone, sys_user.address, sys_user.card, sys_user.sex, sys_user.education, sys_user.emergency, sys_user.avatar " +
            "FROM sys_user " +
            "LEFT JOIN sys_role ON sys_user.role = sys_role.role " +
            "WHERE sys_user.account = #{account}")
    Person getUserByAccount(String account);

    @Update("update sys_user set avatar = #{imgUrl} where account = #{account}")
    void updateAvatar(String account, String imgUrl);

    @Update("update sys_user set password = #{password} where account = #{account}")
    void updatePassword(String account, String password);
}
