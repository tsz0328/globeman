package com.example.lucifer.client.person;

import com.example.lucifer.client.person.model.Person;
import com.example.lucifer.client.user.model.UserInfo;
import com.example.lucifer.util.FileUtil;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PersonService {

    private static final Logger log = LoggerFactory.getLogger(PersonService.class);
    private final PersonMapper personMapper;

    public PersonService(PersonMapper personMapper) {
        this.personMapper = personMapper;
    }

    public Return<String> uploadEmail(String email) {
        try {
            return Return.success("邮箱上传成功",personMapper.uploadEmail(Role.getAccount(),email));
        }catch (Exception e){
            log.error("邮箱上传失败{}",e.getMessage());
            return Return.error("邮箱上传失败");
        }
    }

    public Return<Person> getUserByAccount(String account) {
        try{
            return Return.success("获取成功",personMapper.getUserByAccount(account));
        }catch (Exception e){
            log.error("账号信息获取{}",e.getMessage());
            return Return.error("账号信息获取");
        }
    }

    public Return<String> updateAvatar(MultipartFile file) {
        try{
            String fileName = FileUtil.saveImage(file);
            String imgUrl = FileUtil.getPictureUrl(fileName);
            personMapper.updateAvatar(Role.getAccount(),imgUrl);
            return Return.success("头像上传成功");
        } catch (Exception e) {
            log.error("头像上传失败{}",e.getMessage());
            return Return.error("头像上传失败");
        }
    }

    public Return<String> updatePassword(String password) {
        try{
            personMapper.updatePassword(Role.getAccount(), BCrypt.hashpw(password, BCrypt.gensalt(12)));
            return Return.success("密码修改成功");
        } catch (Exception e) {
            log.error("密码修改失败{}",e.getMessage());
            return Return.error("密码修改失败");
        }
    }
}
