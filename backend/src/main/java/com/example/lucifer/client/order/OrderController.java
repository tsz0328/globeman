package com.example.lucifer.client.order;

import com.example.lucifer.client.order.model.Customer;
import com.example.lucifer.client.order.model.Manager;
import com.example.lucifer.client.order.model.Order;
import com.example.lucifer.client.order.model.OrderDetail;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.apache.ibatis.annotations.Delete;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/client/order")
public class OrderController {
    private static final Logger log = LoggerFactory.getLogger(OrderController.class);
    @Autowired
    private OrderService orderService;

    @GetMapping("/getOrder")//获取订单
    public Return<List<Order>> getOrder() {
        return orderService.getOrderByCompany(Role.getCompany());
    }

    @PostMapping("/addOrder")//添加订单
    public Return<String> addOrder(@RequestBody Order order) {
        //添加订单控制
        try{
            orderService.addOrderController(order);
            return Return.success("添加订单成功");
        }catch (Exception e){
            log.error("添加订单失败{}",e.getMessage());
            return Return.error("添加订单失败");
        }
    }

    @PostMapping("/addOrderDetail")//新增一行订单详细
    public Return<String> addOrderDetail(@RequestBody OrderDetail orderDetail) {
        return orderService.addOrderDetailByOrderId(orderDetail);
    }

    @DeleteMapping("/deleteOrderDetail")//删除一行订单详情
    public Return<String> deleteOrderDetail(@RequestParam Integer id) {
        return orderService.deleteOrderDetailById(id);
    }

    @PostMapping("/updateOrderDetail")//更新一行订单详情
    public Return<String> updateOrderDetail(@RequestBody OrderDetail orderDetail) {
        return orderService.updateOrderDetailById(orderDetail);
    }

    @PostMapping("/updateOrderHead")//更新订单头
    public Return<String> updateOrderHead(@RequestBody Order order) {
        return orderService.updateOrderHeadById(order);
    }

    @GetMapping("/manager")//获取负责人；department 可选，传入则只返回该部门员工（如维修派单）
    public Return<List<Manager>> getManager(@RequestParam(required = false) String department) {
        return orderService.getManagerByCompany(Role.getCompany(), department);
    }

    @GetMapping("/customer")//获取客户信息
    public Return<List<Customer>> getCustomer() {
        return orderService.getCustomerByCompany(Role.getCompany());
    }

    @DeleteMapping("/deleteOrder")//删除订单
    public Return<String> deleteOrder(@RequestParam String id) {
        return orderService.deleteOrderController(id);
    }

    @PutMapping("/submit")//提交按钮
    public Return<String> submitOrder(@RequestParam String id) {
        return orderService.submitOrder(id);
    }

}
