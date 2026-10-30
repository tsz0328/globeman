package com.example.lucifer.client.department;

import com.example.lucifer.util.Return;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface DepartmentMapper {

    @Select("select name from company_department where company = #{company}")
    List<String> getInfoDepartment(String company);

    @Insert("insert into company_department(name, company, time) values(#{department}, #{company}, #{now})")
    void createDepartment(String department, String company, LocalDateTime now);
}
