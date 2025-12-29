package com.smartattendence.attendence.controller;

import com.smartattendence.attendence.entity.Attendance;
import com.smartattendence.attendence.entity.Student;
import com.smartattendence.attendence.services.StudentService;
import com.smartattendence.attendence.services.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {
    @Autowired
    private StudentService studentService;
    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/mark")
    public String markAttendance(@RequestBody FaceMatchDTO dto) {
        Student student = studentService.getStudentByReg(dto.getRegistrationNo());
        if (student == null) return "Student not found";
        attendanceService.markAttendance(student.getRegistrationNo(), student.getName());
        return "Attendance marked for " + student.getName();
    }

    @GetMapping("/fetch")
    public List<Attendance> fetchAttendance() {
        return attendanceService.fetchAll();
    }


    // ✅ Fetch attendance for a single student
    @GetMapping("/fetch/{registrationNo}")
    public List<Attendance> fetchAttendanceByReg(@PathVariable String registrationNo) {
        return attendanceService.getAttendanceByReg(registrationNo);
    }

   @GetMapping("/by-date")
    public List<Attendance> getByDate(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return attendanceService.getAttendanceByDate(localDate);
    }



    public static class FaceMatchDTO {
        private String registrationNo;
        private String capturedImage;

        public String getRegistrationNo() { return registrationNo; }
        public void setRegistrationNo(String registrationNo) { this.registrationNo = registrationNo; }

        public String getCapturedImage() { return capturedImage; }
        public void setCapturedImage(String capturedImage) { this.capturedImage = capturedImage; }
    }
}

// package com.smartattendence.attendence.controller;

// import com.smartattendence.attendence.entity.Student;
// import com.smartattendence.attendence.services.StudentService;
// import com.smartattendence.attendence.services.AttendanceService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/attendance")
// @CrossOrigin(origins = "*")
// public class AttendanceController {
//     @Autowired
//     private StudentService studentService;
//     @Autowired
//     private AttendanceService attendanceService;

//     @PostMapping("/mark")
//     public String markAttendance(@RequestBody FaceMatchDTO dto) {
//         Student student = studentService.getStudentByReg(dto.getRegistrationNo());
//         if (student == null) return "Student not found";
//         attendanceService.markAttendance(student.getRegistrationNo(), student.getName());
//         return "Attendance marked for " + student.getName();
//     }

//     // ✅ Make this class public static
//     public static class FaceMatchDTO {
//         private String registrationNo;
//         private String capturedImage;

//         public String getRegistrationNo() { return registrationNo; }
//         public void setRegistrationNo(String registrationNo) { this.registrationNo = registrationNo; }

//         public String getCapturedImage() { return capturedImage; }
//         public void setCapturedImage(String capturedImage) { this.capturedImage = capturedImage; }
//     }
// }