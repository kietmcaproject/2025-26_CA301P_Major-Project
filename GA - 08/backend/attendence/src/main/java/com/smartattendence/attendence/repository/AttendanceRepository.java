package com.smartattendence.attendence.repository;

import com.smartattendence.attendence.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByRegistrationNoOrderByTimestampDesc(String registrationNo);
   @Query("SELECT a FROM Attendance a WHERE DATE(a.timestamp) = :date")
    List<Attendance> findByDate(@Param("date") LocalDate date);
}
