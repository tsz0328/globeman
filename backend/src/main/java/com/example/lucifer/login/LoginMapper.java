package com.example.lucifer.login;

import com.example.lucifer.login.model.Info;
import com.example.lucifer.login.model.Register;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;

@Mapper
public interface LoginMapper {

    @Select("select count(1) from sys_user where account = #{account}")
    Boolean existsByAccount(String account);

    @Insert("INSERT INTO sys_user(account, password, name, company, department,role, time) " +
            "VALUES(#{account}, #{password}, #{name}, #{company},#{department}, #{role}, #{time})")
    void insertRegister(Register register);

    @Select("select status from sys_user where account = #{account}")
    boolean statusByAccount(String account);

    @Select("select password from sys_user where account = #{account}")
    String passwordByAccount(String account);

    @Select("select * from sys_user where account = #{account}")
    Info infoByAccount(String account);

    @Insert("insert into login (account, ip, time) VALUES (#{account}, #{ip}, #{now})")
    void registerLogin(String account, String ip, LocalDateTime now);
}
