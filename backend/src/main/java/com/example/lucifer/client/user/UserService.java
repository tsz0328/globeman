package com.example.lucifer.client.user;

import com.example.lucifer.client.user.model.UserInfo;
import com.example.lucifer.client.user.model.UserUpdate;
import com.example.lucifer.util.FileUtil;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    @Autowired
    private UserMapper userMapper;

    public Return<Map<String, Map<String,Object>>> getUser() {
        try{
            if(Role.getRole().equals("admin")){
                return Return.success("获取成功",userMapper.getAllUser());
            }else {
                return Return.success("获取成功",userMapper.getUserByCompany(Role.getCompany()));
            }
        } catch (Exception e) {
            log.error("获取用户信息失败{}",e.getMessage());
            return Return.error("获取用户信息失败");
        }
    }


    public Return<List<String>> getCompanyInfo() {
        try{
            if(Role.getRole().equals("admin")){
                return Return.success(userMapper.getCompanyInfo());
            }else{
                List<String> company = new ArrayList<>();
                company.add(Role.getCompany());
                return Return.success(company);
            }
        }catch (Exception e){
            log.error("获取公司列表失败{}",e.getMessage());
            return Return.error("获取公司列表失败");
        }
    }

    public Return<List<Map<String,Object>>> getRoleInfo() {
        try{
            return Return.success(userMapper.getRoleInfo());
        }catch (Exception e){
            log.error("获取权限列表失败{}",e.getMessage());
            return Return.error("获取权限列表失败");
        }
    }

    public Return<List<String>> getDepartmentInfo() {
        try{
            return Return.success(userMapper.getDepartmentInfo(Role.getCompany()));
        }catch (Exception e){
            log.error("获取部门列表失败{}",e.getMessage());
            return Return.error("获取部门列表失败");
        }
    }

    public Return<Map<String,Object>> updateUserStatus(String account) {
        try{
            String status = userMapper.getUserStatus(account);
            Map<String,Object> map = new HashMap<>();
            if(status.equals("1")){
                map.put("status",0);
                userMapper.updateUserStatus(0,account);
            }else{
                map.put("status",1);
                userMapper.updateUserStatus(1,account);
            }
            return Return.success("账号状态更新成功",map);
        }catch (Exception e){
            log.error("更新账号状态失败{}",e.getMessage());
            return Return.error("更新账号状态失败");
        }
    }

    public Return<String> deleteUserByAccount(String account) {
        try{
            userMapper.deleteUserByAccount(account);
            return Return.success("删除账号成功");
        }catch (Exception e){
            log.error("删除账号失败{}",e.getMessage());
            return Return.error("删除账号失败");
        }
    }

    public Return<UserInfo> getUserByAccount(String account) {
        try{
            return Return.success("获取成功",userMapper.getUserByAccount(account));
        }catch (Exception e){
            log.error("账号信息获取{}",e.getMessage());
            return Return.error("账号信息获取");
        }
    }

    public Return<String> updateUser(UserUpdate userUpdate) {
        try{
            // 账号若被修改，先校验新账号是否已被占用，避免唯一键冲突
            String originalAccount = userUpdate.getOriginalAccount();
            if (originalAccount != null && !originalAccount.equals(userUpdate.getAccount())) {
                if (userMapper.countByAccount(userUpdate.getAccount()) > 0) {
                    return Return.error("该账号已存在，无法修改");
                }
            }
            int rows = userMapper.updateUserInfo(userUpdate);
            if (rows > 0) {
                return Return.success("修改成功");
            }
            return Return.error("未找到该用户，修改失败");
        }catch (Exception e){
            log.error("修改用户信息失败{}",e.getMessage());
            return Return.error("修改用户信息失败");
        }
    }

    public Return<List<String>> uploadImages(MultipartFile[] files, String account) {
        try {
            List<String> urls = new ArrayList<>();
            for(MultipartFile file : files){
                //保存照片返回文件名
                String fileName = FileUtil.saveImage(file);
                //拼接文件名
                String imgUrl = FileUtil.getPictureUrl(fileName);
                urls.add(imgUrl);
            }
            //保存到数据库中
            updateImg(urls,account);
            return Return.success("证书上传成功",urls);
        }catch (IOException e) {
            throw new RuntimeException("图片上传失败：" + e.getMessage(), e);
        }
    }

    @Async
    public void updateImg(List<String> urls, String account) {
        try {
            for (String url : urls) {
                String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                userMapper.updateImg(account,url,time);
            }
        }catch (Exception e){
            log.error("图片路径保存数据库失败{}",e.getMessage());
        }
    }

    public Return<List<String>> getCertificateByUser(String account) {
        try{
            return Return.success("获取用户证书成功",userMapper.getCertificateByUser(account));
        }catch (Exception e){
            log.error("获取用户证书失败{}",e.getMessage());
            return Return.error("获取用户证书失败");
        }
    }

    public Return<String> deleteCertificate(String url) {
        try {
            //删除文件
            FileUtil.deleteFile(url);
            userMapper.deleteCertificate(url);
            return Return.success("删除成功");
        } catch (Exception e) {
            log.error("删除失败{}",e.getMessage());
            return Return.error("删除失败");
        }
    }

}
