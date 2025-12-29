package com.smartattendence.attendence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // only for internal DB mapping, never used in logic

    private String name;
    private String email;

    @Column(unique = true, nullable = false)
    private String registrationNo;

    private String password;
    private String imagePath; // folder path for stored image(s)

    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRegistrationNo() { return registrationNo; }
    public String getPassword() { return password; }
    public String getImagePath() { return imagePath; }

    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setRegistrationNo(String registrationNo) { this.registrationNo = registrationNo; }
    public void setPassword(String password) { this.password = password; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }
}

// package com.smartattendence.attendence.entity;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;

// @Entity
// public class Student {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     private String name;
//     private String email;

//     @Column(unique = true, nullable = false)
//     private String registrationNo;
    
//     private String password;

//     private String imagePath; // stores file path of saved image

//     public Long getId() { return id; }
//     public String getName() { return name; }
//     public String getEmail() { return email; }
//     public String getRegistrationNo() { return registrationNo; }
//     public String getPassword() { return password; }
//     public String getImagePath() { return imagePath; }

//     public void setId(Long id) { this.id = id; }
//     public void setName(String name) { this.name = name; }
//     public void setEmail(String email) { this.email = email; }
//     public void setRegistrationNo(String registrationNo) { this.registrationNo = registrationNo; }
//     public void setPassword(String password) { this.password = password; }
//     public void setImagePath(String imagePath) { this.imagePath = imagePath; }
// }
