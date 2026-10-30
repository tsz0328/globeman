package com.example.lucifer.client.repair.model;

public class Img {
    private long id;
    private String url;
    private String imagePhase;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getImagePhase() {
        return imagePhase;
    }

    public void setImagePhase(String imagePhase) {
        this.imagePhase = imagePhase;
    }

    @Override
    public String toString() {
        return "Img{" +
                "id=" + id + '\'' +
                "url='" + url + '\'' +
                ", imagePhase='" + imagePhase + '\'' +
                '}';
    }
}
