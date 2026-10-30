package com.example.lucifer.util;

import cn.hutool.crypto.asymmetric.KeyType;
import cn.hutool.crypto.asymmetric.RSA;

public class RSAUtil {
    private static final String PRIVATE_KEY =
                    "MIIJRAIBADANBgkqhkiG9w0BAQEFAASCCS4wggkqAgEAAoICAQCvMGshv/RJ14Iz\n" +
                    "4qd8Tkav4TqSIhFeRbyD+MulW/3Sh+DI3nNFZnrVEHuB5shsH/c7nx1hAd7RiWNn\n" +
                    "PbcVSYz4W3uRgsepwv/0vu4M4YSEo5Dn3DR+WsTZjLQa1zMTpTX/d8mttPcY3b6b\n" +
                    "U62NwySpjjSA8RLEwuEkQv8LM5CkOkBXHViKUzkfgvWV3FFw9j9/15/InqQ9O971\n" +
                    "m6OH5u304XEdHv3CwKaG1ZU0V/2bwbStlrMy671y3kqKcEJ3mGvbzy4ZdkbpaDg9\n" +
                    "2WNc5xRwwCU/kht1eIi0CNjfd6jnI2/CSMihcjkVXKoLTxNmuUjEAgl7jDLjGT0R\n" +
                    "Juv7XzMbzO+qaz98YuWu7W14aUb37aX6jFupCejewSC3fumHec8i8VXO8KVj7nTy\n" +
                    "bX2DgYxcYhmFFv8fzKPWe14Phs/Y5yled+4SK+u6KGKof4FRisAnOLgR27qsg1X1\n" +
                    "UOuyZRahoa5XXJbUpRTMMyu8wNhkUjsAIX/4nlSW2m8OrGdoeIYxoLoPZkiaZruk\n" +
                    "JbVVUO7O0ZdRpaMInec8WuN5Zs0d+3C0K3pPcJpTkDnZXhN2WO181NCThxBG5TfF\n" +
                    "khgS3rMCkrFvX3VIh93KEZCjvopGhSCdDinckESZ+rY58V6DkiwpyGemFZXliQZq\n" +
                    "X2QH64YSrk2+qPNx6q6bFrdiKo3CUwIDAQABAoICAQCbi1XTZWc0mM/V2YvzZlyE\n" +
                    "lGk4jl71YN18H05Qx1iZsGL4denK2K5+tl+yeoHA3rDYkvG2y75WNLG5XKZNlDxB\n" +
                    "1pfkHkXAiI5Rc6RQc3sBeWiTNIS3G0hkD/VpT2DeNHW5GVZLkL1Dqr4tkyIpF/ZZ\n" +
                    "RRWA1opfgNf9Ji7kdygZaE7wCfIu/q1dOR1rrW3x6fF/RKdtrM0OQTY4w7NyWqs0\n" +
                    "HWYdAQM2A27XkJMlImrd/CK7bW416/ENKCjuubWKEh7RzyWTHdzgJ9SntXfvaIxR\n" +
                    "f4iS5NrUdeyKTMChyNCCSIhV6+GW1p+wQ9IGsHL9Zc0hmt1ogJY95I6/x9sGGQR6\n" +
                    "VRTWv74GTLKL0H1GIA5ZHvaJo9cILmDmFH0EYmQwQmbEqy6fk6RGyBOycr/UuMJM\n" +
                    "GRba6EPy4vT5dOwPoafCPNCxCOLeD7I8O10mGozYipLj+2QtEkThx2koAVJdSd/h\n" +
                    "3O0HeRKG4hdnt+gGoDuc0qErRJUAEcx8vxyWZF95nbILcIHl+XS9D4NYoF57MKCP\n" +
                    "pcfIvplBS45vQSx+p+50DIDRXeEYfw60FV+1GP4OLC1a+AVGBmDdFZPP/O7HUN4O\n" +
                    "J5GRxKfJFmlYzljuAlRCRHnRA5PJWT0lrJNrYog4B9B3wDOBfBPmns5kan9G1Ups\n" +
                    "UJCIsbSog4M1WxwAYf/toQKCAQEA5oe5EVkdLSmPRezzs17a007zU2spzB3yic2f\n" +
                    "L5hxvB1FYl2vVcsYnrS2n4O44VE7163mkdn0VzF1kgkiSZLJNQveS3Yi4TgzFG0P\n" +
                    "skVQfPy8x7w9bUGkYs7/lOCUUVnWGYFGk8L9fhyHZM0lliUAkEsgDMipVq+ifo/Q\n" +
                    "zgGQrJgSbVONVzJ/Gxx8Ms9kcThEihS/swJaSYgSV1yNp8+cGVYzfsyWkh5UVUk7\n" +
                    "TkQ+sOLpLbBgkEDfF/o91JFrQqRPv/14Wbc1OX69diFzZoJxd0zm6YJYBVvmBgaz\n" +
                    "XSQw4ZkXqJqKegPlTh+I7dmsBQwjB8TzDwAXNVOO9INO24gyVQKCAQEAwotwXzYM\n" +
                    "GXxzjIBvvs8sBTTDEm6I5YQEkNmp/WCYRcSPC20jjfQ0oEBfQQo2f/XW6a8FI3+K\n" +
                    "NkCk+QFHxieXkYK3jE7vi2QFBU/H5Ucu1DzQZRYwlQoOxyIkjWFfPe7B3fRGTwom\n" +
                    "Abja0MyV1AUlXMGwgWajEeEuhb/tkHKOwlu30XF+9umE/RjYtKhU8NZNtsAVAhZu\n" +
                    "N00CEVe5M81A3NsAFzl1XKqeQ6JiA4waEGr7q1knvO9QMR+WxA9xoz+/sp9wi5rI\n" +
                    "kybToDIfK93tsCtceX3OXLz1cs5/owMSOkcVgAfy1axZ3PDlu8nP3pY6E9Ul57X2\n" +
                    "WHTTKIPimxjaBwKCAQEAl8PYUZRyQc4vdWB2W6rhsuUyCcPuA2PfzVriJopcrfQz\n" +
                    "Pnvgt0F6ltjvtXoZV7SMCgSBW5m6Y0C7XwXGXdtVvSdwFAvVEKJX9mWKRNmfEHmu\n" +
                    "qmvBoNDrMOWHmvJykk/rRGU4GoTvL3wGopTv3rXDdjsPAXuFB/2eo2V4mHatUQLY\n" +
                    "dsLftP0YcrfBCA5C2MqrTKA2R9oPqIL9WCglVcm2wXNfeWWk5tMyv+bzNSZ2gysP\n" +
                    "SbXpDG64sGddFzkY/QmBOyradW3Ii25luoRxHZZYrqqhBi96VSTX/TWiFXqC97I6\n" +
                    "whPjgEpaRqE6GyQHPFduJGpDfaeYn9G/tjdPzfUO9QKCAQEAg3n/GKmLJdJAuQy3\n" +
                    "+IlEo8QTrao8JHjDKS2hP5b/ce80CTHaHH6U7lRyy57eVD5N3yIkY+g2/RFVLN+b\n" +
                    "pSRuv61K5K0YIOkYp41Sd/ZShKcQ47BKZv8kG5pMf6v11QI9zQXgWlxucS1/3CrX\n" +
                    "ezF7HaPc6Kb3wAaiDUw3fi6domaf5RFCEBajhPU8x2MX/KeoX8CSshV8qS0HH7dc\n" +
                    "d9DYbCopdoijc1vvl5/vg5w0pTHYIeYgAATv+jLyDlCtqPlVUZ+FTSPvN9u+m/4j\n" +
                    "qN7UWwIC/ixywaQGcW9zPTS/JdmSgzNb/uH63WGEsRPjwvdeCrc7ZcxIz2Esr63q\n" +
                    "AI2cEwKCAQBR98PlfvlXgbYmOtaBIcA3+6pliuZYsGuq+c+5M7AucuCyn5AlyQWN\n" +
                    "vUtIxRnZ/RL3QXW4gUQ/xPg60QSDFS01fiqHkCxJ5ZPA/B4MFmubrpsfRE7S2v5r\n" +
                    "jJDFEhuxNiyQKiL7hhP3k7JofjjdnNPnHGKaiMFYM2rdLrPqOLOZP0vWCKc1AzoR\n" +
                    "LOA7imsC988gdnkjCNPZDMQDwtGdZlYDDoyIxPuLFk0SJNNOmWVdRkJIxA4nEJMV\n" +
                    "NB4X6SWebRpNUAI+3eFD+wTB/8RZhd7eQukswPD5usDMW2kBaEaYGvLXevZqZFh3\n" +
                    "rtCEjJCuZ0mn1BdRmyWpCSYuo2tYbCME";

