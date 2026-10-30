package com.example.lucifer.client.repair;

import com.example.lucifer.client.repair.model.*;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface RepairMapper {
    @Select("select * from order_head where company = #{company} and status = '已提交' and type = '维修'")
    List<Order> getOrderHeadByCompany(String company);

    @Select("select * from order_details where `order` = #{id}")
    List<OrderDetail> getOrderDetailByOrderHeadId(String id);

    @Insert("insert into sys_repair " +
            "(sn,details,`order`,register,status,time) " +
            "values " +
            "(#{sn},#{id},(select `order` from order_details where id = #{id}),#{register},'待接单',#{time})")
    void addSNByOrderDetailId(SN data);

    @Select("select sn from sys_repair where details = #{id}")
    List<String> getSNByOrderDetailId(long id);

    @Update("update order_details set quantity = quantity + #{i} where id = #{id}")
    void updateOrderDetailQuantity(String id,int i);

    @Delete("delete from sys_repair where details = #{id} and sn = #{sn}")
    void deleteSNByOrderDetailId(SN data);

    // 按工单 id 精确接单：只更新这一条，且仅「待接单 + 派给本人或未派发」的工单可被接走。
    // 加 account 校验，防前端/绕过直接传别人工单 id 抢单（前端弹窗选单后按 id 接，这里兜底）。
    @Update("update sys_repair set account = #{account}, status = '维修中', take_time = #{now} " +
            "where id = #{id} and status = '待接单' and (account = #{account} or account is null or account = '')")
    int acceptById(int id, String account, LocalDateTime now);

    // 接单前按 SN 查本公司所有相关工单（不限状态），供前端弹窗列出「同 SN 全部工单」由员工选单。
    // assignee=派发人（order_details.assignee，入库后不变）；account=当前负责人（待接单时=派发人，接单后=接单人）。
    @Select("select sr.id as id, sr.sn as sn, sr.status as status, sr.account as account, " +
            "oh.id as order_id, oh.name as order_name, od.assignee as assignee, " +
            "(select count(1) from order_details odx where odx.`order` = od.`order` and odx.id <= od.id) as seq " +
            "from sys_repair sr " +
            "inner join order_head oh on sr.`order` = oh.id " +
            "left join order_details od on sr.details = od.id " +
            "where sr.sn = #{sn} and oh.company = #{company} " +
            "order by sr.id asc")
    List<SameSnTicket> getSameSnTickets(String sn, String company);

    // 接单失败兜底提示：按 id 查工单状态 / 当前负责人
    @Select("select status from sys_repair where id = #{id}")
    String getStatusById(int id);

    @Select("select account from sys_repair where id = #{id}")
    String getAccountById(int id);

    // 按账号查员工姓名（sys_user.name），用于接单/派发提示里显示具体人名；查不到返回 null
    @Select("select name from sys_user where account = #{account} limit 1")
    String getUserNameByAccount(String account);

    // 维修接单（普通用户）：返回当前账号「已接单」的维修明细（维修中/已完成），排除「待接单」。
    // 注意：派发会把 order_details.assignee 抄进 sys_repair.account，故「派发给本人但未接单」的工单
    // account 也等于本人——必须用 status != '待接单' 排除，否则未接单的派发单会混进列表。
    // order_head 内连接并配合 where order_head.company = #{company}，确保只返回本公司订单产生的工单（严格排除跨公司）。
    @Select("select sys_repair.id,sys_repair.sn,sys_repair.account,sys_repair.status ,sys_repair.description ,sys_repair.diagnosis ,sys_repair.dispose,sys_repair.result,sys_repair.repair_time,sys_repair.time,order_details.name,order_details.model,order_details.type,order_details.brand,order_details.spec,order_head.name as head_name,sys_repair.take_time " +
            "from sys_repair " +
            "left join order_details on sys_repair.details = order_details.id " +
            "inner join order_head on sys_repair.order = order_head.id " +
            "where sys_repair.account = #{account} and order_head.company = #{company} and sys_repair.status != '待接单'")
    List<Accept> getAllAcceptInfo(String account, String company);

    // 维修接单（管理员）：返回本公司「已接单」的维修工单（维修中/已完成），排除「待接单」（入库未接单）。
    // 待接单工单不入此列表——接单走「快速接单」输入 SN 认领，不依赖列表展示。
    // 内连接 order_head 并限定 company，只返回本公司订单产生的工单，且工单名称可解析。
    @Select("select sys_repair.id,sys_repair.sn,sys_repair.account,sys_repair.status ,sys_repair.description ,sys_repair.diagnosis ,sys_repair.dispose,sys_repair.result,sys_repair.repair_time,sys_repair.time,order_details.name,order_details.model,order_details.type,order_details.brand,order_details.spec,order_head.name as head_name,sys_repair.take_time " +
            "from sys_repair " +
            "left join order_details on sys_repair.details = order_details.id " +
            "inner join order_head on sys_repair.order = order_head.id and order_head.company = #{company} " +
            "where sys_repair.status != '待接单'")
    List<Accept> getAllRepairTickets(String company);

    // 维修出库：返回 status='已完成' 的工单。
    // 普通用户仅看自己接的单（account = 当前账号）；管理员 account 传 null、company = 当前公司，看本公司全部。
    @Select("<script>" +
            "select sys_repair.id,sys_repair.sn,sys_repair.account,sys_repair.status ,sys_repair.description ,sys_repair.diagnosis ,sys_repair.dispose,sys_repair.result,sys_repair.repair_time,sys_repair.time,order_details.name,order_details.model,order_details.type,order_details.brand,order_details.spec,order_head.name as head_name,sys_repair.take_time " +
            "from sys_repair " +
            "left join order_details on sys_repair.details = order_details.id " +
            "left join order_head on sys_repair.order = order_head.id " +
            "<where>" +
            "sys_repair.status = '已完成' " +
            "<if test='account != null and account != \"\"'> and sys_repair.account = #{account} </if>" +
            "<if test='company != null and company != \"\"'> and order_head.company = #{company} </if>" +
            "</where>" +
            "</script>")
    List<Accept> getFinishedRepairs(@Param("account") String account, @Param("company") String company);

    @Insert("insert into sys_repair (sn,details,`order`,register,status,time,account) " +
            "values (#{sn},#{detailsId},#{orderId},#{register},'待接单',#{time},#{account})")
    void insertRepairTicket(String sn, long detailsId, String orderId, String register, LocalDateTime time, String account);

    @Select("select count(1) from sys_repair where `order` = #{orderId}")
    int countRepairByOrder(String orderId);

    // 入库前 SN 重复检查（跨订单）：当前订单要入库的 SN 若已在「其他订单」的工单中存在，则返回重复项。
    // 用 UNION ALL 同时返回两侧：本订单侧（kind='cross_self'，order_name 空，seq=本订单序号）+ 其他订单侧
    // （kind='cross_order'，含已存在工单所属订单/设备/状态），弹窗里能同时看到「本订单哪台设备」与「其他订单哪条工单」重复。
    @Select("select od.sn as sn, od.`order` as order_id, null as order_name, null as status, " +
            "(select count(1) from order_details odx where odx.`order` = od.`order` and odx.id <= od.id) as seq, " +
            "'cross_self' as kind " +
            "from order_details od " +
            "where od.`order` = #{orderId} and od.sn is not null and od.sn != '' " +
            "and od.sn in (select sr2.sn from sys_repair sr2 inner join order_head oh2 on sr2.`order` = oh2.id " +
            "where sr2.`order` != #{orderId} and oh2.company = #{company}) " +
            "union all " +
            "select sr.sn as sn, oh.id as order_id, oh.name as order_name, sr.status as status, " +
            "(select count(1) from order_details odx where odx.`order` = od.`order` and odx.id <= od.id) as seq, " +
            "'cross_order' as kind " +
            "from sys_repair sr " +
            "inner join order_head oh on sr.`order` = oh.id " +
            "left join order_details od on sr.details = od.id " +
            "where sr.sn in (select od2.sn from order_details od2 where od2.`order` = #{orderId} and od2.sn is not null and od2.sn != '') " +
            "and sr.`order` != #{orderId} " +
            "and oh.company = #{company})")
    List<DuplicateSn> getDuplicateSn(String orderId, String company);

    // 入库前 SN 重复检查（同订单）：当前订单「内部」重复的 SN（同一订单里多台设备 SN 相同，属录入问题）。
    // 逐设备返回（每台重复设备一行，带 seq 序号），与跨订单结构一致，供弹窗同口径展示「本订单 | 序号 | SN」。
    // 只保留「出现次数 >1 的 SN」对应的设备明细行。
    @Select("select od.sn as sn, oh.id as order_id, oh.name as order_name, " +
            "(select count(1) from order_details odx where odx.`order` = od.`order` and odx.id <= od.id) as seq " +
            "from order_details od " +
            "inner join order_head oh on od.`order` = oh.id " +
            "where od.`order` = #{orderId} " +
            "and od.sn is not null and od.sn != '' " +
            "and od.sn in (select sn from order_details where `order` = #{orderId} and sn is not null and sn != '' group by sn having count(1) > 1) " +
            "order by od.sn, od.id")
    List<DuplicateSn> getSameOrderDuplicateSn(String orderId);

    @Select("select * from repair_photo where sn_id = #{id}")
    List<Img> getAcceptImg(Integer id);

    @Insert("insert into repair_photo (url,sn_id,image_phase,time) values (#{fileName},#{id},#{message},#{now})")
    void uploadImg(String fileName, String id, String message, LocalDateTime now);

    @Delete("delete from repair_photo where id = #{id}")
    void deleteImg(String id);

    @Update("update sys_repair set description = #{description},diagnosis = #{diagnosis},dispose = #{dispose},result = #{result} where id = #{id}")
    void updateAccept(int id, String description, String diagnosis, String dispose, String result);

    @Update("update sys_repair set description = #{description},diagnosis = #{diagnosis},dispose = #{dispose},result = #{result},repair_time = #{now},status = '已完成' where id = #{id}")
    void finishAccept(int id, String description, String diagnosis, String dispose, String result, LocalDateTime now);
}
