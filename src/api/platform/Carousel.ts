import request from "@/utils/request";
import type { ApiResponse } from "@/api/types";

export interface CarouselItem {
  url: string;
  sort: number;
  // 真实 getBanner 响应只返回 url+sort，没有 title；
  // addBanner 虽接收 title，但列表不回传，故此处设为可选以对齐实测契约
  title?: string;
  // 轮播图状态（0=启用, 1=停用），后端新增返回，可选以兼容未返回时的旧响应
  status?: number;
}

export async function getCarouselListApi(): Promise<ApiResponse<CarouselItem[]>> {
  return request({
    url: "/index/getBanner",
    method: "get",
  });
}

// 管理端轮播图列表（需登录态）：用于 CarouselManagement 管理页
// 真实响应字段（已按开发者工具核对）：sort / status(0=启用,1=停用) / title / url，无 id
export interface ClientBannerItem {
  title?: string
  url: string
  sort: number
  status?: number
}

export async function getClientBannerListApi(): Promise<ApiResponse<ClientBannerItem[]>> {
  return request({
    url: '/client/banner/getBanner',
    method: 'get',
  })
}

// 新增轮播图：img=图片文件(前端从本地文件夹选取), sort=排序(0~100), title=标题
// 后端直接收文件(multipart/form-data)，照项目现有上传接口写法走 FormData
export async function addBannerApi(
  file: File,
  sort: number,
  title: string,
): Promise<ApiResponse<unknown>> {
  const formData = new FormData()
  formData.append('img', file)
  formData.append('sort', sort.toString())
  formData.append('title', title)
  return request({
    url: '/client/banner/addBanner',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 更新轮播图状态：后端按 url 自动切换 启用/停用（0=启用,1=停用）
// form-urlencoded：Content-Type: application/x-www-form-urlencoded
export async function updateBannerStatusApi(
  url: string,
): Promise<ApiResponse<unknown>> {
  const formData = new URLSearchParams()
  formData.append('url', url)
  return request({
    url: '/client/banner/updateStatus',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}

// 删除轮播图：按 url 标识（DELETE ?url=...）
export async function deleteBannerApi(
  url: string,
): Promise<ApiResponse<unknown>> {
  return request({
    url: '/client/banner/deleteBanner',
    method: 'delete',
    params: { url },
  })
}
