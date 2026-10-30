package com.example.lucifer.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Return<T> {
    // 状态码
    private int code;
    // 响应消息
    private String msg;
    // 业务数据
    private T data;
    // 时间戳
    private String timestamp;

    // 私有构造方法，避免外部直接实例化，通过静态方法创建
    private Return(int code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        this.timestamp = now.format(formatter);
    }

    //成功操作
    public static <T> Return<T> success(T data) {
        return new Return<>(200, "操作成功", data);
    }

    public static <T> Return<T> success(String msg) {
        return new Return<>(200, msg,null);
    }

    public static <T> Return<T> success(String msg,T data) {
        return new Return<>(200, msg, data);
    }

    //失败操作
    public static <T> Return<T> error(T data) {
        return new Return<>(500, "操作失败", data);
    }

    public static <T> Return<T> error(String msg) {
        return new Return<>(500, msg,null);
    }

    public static <T> Return<T> error(String msg,T data) {
        return new Return<>(500, msg, data);
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "Return{" +
                "code=" + code +
                ", msg='" + msg + '\'' +
                ", data=" + data +
                ", timestamp='" + timestamp + '\'' +
                '}';
    }
}
