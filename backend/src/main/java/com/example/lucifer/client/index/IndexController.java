package com.example.lucifer.client.index;

import com.example.lucifer.client.index.model.Banner;
import com.example.lucifer.util.Return;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/index")
public class IndexController {

    @Autowired
    private IndexService indexService;

    @GetMapping("/getBanner")
    private Return<List<Banner>> getBanner() {
        return indexService.getBanner();
    }
}
