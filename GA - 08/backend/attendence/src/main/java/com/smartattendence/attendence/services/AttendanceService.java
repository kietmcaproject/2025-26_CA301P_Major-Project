package com.smartattendence.attendence.services;

import com.smartattendence.attendence.entity.Attendance;
import com.smartattendence.attendence.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {
    @Autowired
    private AttendanceRepository repo;

    public Attendance markAttendance(String regNo, String name) {
        Attendance a = new Attendance(regNo, name);
        return repo.save(a);
    }

    public List<Attendance> fetchAll() {
        return repo.findAll();
    }

    public List<Attendance> getAttendanceByReg(String registrationNo) {
        return repo.findByRegistrationNoOrderByTimestampDesc(registrationNo);
    }
    public List<Attendance> getAttendanceByDate(LocalDate date) {
    return repo.findByDate(date);
    }
 
public void deleteAttendanceByReg(String regNo) {
        repo.deleteAll(repo.findByRegistrationNoOrderByTimestampDesc(regNo));
    }
}


// package com.smartattendence.attendence.services;

// import com.smartattendence.attendence.entity.Attendance;
// import com.smartattendence.attendence.repository.AttendanceRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// @Service
// public class AttendanceService {
//     @Autowired
//     private AttendanceRepository repo;
//     public Attendance markAttendance(String regNo, String name) {
//         Attendance a = new Attendance(regNo, name);
//         return repo.save(a);
//     }
// }
