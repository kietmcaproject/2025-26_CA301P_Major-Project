package com.smartattendence.attendence;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.IOException;

@SpringBootApplication
public class AttendenceApplication {

	public static void main(String[] args) {
		startFlaskServer();
		SpringApplication.run(AttendenceApplication.class, args);
	}

	private static void startFlaskServer() {
		try {
			ProcessBuilder pb = new ProcessBuilder(
				"python",
				"D:\\MCA\\III sem\\Major Project\\smart-attendance-system\\python\\attendance_api.py"
			);
			pb.inheritIO(); // show Flask logs in same console
			pb.start();
			System.out.println("✅ Flask server started successfully on port 5000");
		} catch (IOException e) {
			System.out.println("❌ Failed to start Flask server: " + e.getMessage());
		}
	}
}


// package com.smartattendence.attendence;

// import org.springframework.boot.SpringApplication;
// import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication
// public class AttendenceApplication {

// 	public static void main(String[] args) {
// 		SpringApplication.run(AttendenceApplication.class, args);
// 	}

// }
