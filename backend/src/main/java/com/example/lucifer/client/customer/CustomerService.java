package com.example.lucifer.client.customer;

import com.example.lucifer.client.customer.model.Customer;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerService {
    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);

    private final CustomerMapper customerMapper;

    public CustomerService(CustomerMapper customerMapper) {
        this.customerMapper = customerMapper;
    }

    public Return<List<Customer>> getInfoCustomer() {
        try{
            return Return.success("获取客户信息成功", customerMapper.getInfoCustomerByCompany(Role.getCompany()));
        } catch (Exception e) {
            log.error("获取客户信息失败{}",e.getMessage());
            return Return.error("获取客户信息失败");
        }
    }

    public Return<String> createCustomer(Customer customer) {
        try{
            customer.setTime(LocalDateTime.now());
            customerMapper.createCustomer(customer);
            return Return.success("创建客户信息成功");
        } catch (Exception e) {
            log.error("创建客户信息失败{}",e.getMessage());
            return Return.error("创建客户信息失败");
        }
    }

    public Return<String> updateCustomer(Customer customer) {
        try{
            customerMapper.updateCustomer(customer);
            return Return.success("更新客户信息成功");
        } catch (Exception e) {
            log.error("更新客户信息失败{}", e.getMessage());
            return Return.error("更新客户信息失败");
        }
    }

    public Return<String> deleteCustomer(String id) {
        try{
            customerMapper.deleteCustomer(id);
            return Return.success("删除客户信息成功");
        }catch (Exception e) {
            log.error("删除客户信息失败{}", e.getMessage());
            return Return.error("删除客户信息失败");
        }
    }
}
