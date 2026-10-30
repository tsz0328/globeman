package com.example.lucifer.client.order;

import com.example.lucifer.client.order.model.Customer;
import com.example.lucifer.client.order.model.Manager;
import com.example.lucifer.client.order.model.OrderDetail;
import com.example.lucifer.client.order.model.Order;
import org.apache.ibatis.annotations.*;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.List;

@Mapper
public interface OrderMapper {

    @Select("select * from order_head where company = #{company}")
    List<Order> getOrderHeadByCompany(String company);

    @Select("select * from order_details where `order` = #{id}")
    List<OrderDetail> getOrderDetailByOrderHeadId(String id);

    @Insert("insert into order_head " +
            "(id,project,name,type,creator, company,time,manager, customer, contact,contactPhone,province,city,district,address,status) " +
            "values " +
            "(#{id},#{project},#{name},#{type},#{creator}, #{company},#{time},#{manager}, #{customer}, #{contact},#{contactPhone},#{province},#{city},#{district},#{address},#{status})")
    void addOrderHead(Order order);

    @Insert("insert into order_details " +
            "(id, `order`, name, model, brand, spec, sn, original_model, refit_model, process_item) " +
            "values " +
            "(#{id}, #{order}, #{name}, #{model}, #{brand}, #{spec}, #{sn}, #{originalModel}, #{refitModel}, #{processItem})")
    void addOrderDetail(OrderDetail orderDetail);

    @Delete("delete from order_details where id = #{id}")
    void deleteOrderDetailById(Integer id);

    @Delete("delete from sys_repair where details = #{id}")
    void deleteOrderDetailByDetailId(Integer id);

    @Update("update order_head set name = #{name}, manager = #{manager}, customer = #{customer}, contact = #{contact}, contactPhone = #{contactPhone}, province = #{province}, city = #{city}, district = #{district}, address = #{address} where id = #{id}")
    void updateOrderHeadById(Order order);

    @Update("update order_details set name = #{name}, model = #{model}, brand = #{brand}, spec = #{spec}, sn = #{sn}, assignee = #{assignee}, original_model = #{originalModel}, refit_model = #{refitModel}, process_item = #{processItem} where id = #{id}")
    void updateOrderDetailById(OrderDetail orderDetail);

    // 非管理员更新订单详情：不含 assignee 列，确保派发（assignee）只有管理员能改。
    // 其余字段（name/model/brand/spec/sn/original_model/refit_model/process_item）照常允许更新。
    @Update("update order_details set name = #{name}, model = #{model}, brand = #{brand}, spec = #{spec}, sn = #{sn}, original_model = #{originalModel}, refit_model = #{refitModel}, process_item = #{processItem} where id = #{id}")
    void updateOrderDetailByIdWithoutAssignee(OrderDetail orderDetail);

    // department 可选：传入时仅返回该部门的员工（如维修派单只给维修部门），不传则返回全公司（负责人下拉）
    @Select("<script>select account,name from sys_user where company = #{company}" +
            "<if test='department != null and department != \"\"'> and department = #{department}</if>" +
            "</script>")
    List<Manager> getManagerByCompany(@Param("company") String company, @Param("department") String department);

    @Select("select name,contact,phone from sys_customer where company = #{company}")
    List<Customer> getCustomerByCompany(String company);

    @Select("select status from order_head where id = #{id}")
    String getOrderStatusById(String id);

    @Delete("delete from order_head where id = #{id}")
    void deleteOrderHeadById(String id);

    @Delete("delete from order_details where `order` = #{id}")
    void deleteOrderDetailByOrderId(String id);

    // 整单删除时级联清理维修工单：sys_repair.details 无外键约束，不手动删会留下孤儿工单
    @Delete("delete from sys_repair where `order` = #{id}")
    void deleteRepairByOrderId(String id);

    @Update("update order_head set status = '已提交' where id = #{id}")
    void submitOrder(String id);

}
