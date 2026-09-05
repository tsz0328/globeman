import JSEncrypt from 'jsencrypt'
import request from '@/utils/request'

// === 公钥查询接口响应 ===
interface RsaResponse {
  code: number
  msg: string
  data: string
}

/**
 * 获取登录使用的 RSA 公钥（从后端 /rsa 接口查询，每次登录现取，保证密钥轮换后依然可用）
 * @returns 公钥（base64）
 */
export async function getLoginPublicKey(): Promise<string> {
  const res: RsaResponse = await request({
    url: '/rsa',
    method: 'get',
    skipToken: true,
  })
  if (res.code !== 200 || !res.data) {
    throw new Error(res.msg || '获取公钥失败')
  }
  return res.data
}

/**
 * RSA 加密（RSAES-PKCS1-v1_5，与后端解密约定一致）
 * @param text 需要加密的明文
 * @param publicKey 公钥（base64）
 * @returns 密文（base64）
 */
export function encodeStr(text: string, publicKey: string): string {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)
  const encrypted = encryptor.encrypt(text)
  if (encrypted === false) {
    throw new Error('RSA 加密失败')
  }
  return encrypted
}
