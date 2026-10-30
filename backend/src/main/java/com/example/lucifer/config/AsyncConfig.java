package com.example.lucifer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
public class AsyncConfig {

    @Bean(name = "asyncTaskExecutor") // 给线程池命名，方便指定使用
    public Executor asyncTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // 1. 核心线程数（默认CPU核心数）
        executor.setCorePoolSize(Runtime.getRuntime().availableProcessors() / 2);
        // 2. 最大线程数（线程池允许创建的最大线程数量，包含核心线程 + 非核心线程）
        executor.setMaxPoolSize(Runtime.getRuntime().availableProcessors() * 2);
        // 3. 队列容量（核心线程满后，任务先进入队列等待）
        executor.setQueueCapacity(100);
        // 4. 非核心线程空闲超时时间（超时后销毁）
        executor.setKeepAliveSeconds(10);
        // 5. 线程名称前缀（便于日志排查）
        executor.setThreadNamePrefix("Async-Thread-");
        // 6. 任务拒绝策略（队列满+最大线程满时的处理方式）
        //    CallerRunsPolicy：由调用者线程执行（如主线程），避免任务丢失
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        // 7. 初始化线程池
        executor.initialize();

        return executor;
    }

}
