package com.example.lucifer.client.banner;

import com.example.lucifer.client.banner.model.Banner;
import com.example.lucifer.util.FileUtil;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BannerService {

    private static final Logger log = LoggerFactory.getLogger(BannerService.class);
    @Autowired
    private BannerMapper bannerMapper;

    public Return<String> addBanner(MultipartFile img, Integer sort, String title) {
        try{
            String filename = FileUtil.getPictureUrl(FileUtil.saveImage(img));
            bannerMapper.addBanner(filename, sort, title, Role.getAccount(), LocalDateTime.now());
            return Return.success("添加成功");
        } catch (IOException e) {
            log.error("添加失败{}", e.getMessage());
            return Return.error("添加失败");
        }
    }

    public Return<List<Banner>> getBanner() {
        try{
            return Return.success("获取成功", bannerMapper.getBanner());
        } catch (Exception e) {
            log.error("获取失败{}", e.getMessage());
            return Return.error("获取失败");
        }
    }

    public Return<String> deleteBanner(String url) {
        try{
            bannerMapper.deleteBanner(url);
            return Return.success("删除成功");
        } catch (Exception e) {
            log.error("删除失败{}", e.getMessage());
            return Return.error("删除失败");
        }
    }

    public Return<String> updateStatus(String url) {
        try{
            bannerMapper.updateStatus(url);
            return Return.success("更新成功");
        } catch (Exception e) {
            log.error("更新失败{}", e.getMessage());
            return Return.error("更新失败");
        }
    }
}
