package com.example.lucifer.client.department;

import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DepartmentService {
    private static final Logger log = LoggerFactory.getLogger(DepartmentService.class);
    @Autowired
    private DepartmentMapper departmentMapper;

    public Return<List<String>> getInfoDepartment() {
        try{
            return Return.success("获取部门信息成功",departmentMapper.getInfoDepartment(Role.getCompany()));
        }catch (Exception e){
            log.error("获取部门列表失败{}",e.getMessage());
            return Return.error("获取部门列表失败");
        }
    }

    public Return<String> createDepartment(String department) {
        try{
            departmentMapper.createDepartment(department,Role.getCompany(), LocalDateTime.now());
            return Return.success("创建部门成功", department);
        }catch (Exception e){
            log.error("创建部门失败{}",e.getMessage());
            return Return.error("创建部门失败");
        }
    }
}
