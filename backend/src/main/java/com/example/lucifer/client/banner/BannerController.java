package com.example.lucifer.client.banner;

import com.example.lucifer.client.banner.model.Banner;
import com.example.lucifer.util.Return;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/client/banner")
public class BannerController {
    @Autowired
    private BannerService bannerService;

    //添加轮播图
    @PostMapping("/addBanner")
    public Return<String> addBanner(@RequestParam("img") MultipartFile img, @RequestParam Integer sort, @RequestParam String title) {
        return bannerService.addBanner(img, sort, title);
    }

    //获取轮播图
    @GetMapping("/getBanner")
    public Return<List<Banner>> getBanner() {
        return bannerService.getBanner();
    }

    //删除轮播图
    @DeleteMapping("/deleteBanner")
    public Return<String> deleteBanner(@RequestParam String url) {
        return bannerService.deleteBanner(url);
    }
    //启用停用按钮
    @PostMapping("/updateStatus")
    public Return<String> updateStatus(@RequestParam String url) {
        return bannerService.updateStatus(url);
    }

}
