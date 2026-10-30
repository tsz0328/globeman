package com.example.lucifer.client.order;

import com.example.lucifer.client.order.model.Customer;
import com.example.lucifer.client.order.model.Manager;
import com.example.lucifer.client.order.model.OrderDetail;
import com.example.lucifer.client.order.model.Order;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private final OrderMapper orderMapper;

    public OrderService(OrderMapper orderMapper) {
        this.orderMapper = orderMapper;
    }

    public Return<List<Order>> getOrderByCompany(String company) {
        try{
            // 获取订单头信息
            List<Order> orders = orderMapper.getOrderHeadByCompany(company);
            // 获取订单详情信息
            for (Order order : orders) {
                // 获取订单详情信息
                List<OrderDetail> orderDetails = orderMapper.getOrderDetailByOrderHeadId(order.getId());
                order.setDetails(orderDetails);
            }
            return Return.success("获取订单信息成功", orders);
        } catch (Exception e) {
            log.error(e.getMessage());
            return Return.error("获取订单信息失败");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void addOrderController(Order order){
        addOrderHead(order);
        addOrderDetail(order);
    }

    public void addOrderHead(Order order){
        order.setTime(LocalDateTime.now());
        order.setCreator(Role.getAccount());
        order.setCompany(Role.getCompany());
        order.setStatus("编辑中");
        orderMapper.addOrderHead(order);
    }

    public void addOrderDetail(Order order){
        if (order.getDetails() == null || order.getDetails().isEmpty())
            return;
        for (OrderDetail orderDetail : order.getDetails()){
            //归属订单
            orderDetail.setOrder(order.getId());
            orderMapper.addOrderDetail(orderDetail);
        }
    }

    public Return<String> addOrderDetailByOrderId(OrderDetail orderDetail) {
        try{
            orderMapper.addOrderDetail(orderDetail);
            return Return.success("添加订单详细成功");
        }catch (Exception e){
            log.error("添加订单详细失败{}",e.getMessage());
            return Return.error("添加订单详细失败");
        }
    }

    public Return<String> deleteOrderDetailById(Integer id) {
        try{
            orderMapper.deleteOrderDetailById(id);
            orderMapper.deleteOrderDetailByDetailId(id);
            return Return.success("删除订单详细成功");
        } catch (Exception e) {
            log.error("删除订单详细失败{}",e.getMessage());
            return Return.error("删除订单详细失败");
        }
    }

    public Return<String> updateOrderHeadById(Order order) {
        try{
            orderMapper.updateOrderHeadById(order);
            return Return.success("修改订单成功");
        }catch (Exception e){
            log.error("修改订单失败{}",e.getMessage());
            return Return.error("修改订单失败");
        }
    }

    public Return<String> updateOrderDetailById(OrderDetail orderDetail) {
        try{
            // 派发（assignee）仅管理员/董事长可改：其他角色走不含 assignee 列的更新，忽略请求里的 assignee 变更
            String role = Role.getRole();
            boolean canDispatch = "admin".equals(role) || "boss".equals(role);
            if (canDispatch) {
                orderMapper.updateOrderDetailById(orderDetail);
            } else {
                orderMapper.updateOrderDetailByIdWithoutAssignee(orderDetail);
            }
            return Return.success("修改订单详细成功");
        }catch (Exception e){
            log.error("修改订单详细失败{}",e.getMessage());
            return Return.error("修改订单详细失败");
        }
    }

    public Return<List<Manager>> getManagerByCompany(String company, String department) {
        try{
            return Return.success("获取负责人成功", orderMapper.getManagerByCompany(company, department));
        }catch (Exception e){
            log.error("获取负责人失败{}",e.getMessage());
            return Return.error("获取负责人失败");
        }
    }

    public Return<List<Customer>> getCustomerByCompany(String company) {
        try{
            return Return.success("获取客户成功", orderMapper.getCustomerByCompany(company));
        }catch (Exception e){
            log.error("获取客户失败{}",e.getMessage());
            return Return.error("获取客户失败");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public Return<String> deleteOrderController(String id) {
        try {
            String status = orderMapper.getOrderStatusById(id);
            // 已锁定订单（已提交/已确认/已完成）仅管理员可删除，普通账号保持不可删（防绕过前端直接调接口）
            boolean locked = "已提交".equals(status) || "已确认".equals(status) || "已完成".equals(status);
            if (locked && !"admin".equalsIgnoreCase(Role.getRole())) {
                return Return.error("该订单已提交，仅管理员可删除");
            }
            // 先删子表（工单 → 设备明细），再删订单头，避免留下孤儿工单
            orderMapper.deleteRepairByOrderId(id);
            orderMapper.deleteOrderDetailByOrderId(id);
            orderMapper.deleteOrderHeadById(id);
            return Return.success("删除订单成功");
        } catch (Exception e) {
            log.error("删除订单失败{}", e.getMessage());
            return Return.error("删除订单失败");
        }
    }

    public Return<String> submitOrder(String id) {
        try{
            orderMapper.submitOrder(id);
            return Return.success("提交订单成功");
        }catch (Exception e){
            log.error("提交订单失败{}",e.getMessage());
            return Return.error("提交订单失败");
        }
    }
}
