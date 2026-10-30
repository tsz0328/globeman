package com.example.lucifer.login;

import com.example.lucifer.login.model.Info;
import com.example.lucifer.login.model.Register;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class LoginService {

    public static final Logger log = LoggerFactory.getLogger(LoginService.class);
    private final LoginMapper loginMapper;

    public LoginService(LoginMapper loginMapper) {
        this.loginMapper = loginMapper;
    }

    //注册
    public void register(Register register) {
        try{
            //加密密码
            register.setPassword(BCrypt.hashpw(register.getPassword(), BCrypt.gensalt(12)));
            register.setTime(LocalDateTime.now());
            loginMapper.insertRegister(register);
        }catch (Exception e){
            log.error("数据库信息插入失败{}",e.getMessage());
            throw new RuntimeException("数据库信息插入失败",e);
        }
    }

    //判断账号是否存在
    public boolean existsByAccount(String account) {
        try{
            return loginMapper.existsByAccount(account);
        }catch(Exception e){
            log.error("查询用户是否存在异常{}",e.getMessage());
            return false;
        }
    }

    //账号是否被禁用
    public boolean statusByAccount(String account) {
        try{
            return loginMapper.statusByAccount(account);
        }catch(Exception e){
            log.error("查询用户状态异常{}",e.getMessage());
            return false;
        }
    }

    //账号密码是否匹配
    public boolean login(String account, String password) {
        try {
            return BCrypt.checkpw(password,loginMapper.passwordByAccount(account));
        }catch (Exception e){
            log.error("账号密码匹配异常{}",e.getMessage());
            return false;
        }
    }

    //获取用户个人信息
    public Info infoByAccount(String account) {
        try{
            return loginMapper.infoByAccount(account);
        }catch (Exception e){
            log.error("获取用户信息失败{}",e.getMessage());
            return null;
        }
    }

    public Return<Info> getInfoByAccount() {
        try{
            return Return.success("获取信息成功",loginMapper.infoByAccount(Role.getAccount()));
        }catch (Exception e){
            log.error("获取用户个人信息失败{}",e.getMessage());
            return Return.error("获取用户个人信息失败");
        }
    }

    @Async
    public void registerLogin(String account, String ip) {
        try{
            loginMapper.registerLogin(account,ip,LocalDateTime.now());
        }catch (Exception e){
            log.error("登入登记失败{}",e.getMessage());
        }
    }
}
