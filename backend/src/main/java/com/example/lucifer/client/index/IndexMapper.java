package com.example.lucifer.client.index;

import com.example.lucifer.client.index.model.Banner;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface IndexMapper {

    @Select("select * from banner")
    List<Banner> getBanner();
}
