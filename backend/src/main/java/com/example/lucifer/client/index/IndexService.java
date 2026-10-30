package com.example.lucifer.client.index;

import com.example.lucifer.client.index.model.Banner;
import com.example.lucifer.util.Return;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IndexService {
    private static final Logger log = LoggerFactory.getLogger(IndexService.class);
    @Autowired
    private IndexMapper indexMapper;

    public Return<List<Banner>> getBanner() {
        try {
            return Return.success("获取banner成功", indexMapper.getBanner());
        } catch (Exception e) {
            log.error("获取banner失败", e);
            return Return.error("获取banner失败");
        }
    }
}
