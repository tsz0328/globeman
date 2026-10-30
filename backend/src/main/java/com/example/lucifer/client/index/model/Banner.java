package com.example.lucifer.client.index.model;

public class Banner {
    private int sort;
    private String url;
    private int status;

    public int getSort() {
        return sort;
    }

    public void setSort(int sort) {
        this.sort = sort;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "Banner{" +
                "sort=" + sort +
                ", url='" + url + '\'' +
                ", status=" + status +
                '}';
    }
}
