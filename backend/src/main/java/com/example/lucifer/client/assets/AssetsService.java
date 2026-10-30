package com.example.lucifer.client.assets;

import com.example.lucifer.client.assets.model.Assets;
import com.example.lucifer.util.Return;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AssetsService {

    @Autowired
    private AssetsMapper assetsMapper;

    private static final Logger log = LoggerFactory.getLogger(AssetsService.class);

    public Return<String> addAssets(Assets assets) {
        try{
            assetsMapper.addAssets(assets);
            return Return.success("固定资产添加成功");
        } catch (Exception e) {
            log.error("固定资产添加失败{}",e.getMessage());
            return Return.error("固定资产添加失败");
        }
    }

    public Return<Map<String,Object>> getAssets(String company) {
        try{
            List<Assets> assets = assetsMapper.getAssets(company);
            BigDecimal total = BigDecimal.ZERO;
            int number = 0;
            for (Assets asset : assets) {
                total = total.add(asset.getPrice());
                number++;
            }
            Map<String,Object> map = new HashMap<>();
            map.put("assets",assets);
            map.put("total",total);
            map.put("number",number);
            return Return.success("获取成功", map);
        } catch (Exception e) {
            log.error("获取失败{}",e.getMessage());
            return Return.error("获取失败");
        }
    }

    public Return<String> deleteAssets(String id) {
        try{
            assetsMapper.deleteAssets(id);
            return Return.success("删除成功");
        } catch (Exception e) {
            log.error("删除失败");
            return Return.error("删除失败");
        }
    }

    public Return<String> updateAssets(Map<String,Object> map) {
        try{
            assetsMapper.updateAssets(Integer.parseInt(map.get("id").toString()),map.get("account").toString(),map.get("location").toString());
            return Return.success("修改成功");
        } catch (Exception e) {
            log.error("修改失败");
            return Return.error("修改失败");
        }
    }

    public Return<String> scrapAssets(Map<String, Object> map) {
        try{

            assetsMapper.scrapAssets(Integer.parseInt(map.get("id").toString()),map.get("reason").toString(), LocalDateTime.now());
            return Return.success("报废成功");
        } catch (Exception e) {
            log.error("报废失败");
            return Return.error("报废失败");
        }
    }

    public Return<String> enableAssets(Integer id) {
        try{
            assetsMapper.enableAssets(id);
            return Return.success("启用成功");
        } catch (Exception e) {
            log.error("启用失败");
            return Return.error("启用失败");
        }
    }
}
