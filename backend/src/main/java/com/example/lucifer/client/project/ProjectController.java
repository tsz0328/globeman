package com.example.lucifer.client.project;

import com.example.lucifer.client.order.model.Order;
import com.example.lucifer.client.project.model.Project;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/client/project")
public class ProjectController {
    @Autowired
    private ProjectService projectService;


    @GetMapping("/getProject")
    public Return<List<Project>> getProject() {
        return projectService.getProject();
    }

    @PostMapping("/addProject")
    public Return<String> addProject(@RequestBody Project project) {
        return projectService.addProject(project);
    }


    @PostMapping("/orderProject")//订单关联项目
    public Return<String> orderProject(@RequestParam String projectId ,@RequestParam String orderId) {
        return projectService.orderProject(projectId, orderId);
    }

    @GetMapping("/getProjectOrder")//获取项目订单
    public Return<List<Order>> getProjectOrder(@RequestParam String projectId) {
        return projectService.getProjectOrderByProjectId(projectId, Role.getCompany());
    }

    @DeleteMapping("/delete")//删除项目
    public Return<String> delete(@RequestParam String id) {
        return projectService.deleteProject(id);
    }
}