    private static final String PUBLIC_KEY = "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEArzBrIb/0SdeCM+KnfE5G\n" +
                    "r+E6kiIRXkW8g/jLpVv90ofgyN5zRWZ61RB7gebIbB/3O58dYQHe0YljZz23FUmM\n" +
                    "+Ft7kYLHqcL/9L7uDOGEhKOQ59w0flrE2Yy0GtczE6U1/3fJrbT3GN2+m1OtjcMk\n" +
                    "qY40gPESxMLhJEL/CzOQpDpAVx1YilM5H4L1ldxRcPY/f9efyJ6kPTve9Zujh+bt\n" +
                    "9OFxHR79wsCmhtWVNFf9m8G0rZazMuu9ct5KinBCd5hr288uGXZG6Wg4PdljXOcU\n" +
                    "cMAlP5IbdXiItAjY33eo5yNvwkjIoXI5FVyqC08TZrlIxAIJe4wy4xk9ESbr+18z\n" +
                    "G8zvqms/fGLlru1teGlG9+2l+oxbqQno3sEgt37ph3nPIvFVzvClY+508m19g4GM\n" +
                    "XGIZhRb/H8yj1nteD4bP2OcpXnfuEivruihiqH+BUYrAJzi4Edu6rINV9VDrsmUW\n" +
                    "oaGuV1yW1KUUzDMrvMDYZFI7ACF/+J5UltpvDqxnaHiGMaC6D2ZImma7pCW1VVDu\n" +
                    "ztGXUaWjCJ3nPFrjeWbNHftwtCt6T3CaU5A52V4TdljtfNTQk4cQRuU3xZIYEt6z\n" +
                    "ApKxb191SIfdyhGQo76KRoUgnQ4p3JBEmfq2OfFeg5IsKchnphWV5YkGal9kB+uG\n" +
                    "Eq5Nvqjzcequmxa3YiqNwlMCAwEAAQ==";

    public static final RSA rsa = new RSA(PRIVATE_KEY, PUBLIC_KEY);

    //获取公钥
    public static String getPublicKey() {
        return rsa.getPublicKeyBase64();
    }


    //解密
    public static String decrypt(String encryptedData) {
        return rsa.decryptStr(encryptedData, KeyType.PrivateKey);
    }
}
