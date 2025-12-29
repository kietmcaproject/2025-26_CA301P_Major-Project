package com.smartattendence.attendence.entity;

import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "attendance")
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // ✅ new primary key

    private String registrationNo;
    private String name;
    private LocalDateTime timestamp;

    public Attendance() {}

    public Attendance(String registrationNo, String name) {
        this.registrationNo = registrationNo;
        this.name = name;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRegistrationNo() { return registrationNo; }
    public void setRegistrationNo(String registrationNo) { this.registrationNo = registrationNo; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}

// package com.smartattendence.attendence.entity;

// import java.time.LocalDateTime;

// import jakarta.persistence.Entity;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.Table;

// @Entity
// @Table(name = "attendance")
// public class Attendance {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;
//     private String registrationNo;
//     private String name;
//     private LocalDateTime timestamp;

//     public Attendance() {}
//     public Attendance(String registrationNo, String name) {
//         this.registrationNo = registrationNo;
//         this.name = name;
//         this.timestamp = LocalDateTime.now();
//     }

//     public Long getId() { return id; }
//     public void setId(Long id) { this.id = id; }
//     public String getRegistrationNo() { return registrationNo; }
//     public void setRegistrationNo(String registrationNo) { this.registrationNo = registrationNo; }
//     public String getName() { return name; }
//     public void setName(String name) { this.name = name; }
//     public LocalDateTime getTimestamp() { return timestamp; }
//     public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
// }
