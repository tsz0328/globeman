package com.example.lucifer.client.customer;

import com.example.lucifer.client.customer.model.Customer;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface CustomerMapper {

    @Select("select * from sys_customer where company = #{company}")
    List<Customer> getInfoCustomerByCompany(String company);


    @Insert("insert into sys_customer(name, company, contact ,phone, time) values(#{name}, #{company},#{contact}, #{phone},#{time})")
    void createCustomer(Customer customer);

    @Update("update sys_customer set name=#{name}, company=#{company}, contact=#{contact}, phone=#{phone} where id=#{id}")
    void updateCustomer(Customer customer);

    @Delete("delete from sys_customer where id = #{id}")
    void deleteCustomer(String id);
}
