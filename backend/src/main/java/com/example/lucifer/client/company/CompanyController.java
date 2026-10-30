package com.example.lucifer.client.company;

import com.example.lucifer.login.LoginService;
import com.example.lucifer.login.model.Register;
import com.example.lucifer.util.Return;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/client/company")
public class CompanyController {
    private static final Logger log = LoggerFactory.getLogger(CompanyController.class);
    private final CompanyService companyService;
    private final LoginService loginService;

    public CompanyController(CompanyService companyService, LoginService loginService) {
        this.companyService = companyService;
        this.loginService = loginService;
    }

    @PostMapping("/create")
    public Return<Map<String,Object>> createCompany(@RequestBody Register register){
        //判断接受数据是否为空
        if(register==null){
            return Return.error("数据为空");
        }
        //判断用户是否存在
        boolean exist = loginService.existsByAccount(register.getAccount());
        if(exist){
            return Return.error("用户已存在");
        }else {
            //判断公司是否存在
            boolean companyExist = companyService.existsByCompany(register.getCompany());
            if(companyExist){
                return Return.error("公司已存在");
            }else {
                try {
                    //创建公司
                    companyService.createCompany(register);
                    //创建公司负责人
                    register.setRole("boss");
                    loginService.register(register);
                    return Return.success("公司创建成功");
                } catch (Exception e) {
                    log.error("公司创建失败{}",e.getMessage());
                    return Return.error("公司创建失败");
                }
            }
        }
    }

    @GetMapping("/get")
    public Return<Map<String,Map<String,Object>>> getCompany(){
        return companyService.getCompany();
    }

    @PostMapping("/updateUsci")
    public Return<String> updateUsci(@RequestParam("file") MultipartFile file,@RequestParam String company){
        if(company==null||file==null){
            return Return.error("接收数据为空");
        }
        return companyService.updateUsciByCompany(file,company);
    }

    @GetMapping("/getUsci")
    public Return<String> getUsci(@RequestParam String company){
        return companyService.getUsciByCompany(company);
    }

    @PutMapping("/deleteUsci")
    public Return<String> deleteUsci(@RequestParam String url){
        return companyService.deleteUsci(url);
    }

    @PostMapping("/delete")
    public Return<String> deleteCompany(@RequestBody List<Integer> list){
        if(list==null){
            return Return.error("接收数据为空");
        }
        return companyService.deleteCompany(list);
    }

}
