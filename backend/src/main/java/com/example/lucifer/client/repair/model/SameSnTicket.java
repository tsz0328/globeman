package com.example.lucifer.client.repair.model;

/**
 * 接单前按 SN 查出的「同 SN 相关工单」——供前端弹窗列出全部同 SN 工单、由员工选单接单。
 *
 * <p>两个易混淆的账号字段语义（都存的是员工 account）：</p>
 * <ul>
 *   <li><b>assignee</b> —— 派发人（order_details.assignee，入库时抄进 sys_repair.account 后不再随接单改变）；</li>
 *   <li><b>account</b> —— 当前负责人（sys_repair.account，待接单时 = 派发人，接单后 = 接单人）。</li>
 * </ul>
 * 前端「派发」列用 assignee/assigneeName；「是否派给我 / 我已接过」用 account 判断。
 */
public class SameSnTicket {
    // 工单 id（sys_repair.id，接单时按此 id 精确接单）
    private int id;
    private String sn;
    // 工单状态：待接单 / 维修中 / 已完成
    private String status;
    // 当前负责人账号（sys_repair.account）
    private String account;
    // 当前负责人姓名（Service 层查 sys_user.name 填充；空账号为空串，前端显示「未派发」）
    private String accountName;
    // 派发人账号（order_details.assignee）
    private String assignee;
    // 派发人姓名（Service 层查 sys_user.name 填充；空账号为空串，前端显示「未派发」）
    private String assigneeName;
    // 所属订单编号 / 名称
    private String orderId;
    private String orderName;
    // 设备在其所属订单中的序号（第几行，1 起）
    private int seq;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getSn() {
        return sn;
    }

    public void setSn(String sn) {
        this.sn = sn;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getAssignee() {
        return assignee;
    }

    public void setAssignee(String assignee) {
        this.assignee = assignee;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public void setAssigneeName(String assigneeName) {
        this.assigneeName = assigneeName;
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

    public int getSeq() {
        return seq;
    }

    public void setSeq(int seq) {
        this.seq = seq;
    }

    @Override
    public String toString() {
        return "SameSnTicket{" +
                "id=" + id +
                ", sn='" + sn + '\'' +
                ", status='" + status + '\'' +
                ", account='" + account + '\'' +
                ", accountName='" + accountName + '\'' +
                ", assignee='" + assignee + '\'' +
                ", assigneeName='" + assigneeName + '\'' +
                ", orderId='" + orderId + '\'' +
                ", orderName='" + orderName + '\'' +
                ", seq=" + seq +
                '}';
    }
}
