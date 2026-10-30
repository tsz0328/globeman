package com.example.lucifer.client.repair.model;

/**
 * 入库前 SN 重复检查结果。
 * 三类重复共用此模型，用 kind 区分，均携带 orderId/orderName/seq：
 * <ul>
 *   <li>same_order —— 本订单内多台设备 SN 相同（录入问题），逐设备返回，seq=该设备在本订单的序号，status 为空</li>
 *   <li>cross_self —— 跨订单重复中的「本订单侧」：本订单里与其他订单工单 SN 相同的设备，orderName 为空（前端显示「本订单」），seq=本订单序号，status 为空</li>
 *   <li>cross_order —— 跨订单重复中的「其他订单侧」：已存在工单，seq=已存在工单对应设备在其订单的序号，status=工单状态</li>
 * </ul>
 * 用于入库前弹窗提示，由用户决定取消或仍然入库。
 */
public class DuplicateSn {
    // 重复的 SN 码
    private String sn;
    // 所属订单编号（order_head.id）
    private String orderId;
    // 所属订单名称（order_head.name）
    private String orderName;
    // 设备在其所属订单中的序号（按 order_details.id 升序的第几行，1 起）
    private Integer seq;
    // 工单状态（待接单/维修中/已完成，仅 cross_order 有值；same_order 未入库为空）
    private String status;
    // 重复类型：same_order（本订单内重复）/ cross_self（跨订单重复中的本订单侧）/ cross_order（跨订单重复中的其他订单侧）
    private String kind;

    public String getSn() {
        return sn;
    }

    public void setSn(String sn) {
        this.sn = sn;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getOrderName() {
        return orderName;
    }

    public void setOrderName(String orderName) {
        this.orderName = orderName;
    }

    public Integer getSeq() {
        return seq;
    }

    public void setSeq(Integer seq) {
        this.seq = seq;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    @Override
    public String toString() {
        return "DuplicateSn{" +
                "sn='" + sn + '\'' +
                ", orderId='" + orderId + '\'' +
                ", orderName='" + orderName + '\'' +
                ", seq=" + seq +
                ", status='" + status + '\'' +
                ", kind='" + kind + '\'' +
                '}';
    }
}
