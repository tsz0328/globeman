package com.example.lucifer.client.assets;

import com.example.lucifer.client.assets.model.Assets;
import org.apache.ibatis.annotations.*;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface AssetsMapper {

    @Insert("insert into fixed_asset " +
            "(name, model, type, price, sn, account, location, time, company, `register`) " +
            "VALUES " +
            "(#{name}, #{model}, #{type}, #{price}, #{sn}, #{account}, #{location}, #{time}, #{company}, #{register})")
    void addAssets(Assets assets);

    @Select("select * from fixed_asset where company = #{company}")
    List<Assets> getAssets(String company);

    @Delete("delete from fixed_asset where id = #{id}")
    void deleteAssets(String id);

    @Update("update fixed_asset set account = #{account}, location = #{location} where id = #{id}")
    void updateAssets(Integer id, String account, String location);

    @Update("update fixed_asset set status = '报废', reason = #{reason}, scrap_time = #{time} where id = #{id}")
    void scrapAssets(int id, String reason, LocalDateTime time);

    @Update("update fixed_asset set status = '正常', reason = null, scrap_time = null where id = #{id}")
    void enableAssets(int id);
}
