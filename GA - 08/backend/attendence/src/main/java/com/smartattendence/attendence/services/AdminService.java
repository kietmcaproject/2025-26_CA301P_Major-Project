package com.smartattendence.attendence.services;

import com.smartattendence.attendence.entity.Admin;
import com.smartattendence.attendence.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminService {
    @Autowired
    private AdminRepository repository;

    public Admin registerAdmin(Admin admin) { return repository.save(admin); }

    public Admin login(String username, String password) {
        Admin admin = repository.findByUsername(username);
        if (admin != null && admin.getPassword().equals(password)) return admin;
        return null;
    }
}
