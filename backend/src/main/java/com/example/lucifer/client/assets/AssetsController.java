package com.example.lucifer.client.assets;

import com.example.lucifer.client.assets.model.Assets;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.apache.ibatis.annotations.Delete;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/client/assets")
public class AssetsController {
    @Autowired
    private AssetsService assetsService;

    @PostMapping("/addAssets")
    public Return<String> addAssets(@RequestBody Assets assets){
        assets.setTime(LocalDateTime.now());
        assets.setCompany(Role.getCompany());
        assets.setRegister(Role.getAccount());
        return assetsService.addAssets(assets);
    }

    @GetMapping("/getAssets")
    public Return<Map<String,Object>> getAssets(){
        return assetsService.getAssets(Role.getCompany());
    }

    @DeleteMapping("/deleteAssets")
    public Return<String> deleteAssets(@RequestParam String id){
        return assetsService.deleteAssets(id);
    }

    @PostMapping("/updateAssets")
    public Return<String> updateAssets(@RequestBody Map<String,Object> map){
        return assetsService.updateAssets(map);
    }

    @PostMapping("/scrapAssets")
    public Return<String> scrapAssets(@RequestBody Map<String,Object> map){
        return assetsService.scrapAssets(map);
    }

    @PostMapping("/enableAssets")
    public Return<String> enableAssets(@RequestParam Integer id){
        return assetsService.enableAssets(id);
    }
}
