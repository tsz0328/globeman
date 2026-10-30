package com.example.lucifer.client.project;

import com.example.lucifer.client.order.model.Order;
import com.example.lucifer.client.order.model.OrderDetail;
import com.example.lucifer.client.project.model.Project;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface ProjectMapper {

    @Select("SELECT * FROM sys_project where company = #{company}")
    List<Project> getProject(String company);

    @Insert("insert into sys_project (id, name, type, status, customer, contact, manager, time, company, account) values (#{id}, #{name}, #{type}, '执行中', #{customer}, #{contact}, #{manager}, #{time}, #{company}, #{account})")
    void addProject(Project project);

    @Update("update order_head set project = #{projectId} where id = #{orderId}")
    void orderProject(String projectId, String orderId);

    @Delete("delete from sys_project where id = #{id}")
    void deleteProject(String id);

    @Select("select * from order_head where company = #{company} and project = #{projectId}")
    List<Order> getOrderHeadByCompany(String company, String projectId);

    @Select("select * from order_details where `order` = #{id}")
    List<OrderDetail> getOrderDetailByOrderHeadId(String id);
}
