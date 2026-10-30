package com.example.lucifer.client.customer;

import com.example.lucifer.client.customer.model.Customer;
import com.example.lucifer.util.Return;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/client/customer")
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/getInfoCustomer")
    public Return<List<Customer>> getInfoCustomer(){
        return customerService.getInfoCustomer();
    }

    @PostMapping("/createCustomer")
    public Return<String> createCustomer(@RequestBody Customer customer){
        return customerService.createCustomer(customer);
    }

    @PostMapping("/updateCustomer")
    public Return<String> updateCustomer(@RequestBody Customer customer){
        return customerService.updateCustomer(customer);
    }

    @PostMapping("/deleteCustomer")
    public Return<String> deleteCustomer(@RequestParam String id){
        return customerService.deleteCustomer(id);
    }
}
