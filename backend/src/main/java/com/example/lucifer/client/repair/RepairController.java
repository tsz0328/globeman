package com.example.lucifer.client.repair;

import com.example.lucifer.client.repair.model.Accept;
import com.example.lucifer.client.repair.model.DuplicateSn;
import com.example.lucifer.client.repair.model.Img;
import com.example.lucifer.client.repair.model.Order;
import com.example.lucifer.client.repair.model.SN;
import com.example.lucifer.client.repair.model.SameSnTicket;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/client/repair")
public class RepairController {
    @Autowired
    private RepairService repairService;
    //获取维修订单信息（维修入库）：所有角色均按公司过滤，只看本公司
    @GetMapping("/getOrder")//获取订单
    public Return<List<Order>> getOrder() {
        return repairService.getOrderByCompany(Role.getCompany());
    }

    //维修入库添加SN码
    @PostMapping("/addSN")
    public Return<String> addSN(@RequestBody SN data){
        data.setRegister(Role.getAccount());
        data.setTime(LocalDateTime.now());
        return repairService.addSNByOrderDetailId(data);
    }

    //维修入库删除SN码
    @DeleteMapping("/deleteSN")
    public Return<String> deleteSN(@RequestBody SN data){
        return repairService.deleteSNByOrderDetailId(data);
    }

    //维修入库：按订单批量登记维修工单（替代原逐台扫描录入 SN）
    @PostMapping("/inbound")
    public Return<String> inbound(@RequestParam String orderId) {
        return repairService.inboundOrder(orderId);
    }

    //入库前 SN 重复检查：返回当前订单与其他订单已入库工单重复的 SN 明细
    @GetMapping("/checkDuplicateSn")
    public Return<List<DuplicateSn>> checkDuplicateSn(@RequestParam String orderId) {
        return repairService.checkDuplicateSn(orderId);
    }

    // 接单前按 SN 查本公司所有相关工单（供前端弹窗列出同 SN 全部工单选单）
    @GetMapping("/getSameSnTickets")
    public Return<List<SameSnTicket>> getSameSnTickets(@RequestParam String sn) {
        return repairService.getSameSnTickets(sn);
    }

    // 维修接单：按工单 id 精确接单（前端弹窗选单后调用）
    @PostMapping("/acceptTicket")
    public Return<String> acceptTicket(@RequestParam int id) {
        return repairService.acceptTicket(id);
    }

    //获取接单信息
    @GetMapping("/getAllAcceptInfo")
    public Return<List<Accept>> getAllAcceptInfo(){
        return repairService.getAllAcceptInfo();
    }

    //维修列表（管理员）：全部维修工单
    @GetMapping("/getAllRepairTickets")
    public Return<List<Accept>> getAllRepairTickets(){
        return repairService.getAllRepairTickets();
    }

    //维修出库：status='已完成' 的工单（管理员看全部，普通用户看自己接的单）
    @GetMapping("/getFinishedRepairs")
    public Return<List<Accept>> getFinishedRepairs(){
        return repairService.getFinishedRepairs();
    }

    //获取维修订单信息
    @GetMapping("/getAcceptImg")
    public Return<List<Img>> getAcceptImg(@RequestParam Integer id){
        return repairService.getAcceptImg(id);
    }

    //上传维修前照片
    @PostMapping("/uploadBefore")
    public Return<String> uploadBefore(@RequestParam MultipartFile file, @RequestParam String id){
        return repairService.uploadImg(file,id,"维修前");
    }

    //上传维修后照片
    @PostMapping("/uploadAfter")
    public Return<String> uploadAfter(@RequestParam MultipartFile file, @RequestParam String id){
        return repairService.uploadImg(file,id,"维修后");
    }

    @DeleteMapping("/deleteImg")
    public Return<String> deleteImg(@RequestParam String id){
        return repairService.deleteImg(id);
    }

    //更新接单信息
    @PostMapping("/updateAccept")
    public Return<String> updateAccept(@RequestBody Accept data){
        return repairService.updateAccept(data.getId(),data.getDescription(),data.getDiagnosis(),data.getDispose(),data.getResult());
    }

    //完成按钮（原子提交：保存故障/维修记录字段 + 置状态为「已完成」）
    @PostMapping("/finishAccept")
    public Return<String> finishAccept(@RequestBody Accept data){
        return repairService.finishAccept(data.getId(),data.getDescription(),data.getDiagnosis(),data.getDispose(),data.getResult());
    }


}
