package com.example.lucifer.util;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

public class FileUtil {

    private static final String FILE = System.getProperty("user.dir") + File.separator + "public" + File.separator + "file";
    private static final String PICTURE = System.getProperty("user.dir") + File.separator + "public" + File.separator + "picture";

    public static String saveImage(MultipartFile file) throws IOException {
        //判断文件是否为空
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("上传文件不能为空");
        }

        // 2. 获取原始文件后缀
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));

        // 3. 生成时间戳文件名
        String timeStamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String newFileName = timeStamp + UUID.randomUUID().toString().substring(0, 8) + suffix;

        // 4. 创建public文件夹，不存在则新建
        File publicFolder = new File(PICTURE);
        if (!publicFolder.exists()) {
            publicFolder.mkdirs();
        }

        // 5. 拼接完整文件路径
        File targetFile = new File(publicFolder, newFileName);

        // 6. 写入文件
        file.transferTo(targetFile);

        // 7. 返回生成的文件名
        return newFileName;
    }

    public static String saveFile(MultipartFile file) throws IOException {
        //判断文件是否为空
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("上传文件不能为空");
        }

        // 2. 获取原始文件后缀
        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));

        // 3. 生成时间戳文件名
        String timeStamp = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String newFileName = timeStamp + "_" + UUID.randomUUID().toString().substring(0, 8) + suffix;

        // 4. 创建public文件夹，不存在则新建
        File publicFolder = new File(FILE);
        if (!publicFolder.exists()) {
            publicFolder.mkdirs();
        }

        // 5. 拼接完整文件路径
        File targetFile = new File(publicFolder, newFileName);

        // 6. 写入文件
        file.transferTo(targetFile);

        // 7. 返回生成的文件名
        return newFileName;
    }

    public static String getPictureUrl(String fileName) {
        return "/picture/" + fileName;
    }

    public static String getFileUrl(String fileName) {
        return "/picture/" + fileName;
    }

    public static void  deleteFile(String fileName) {
        File file = new File(System.getProperty("user.dir") + File.separator + "public" + File.separator + fileName);
        if (file.exists()) {
            file.delete();
        }
    }
}
