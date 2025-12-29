package com.smartattendence.attendence.controller;

import com.smartattendence.attendence.entity.Admin;
import com.smartattendence.attendence.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ✅ Register admin (can be used for first-time admin creation)
    @PostMapping("/register")
    public Admin registerAdmin(@RequestBody Admin admin) {
        return adminService.registerAdmin(admin);
    }

    // ✅ Login admin
    @PostMapping("/login")
    public String login(@RequestBody Admin admin) {
        Admin existingAdmin = adminService.login(admin.getUsername(), admin.getPassword());
        if (existingAdmin != null) {
            return "success";
        } else {
            return "failure";
        }
    }

    
}
