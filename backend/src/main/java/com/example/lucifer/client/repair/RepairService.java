package com.example.lucifer.client.repair;

import com.example.lucifer.client.repair.model.*;
import com.example.lucifer.util.FileUtil;
import com.example.lucifer.util.Return;
import com.example.lucifer.util.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RepairService {

    private static final Logger log = LoggerFactory.getLogger(RepairService.class);

    private final RepairMapper repairMapper;

    public RepairService(RepairMapper repairMapper) {
        this.repairMapper = repairMapper;
    }

    public Return<List<Order>> getOrderByCompany(String company) {
        try{
            // 获取订单头信息
            List<Order> orders = repairMapper.getOrderHeadByCompany(company);
            // 获取订单详情信息
            for (Order order : orders) {
                // 获取订单详情信息
                List<OrderDetail> orderDetails = repairMapper.getOrderDetailByOrderHeadId(order.getId());
                //获取订单详情SN码
                for (OrderDetail orderDetail : orderDetails){
                    List<String> sn = repairMapper.getSNByOrderDetailId(orderDetail.getId());
                    orderDetail.setSN(sn);
                }
                order.setDetails(orderDetails);
                // 标记是否已入库：该订单在 sys_repair 中存在维修工单即为已入库
                order.setInbound(repairMapper.countRepairByOrder(order.getId()) > 0);
            }
            return Return.success("获取订单信息成功", orders);
        } catch (Exception e) {
            log.error(e.getMessage());
            return Return.error("获取订单信息失败");
        }
    }

    public Return<String> addSNByOrderDetailId(SN data) {
        try{
            repairMapper.addSNByOrderDetailId(data);
            //更新订单详情信息
            repairMapper.updateOrderDetailQuantity(data.getId(), 1);
            return Return.success("添加SN码成功");
        } catch (Exception e) {
            log.error(e.getMessage());
            return Return.error("添加SN码失败");
        }
    }

    public Return<String> deleteSNByOrderDetailId(SN data) {
        try{
            repairMapper.deleteSNByOrderDetailId(data);
            //更新订单详情信息
            repairMapper.updateOrderDetailQuantity(data.getId(), -1);
            return Return.success("删除SN码成功");
        } catch (Exception e) {
            log.error(e.getMessage());
            return Return.error("删除SN码失败");
        }
    }

    // 接单：按工单 id 精确接单（前端「同 SN 选单」弹窗里点某条的接单按钮时调用）。
    // acceptById 自带 account 校验，仅「待接单 + 派本人/未派发」可接，天然防抢单/越权。
    public Return<String> acceptTicket(int id) {
        try {
            String account = Role.getAccount();
            int rows = repairMapper.acceptById(id, account, LocalDateTime.now());
            if (rows > 0) {
                return Return.success("接单成功");
            }
            // 更新落空：查现状给具体提示（带人名）
            String status = repairMapper.getStatusById(id);
            if (status != null && !"待接单".equals(status)) {
                // 已被接走（维修中/已完成）：区分本人接的 vs 别人接的
                String taker = repairMapper.getAccountById(id);
                if (taker != null && taker.equals(account)) {
                    return Return.error("你已接过该工单");
                }
                return Return.error("该工单已被" + displayName(taker) + "接走");
            }
            // 待接单但派给别人（前端本应禁用按钮，此处兜底防绕过）
            String assignee = repairMapper.getAccountById(id);
            return Return.error("该设备已派发给" + displayName(assignee) + "，无法接单");
        } catch (Exception e) {
            log.error("接单异常{}", e.getMessage());
            return Return.error("接单失败，请稍后重试");
        }
    }

    // 接单前按 SN 查本公司所有相关工单（含待接单/维修中/已完成），供前端弹窗列出同 SN 全部工单选单。
    // 每条补 assigneeName（派发人姓名）、accountName（当前负责人姓名，接单后即接单人）。
    public Return<List<SameSnTicket>> getSameSnTickets(String sn) {
        try {
            List<SameSnTicket> tickets = repairMapper.getSameSnTickets(sn, Role.getCompany());
            for (SameSnTicket t : tickets) {
                t.setAssigneeName(blankName(t.getAssignee()));
                t.setAccountName(blankName(t.getAccount()));
            }
            return Return.success("查询同SN工单成功", tickets);
        } catch (Exception e) {
            log.error("查询同SN工单失败{}", e.getMessage());
            return Return.error("查询同SN工单失败");
        }
    }

    // 账号 → 姓名：查得到姓名用姓名，查不到退回账号本身；空账号用「其他员工」兜底
    private String displayName(String account) {
        if (account == null || account.isEmpty()) {
            return "其他员工";
        }
        String name = repairMapper.getUserNameByAccount(account);
        return (name != null && !name.isEmpty()) ? name : account;
    }

    // 账号 → 姓名，但空账号返回空串（前端据此显示「未派发」，而非「其他员工」）
    private String blankName(String account) {
        if (account == null || account.isEmpty()) {
            return "";
        }
        return displayName(account);
    }

    public Return<List<Accept>> getAllAcceptInfo() {
        try {
            return Return.success("获取接单信息成功", repairMapper.getAllAcceptInfo(Role.getAccount(), Role.getCompany()));
        } catch (Exception e) {
            log.error("获取接单信息失败{}",e.getMessage());
            return Return.error("获取接单信息失败");
        }
    }

    // 维修接单（管理员）：返回本公司全部维修工单（含待接单/维修中/已完成），不按账号过滤但按公司过滤
    public Return<List<Accept>> getAllRepairTickets() {
        try {
            return Return.success("获取维修列表成功", repairMapper.getAllRepairTickets(Role.getCompany()));
        } catch (Exception e) {
            log.error("获取维修列表失败{}", e.getMessage());
            return Return.error("获取维修列表失败");
        }
    }

    // 维修出库：返回 status='已完成' 的已修完工单。
    // 普通用户看本公司、自己接的单（account = 当前账号 且 company = 当前公司）；
    // 管理员 account 传 null、company = 当前公司，看本公司全部已修完的工单。
    public Return<List<Accept>> getFinishedRepairs() {
        try {
            boolean isAdmin = "admin".equals(Role.getRole());
            String account = isAdmin ? null : Role.getAccount();
            String company = Role.getCompany();
            return Return.success("获取维修出库成功", repairMapper.getFinishedRepairs(account, company));
        } catch (Exception e) {
            log.error("获取维修出库失败{}", e.getMessage());
            return Return.error("获取维修出库失败");
        }
    }

    // 维修入库：按订单批量登记维修工单到 sys_repair（每台设备一条，status='待接单'），
    // 恢复维修接单/诊断/完成链路。导入的 SN 取自 order_details.sn，不做逐台扫描录入。
    public Return<String> inboundOrder(String orderId) {
        try {
            int existing = repairMapper.countRepairByOrder(orderId);
            if (existing > 0) {
                return Return.success("该订单已入库");
            }
            List<OrderDetail> details = repairMapper.getOrderDetailByOrderHeadId(orderId);
            if (details == null || details.isEmpty()) {
                return Return.error("该订单无设备明细，无法入库");
            }
            LocalDateTime now = LocalDateTime.now();
            String register = Role.getAccount();
            for (OrderDetail d : details) {
                String sn = (d.getSn() == null) ? "" : d.getSn().trim();
                // 派发：入库时把 order_details.assignee（员工账号）抄进 sys_repair.account，未派发则为 null
                repairMapper.insertRepairTicket(sn, d.getId(), orderId, register, now, d.getAssignee());
            }
            return Return.success("入库成功，已生成 " + details.size() + " 条维修工单");
        } catch (Exception e) {
            log.error("入库失败{}", e.getMessage());
            return Return.error("入库失败");
        }
    }

    // 入库前 SN 重复检查：同时返回「同订单内重复」和「跨订单重复」两类，一次弹窗统一提示。
    // 同订单内重复（录入问题）排前面、跨订单重复排后面；无重复时返回空列表。
    public Return<List<DuplicateSn>> checkDuplicateSn(String orderId) {
        try {
            List<DuplicateSn> sameOrder = repairMapper.getSameOrderDuplicateSn(orderId);
            for (DuplicateSn d : sameOrder) {
                d.setKind("same_order");
            }
            List<DuplicateSn> crossOrder = repairMapper.getDuplicateSn(orderId, Role.getCompany());
            // kind 已由 SQL 常量带出（cross_self=本订单侧 / cross_order=其他订单侧），无需再覆盖
            sameOrder.addAll(crossOrder);
            return Return.success("查询重复SN成功", sameOrder);
        } catch (Exception e) {
            log.error("查询重复SN失败{}", e.getMessage());
            return Return.error("查询重复SN失败");
        }
    }

    public Return<List<Img>> getAcceptImg(@RequestParam Integer id){
        try{
            return Return.success("获取接单图片成功", repairMapper.getAcceptImg(id));
        } catch (Exception e) {
            log.error("获取接单图片失败{}",e.getMessage());
            return Return.error("获取接单图片失败");
        }
    }

    public Return<String> uploadImg(MultipartFile file, String id, String message) {
        try{
            String fileName = FileUtil.getPictureUrl(FileUtil.saveImage(file));
            repairMapper.uploadImg(fileName, id, message, LocalDateTime.now());
            return Return.success("上传图片成功");
        } catch (Exception e) {
            log.error("上传图片失败{}",e.getMessage());
            return Return.error("上传图片失败");
        }
    }

    public Return<String> deleteImg(String id) {
        try{
            repairMapper.deleteImg(id);
            return Return.success("删除图片成功");
        } catch (Exception e) {
            log.error("删除图片失败{}",e.getMessage());
            return Return.error("删除图片失败");
        }
    }

    public Return<String> updateAccept(int id, String description, String diagnosis, String dispose, String result) {
        try {
            repairMapper.updateAccept(id, description, diagnosis, dispose, result);
            return Return.success("更新接单信息成功");
        } catch (Exception e) {
            log.error("更新接单信息失败{}",e.getMessage());
            return Return.error("更新接单信息失败");
        }
    }

    // 提交工单（完工）：原子操作，一条 SQL 同时保存故障描述/解决方式/处置/结果 并将状态置为「已完成」，
    // 避免「先存字段再改状态」两次调用之间失败导致状态不一致或内容丢失。
    public Return<String> finishAccept(int id, String description, String diagnosis, String dispose, String result) {
        try{
            repairMapper.finishAccept(id, description, diagnosis, dispose, result, LocalDateTime.now());
            return Return.success("结束接单成功");
        } catch (Exception e) {
            log.error("结束接单失败{}",e.getMessage());
            return Return.error("结束接单失败");
        }
    }
}
