package com.example.lucifer.login;

import com.example.lucifer.login.model.Info;
import com.example.lucifer.login.model.Login;
import com.example.lucifer.login.model.Register;
import com.example.lucifer.util.JwtUtil;
import com.example.lucifer.util.RSAUtil;
import com.example.lucifer.util.Return;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class LoginController {
    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    //注册用户
    @PostMapping("/register")
    public Return<String> register(@RequestBody Register register) {
        //判断接受数据是否为空
        if(register == null){
            return Return.error("数据为空");
        }
        //校验名称长度（最多7个字，超长直接拦截并返回明确原因，避免落到数据库抛500）
        if(register.getName() != null && register.getName().length() > 7){
            return Return.error("名称超过7个字长度限制");
        }
        //查询账号是否存在
        boolean result = loginService.existsByAccount(register.getAccount());
        if (result) {
            return Return.error("账号已存在");
        } else {
            //注册账号
            loginService.register(register);
            return Return.success("注册成功");
        }
    }

    @GetMapping("/rsa")//RSA公钥获取
    public Return<String> getPublicKey() {
        return Return.success("获取公钥成功",RSAUtil.getPublicKey());
    }

    //登入
    @PostMapping("/login")
    public Return<Map<String,String>> login(@RequestBody Login login, HttpServletRequest request) {
        if(login == null){
            return Return.error("数据为空");
        }
        try{
            login.setAccount(RSAUtil.decrypt(login.getAccount()));
            login.setPassword(RSAUtil.decrypt(login.getPassword()));
        } catch (Exception e) {
            return Return.error("RSA解密失败");
        }

        //查询账号是否存在
        boolean exist = loginService.existsByAccount(login.getAccount());
        if (exist) {
            //是否被禁用
            boolean status = loginService.statusByAccount(login.getAccount());
            if (status) {
                //账号密码是否匹配
                boolean result = loginService.login(login.getAccount(),login.getPassword());
                if (result) {
                    Map<String, Object> map = new  HashMap<>();
                    Info info = loginService.infoByAccount(login.getAccount());
                    map.put("account", login.getAccount());
                    map.put("company", info.getCompany());
                    map.put("role", info.getRole());
                    map.put("department",info.getDepartment());

                    Map<String,String> token = new HashMap<>();
                    token.put("token",JwtUtil.generateToken(map));
                    //登入登记
                    loginService.registerLogin(login.getAccount(), getClientIp(request));
                    return Return.success("登入成功", token);
                }else {
                    return Return.error("账号/密码错误");
                }
            }else{
                return Return.error("账号被禁用");
            }
        }else {
            return Return.error("账号不存在");
        }
    }

    //获取用户个人信息
    @GetMapping("/getInfoUser")
    public Return<Info> getInfoByAccount(){
        return loginService.getInfoByAccount();
    }

    public static String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 取第一个有效 IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
