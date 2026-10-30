package com.example.lucifer.client.project;

import com.example.lucifer.client.order.model.Order;
import com.example.lucifer.client.order.model.OrderDetail;
import com.example.lucifer.client.project.model.Project;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectService {
    @Autowired
    private ProjectMapper projectMapper;
    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    public Return<List<Project>> getProject() {
        try{
            return Return.success("获取项目列表成功",projectMapper.getProject(Role.getCompany()));
        } catch (Exception e) {
            log.error("获取项目列表失败{}", e.getMessage());
            return Return.error("获取项目列表失败");
        }
    }

    public Return<String> addProject(Project project) {
        try{
            project.setTime(LocalDateTime.now());
            project.setCompany(Role.getCompany());
            project.setAccount(Role.getAccount());
            projectMapper.addProject(project);
            return Return.success("添加项目成功");
        } catch (Exception e) {
            log.error("添加项目失败{}", e.getMessage());
            return Return.error("添加项目失败");
        }
    }

    public Return<String> orderProject(String projectId, String orderId) {
        try{
            projectMapper.orderProject(projectId, orderId);
            return Return.success("订单关联项目成功");
        } catch (Exception e) {
            log.error("订单关联项目失败{}", e.getMessage());
            return Return.error("订单关联项目失败");
        }
    }

    public Return<String> deleteProject(String id) {
        try{
            projectMapper.deleteProject(id);
            return Return.success("删除项目成功");
        } catch (Exception e) {
            log.error("删除项目失败{}", e.getMessage());
            return Return.error("删除项目失败");
        }
    }

    public Return<List<Order>> getProjectOrderByProjectId(String projectId, String company) {
        try{
            // 获取订单头信息
            List<Order> orders = projectMapper.getOrderHeadByCompany(company, projectId);
            // 获取订单详情信息
            for (Order order : orders) {
                // 获取订单详情信息
                List<OrderDetail> orderDetails = projectMapper.getOrderDetailByOrderHeadId(order.getId());
                order.setDetails(orderDetails);
            }
            return Return.success("获取订单信息成功", orders);
        } catch (Exception e) {
            log.error(e.getMessage());
            return Return.error("获取订单信息失败");
        }
    }
}
