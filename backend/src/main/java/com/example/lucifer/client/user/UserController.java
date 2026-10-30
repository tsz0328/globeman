package com.example.lucifer.client.user;

import com.example.lucifer.client.user.model.UserInfo;
import com.example.lucifer.client.user.model.UserUpdate;
import com.example.lucifer.util.Return;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/client/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    //获取可筛选公司信息
    @GetMapping("/getInfoCompany")
    public Return<List<String>>  getCompanyInfo(){
        return userService.getCompanyInfo();
    }

    //获取可筛选职位
    @GetMapping("/getInfoRole")
    public Return<List<Map<String,Object>>> getRoleInfo(){
        return userService.getRoleInfo();
    }

    //获取可筛选部门
    @GetMapping("/getInfoDepartment")
    public Return<List<String>>  getDepartmentInfo(){
        return userService.getDepartmentInfo();
    }

    //禁用/启用账号
    @PutMapping("/updateStatus")
    public Return<Map<String,Object>> updateUserStatus(@RequestParam String account){
        return userService.updateUserStatus(account);
    }

    //获取用户列表
    @GetMapping("/get")
    public Return<Map<String, Map<String,Object>>> getUser(){
        return userService.getUser();
    }

    //删除用户
    @PutMapping("/delete")
    public Return<String> deleteUserByAccount(@RequestParam String account){
        return userService.deleteUserByAccount(account);
    }

    //获取用户信息
    @GetMapping("/getInfoUser")
    public Return<UserInfo> getUserByAccount(@RequestParam String account){
        return userService.getUserByAccount(account);
    }

    //修改用户信息
    @PutMapping("/update")
    public Return<String> updateUser(@RequestBody UserUpdate userUpdate){
        return userService.updateUser(userUpdate);
    }

    //上传用户证书
    @PostMapping("/updateImg")
    public Return<List<String>> updateImg(@RequestParam("files") MultipartFile[] files,@RequestParam String account){
        if(account==null||files==null){
            return Return.error("接收数据为空");
        }
        return userService.uploadImages(files,account);
    }

    //获取用户证书
    @GetMapping("/getCertificate")
    public Return<List<String>> getCertificateByUser(@RequestParam String account){
        return userService.getCertificateByUser(account);
    }

    //删除用户证书
    @PutMapping("/deleteCertificate")
    public Return<String> deleteCertificate(@RequestParam String url){
        return userService.deleteCertificate(url);
    }
}
