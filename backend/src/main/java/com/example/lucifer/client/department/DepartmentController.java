package com.example.lucifer.client.department;

import com.example.lucifer.util.Return;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/client/department")
public class DepartmentController {
    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping("/getInfoDepartment")
    public Return<List<String>> getInfoDepartment(){
        return departmentService.getInfoDepartment();
    }

    @PostMapping("/createDepartment")
    public Return<String> createDepartment(@RequestParam String department){
        return departmentService.createDepartment(department);
    }
}
