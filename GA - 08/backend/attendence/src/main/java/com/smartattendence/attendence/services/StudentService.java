package com.smartattendence.attendence.services;

import com.smartattendence.attendence.entity.Student;
import com.smartattendence.attendence.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StudentService {

    @Autowired
    private StudentRepository repository;

    public Student registerStudent(Student student) {
        if (repository.existsByRegistrationNo(student.getRegistrationNo())) {
            throw new RuntimeException("Student already registered");
        }
        return repository.save(student);
    }

    public Student getStudentByReg(String regNo) {
        return repository.findByRegistrationNo(regNo);
    }

    public List<Student> getAllStudents() {
        return repository.findAll();
    }

    public Student updateStudentByReg(String regNo, Student updatedData) {
        Student student = repository.findByRegistrationNo(regNo);
        if (student != null) {
            student.setName(updatedData.getName());
            student.setEmail(updatedData.getEmail());
            student.setPassword(updatedData.getPassword());
            student.setImagePath(updatedData.getImagePath());
            return repository.save(student);
        }
        throw new RuntimeException("Student not found with Registration No: " + regNo);
    }

    public void deleteStudentByReg(String regNo) {
        Student student = repository.findByRegistrationNo(regNo);
        if (student == null) {
            throw new RuntimeException("Student not found with Registration No: " + regNo);
        }
        repository.delete(student); // ensures permanent deletion
    }
}

// package com.smartattendence.attendence.services;

// import com.smartattendence.attendence.entity.Student;
// import com.smartattendence.attendence.repository.StudentRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import java.util.List;

// @Service
// public class StudentService {

//     @Autowired
//     private StudentRepository repository;

//     public Student registerStudent(Student student) {
//         if (repository.existsByRegistrationNo(student.getRegistrationNo())) {
//             throw new RuntimeException("Student already registered");
//         }
//         return repository.save(student);
//     }

//     public Student getStudentByReg(String regNo) {
//         return repository.findByRegistrationNo(regNo);
//     }

//     public List<Student> getAllStudents() {
//         return repository.findAll();
//     }

//     public Student updateStudentByReg(String regNo, Student updatedData) {
//         Student student = repository.findByRegistrationNo(regNo);
//         if (student != null) {
//             student.setName(updatedData.getName());
//             student.setEmail(updatedData.getEmail());
//             student.setPassword(updatedData.getPassword());
//             student.setImagePath(updatedData.getImagePath());
//             return repository.save(student);
//         }
//         throw new RuntimeException("Student not found with Registration No: " + regNo);
//     }

//     public void deleteStudentByReg(String regNo) {
//         if (!repository.existsByRegistrationNo(regNo)) {
//             throw new RuntimeException("Student not found with Registration No: " + regNo);
//         }
//         repository.deleteByRegistrationNo(regNo);
//     }
// }

// package com.smartattendence.attendence.services;

// import com.smartattendence.attendence.entity.Student;
// import com.smartattendence.attendence.repository.StudentRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import java.util.List;

// @Service
// public class StudentService {
//     @Autowired
//     private StudentRepository repository;
    
//     public Student registerStudent(Student student) { return repository.save(student);}
//     public Student getStudentByReg(String regNo) { return repository.findByRegistrationNo(regNo); }
//     public List<Student> getAllStudents() {
//         return repository.findAll();
//     }

//     public Student updateStudent(Long id, Student newData) {
//         Student student = repository.findById(id).orElse(null);
//         if (student != null) {
//             student.setName(newData.getName());
//             student.setRegistrationNo(newData.getRegistrationNo());
//             student.setEmail(newData.getEmail());
//             // student.setImage(newData.getImage());
//             repository.save(student);
//         }
//         return student;
//     }

//     public void deleteStudent(Long id) {
//         repository.deleteById(id);
//     }
// }
