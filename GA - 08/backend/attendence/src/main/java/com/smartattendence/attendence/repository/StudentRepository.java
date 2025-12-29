package com.smartattendence.attendence.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.smartattendence.attendence.entity.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Student findByRegistrationNo(String registrationNo);
    void deleteByRegistrationNo(String registrationNo);
    boolean existsByRegistrationNo(String registrationNo);
}


// package com.smartattendence.attendence.repository;

// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// import com.smartattendence.attendence.entity.Student;

// @Repository
// public interface StudentRepository extends JpaRepository<Student, Long> {
//     Student findByRegistrationNo(String registrationNo);
// }
