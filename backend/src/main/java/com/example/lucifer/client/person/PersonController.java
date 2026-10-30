package com.example.lucifer.client.person;

import com.example.lucifer.client.person.model.Person;
import com.example.lucifer.client.user.model.UserInfo;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/client/person")
public class PersonController {

    private final PersonService personService;

    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    //上传/更新邮箱
    @PostMapping("/uploadEmail")
    public Return<String> uploadEmail(@RequestParam String email){
        return personService.uploadEmail(email);
    }

    //获取用户个人信息
    @GetMapping("/getPerson")
    public Return<Person> getUserByAccount(){
        return personService.getUserByAccount(Role.getAccount());
    }

    //上传头像
    @PostMapping("/updateAvatar")
    public Return<String> updateAvatar(@RequestParam MultipartFile file){
        return personService.updateAvatar(file);
    }

    //修改密码
    @PostMapping("/updatePassword")
    public Return<String> updatePassword(@RequestParam String password){
        return personService.updatePassword(password);
    }

}
