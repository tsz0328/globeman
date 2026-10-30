package com.example.lucifer.client.banner;

import com.example.lucifer.client.banner.model.Banner;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface BannerMapper {

    @Insert("insert into banner (url, sort, title, account, time) values (#{filename}, #{sort}, #{title},#{account}, #{now})")
    void addBanner(String filename, Integer sort, String title, String account, LocalDateTime now);

    @Select("select * from banner order by sort")
    List<Banner> getBanner();

    @Delete("delete from banner where url = #{url}")
    void deleteBanner(String url);

    @Update("update banner set status = 1 - status where url = #{url}")
    void updateStatus(String url);

}
