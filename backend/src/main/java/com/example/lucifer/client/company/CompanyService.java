package com.example.lucifer.client.company;

import com.example.lucifer.login.model.Register;
import com.example.lucifer.util.FileUtil;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class CompanyService {
    private static final Logger log = LoggerFactory.getLogger(CompanyService.class);
    private final CompanyMapper companyMapper;

    public CompanyService(CompanyMapper companyMapper) {
        this.companyMapper = companyMapper;
    }

    public Return<Map<String,Map<String,Object>>> getCompany() {
        try{
            if(Role.getRole().equals("admin")){
                return Return.success(companyMapper.getCompany());
            }else {
                return Return.success(companyMapper.getCompanyByUser(Role.getCompany()));
            }
        }catch (Exception e){
            log.error("获取公司列表失败{}",e.getMessage());
            return Return.error("获取公司列表失败");
        }
    }

    public Return<String> updateUsciByCompany(MultipartFile file, String company) {
        try{
            //保存照片返回文件名
            String fileName = FileUtil.saveImage(file);
            //拼接文件名
            String imgUrl = FileUtil.getPictureUrl(fileName);
            //保存到数据库中
            companyMapper.updateUsciByCompany(company,imgUrl);
            return Return.success("营业执照上传成功",imgUrl);
        } catch (Exception e) {
            log.error("上传营业执照失败{}",e.getMessage());
            return Return.error("上传营业执照失败");
        }
    }

    public Return<String> getUsciByCompany(String company) {
        try{
            return Return.success("获取营业执照成功",companyMapper.getUsciByCompany(company));
        } catch (Exception e) {
            log.error("获取营业执照失败{}",e.getMessage());
            return Return.error("获取营业执照失败");
        }
    }

    //创建公司
    public void createCompany(Register register) {
        try{
            companyMapper.createCompany(register.getCompany(),register.getAccount(),LocalDateTime.now());
        } catch (Exception e) {
            log.error("创建公司失败{}",e.getMessage());
            throw new RuntimeException("创建公司失败",e);
        }
    }

    public boolean existsByCompany(String company) {
        try {
            return companyMapper.existsByCompany(company);
        } catch (Exception e) {
            log.error("查询公司是否存在异常{}",e.getMessage());
            return false;
        }
    }

    public Return<String> deleteUsci(String url) {
        try {
            FileUtil.deleteFile(url);
            companyMapper.updateUsci(url);
            return Return.success("删除成功");
        } catch (Exception e) {
            log.error("删除失败{}",e.getMessage());
            return Return.error("删除失败");
        }
    }

    public Return<String> deleteCompany(List<Integer> list) {
        try {
            for (Integer id : list){
                companyMapper.deleteCompany(id);
            }
            return Return.success("删除成功");
        }catch (Exception e){
            log.error("删除公司失败{}",e.getMessage());
            return Return.error("删除公司失败");
        }
    }
}
