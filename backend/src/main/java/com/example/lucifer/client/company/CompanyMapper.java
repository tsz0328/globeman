package com.example.lucifer.client.company;

import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.Map;

@Mapper
public interface CompanyMapper {

    @MapKey("id")
    @Select("select sys_company.id,sys_company.name,sys_user.name as account,sys_company.time " +
            "from sys_company " +
            "left join sys_user on sys_company.account = sys_user.account")
    Map<String,Map<String,Object>> getCompany();

    @MapKey("id")
    @Select("select id,name,time from sys_company where name = #{company}")
    Map<String, Map<String, Object>> getCompanyByUser(String company);

    @Update("update sys_company set url = #{imgUrl} where name = #{company}")
    void updateUsciByCompany(String company, String imgUrl);

    @Select("select url from sys_company where name = #{company}")
    String getUsciByCompany(String company);

    @Insert("insert into sys_company set name = #{company} ,account = #{account},time = #{time}")
    void createCompany(String company,String account,LocalDateTime time);

    @Select("select count(1) from sys_company where name = #{company}")
    boolean existsByCompany(String company);

    @Update("update sys_company set url = '' where url = #{url}")
    void updateUsci(String url);

    @Delete("delete from sys_company where id = #{id}")
    void deleteCompany(Integer id);
}
