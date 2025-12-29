package com.smartattendence.attendence.controller;

import com.smartattendence.attendence.entity.Student;
import com.smartattendence.attendence.services.AttendanceService;
import com.smartattendence.attendence.services.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.util.*;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;
    @Autowired
    private AttendanceService attendanceService;


    private static final String BASE_FOLDER = "D:\\MCA\\III sem\\Major Project\\smart-attendance-system\\python\\registered_images";

    @PostMapping("/register")
    public Student register(@RequestBody StudentDTO dto) {
        Student existing = studentService.getStudentByReg(dto.getRegistrationNo());
        if (existing != null) {
            throw new RuntimeException("ALREADY_REGISTERED");
        }

        String folderName = generateFolderName(dto.getName(), dto.getRegistrationNo());
        File folder = new File(BASE_FOLDER, folderName);
        if (!folder.exists()) folder.mkdirs();

        try {
            int count = 1;
            for (ImageData img : dto.getImages()) {
                byte[] decodedBytes = Base64.getDecoder().decode(img.getData());
                File imageFile = new File(folder, "img" + count + ".jpg");
                try (FileOutputStream fos = new FileOutputStream(imageFile)) {
                    fos.write(decodedBytes);
                }
                count++;
            }
        } catch (IOException e) {
            throw new RuntimeException("Error saving images: " + e.getMessage());
        }

        Student s = new Student();
        s.setName(dto.getName());
        s.setEmail(dto.getEmail());
        s.setRegistrationNo(dto.getRegistrationNo());
        s.setPassword(dto.getPassword());
        s.setImagePath(folder.getAbsolutePath());

        Student saved = studentService.registerStudent(s);

        // ✅ Trigger model training asynchronously (non-blocking)
        triggerModelTrainingAsync();

        return saved;
    }

    // ✅ Asynchronous Python training
    // ✅ Asynchronous Python training
private void triggerModelTrainingAsync() {
    new Thread(() -> {
        try {
            String pythonExe = "python";
            String scriptPath = "D:\\MCA\\III sem\\Major Project\\smart-attendance-system\\python\\train_model.py";
            File workingDir = new File("D:\\MCA\\III sem\\Major Project\\smart-attendance-system\\python");

            ProcessBuilder pb = new ProcessBuilder(pythonExe, scriptPath);
            pb.directory(workingDir); // ✅ ensures correct working directory
            pb.redirectErrorStream(true);

            // ✅ Fix UnicodeEncodeError on Windows
            pb.environment().put("PYTHONIOENCODING", "utf-8");

            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), "UTF-8"))) {
                String line;
                System.out.println("\n🚀 [Async] Face Recognition Model Training Started...");
                System.out.println("==================================================");
                while ((line = reader.readLine()) != null) {
                    System.out.println(line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                System.out.println("✅ [Async] Training completed successfully!");
            } else {
                System.err.println("❌ [Async] Training script exited with code: " + exitCode);
            }

        } catch (Exception e) {
            System.err.println("⚠️ [Async] Error running train_model.py: " + e.getMessage());
            e.printStackTrace();
        }
    }).start(); // Runs in background thread
}


    @GetMapping("/{registrationNo}")
    public Student get(@PathVariable String registrationNo) {
        return studentService.getStudentByReg(registrationNo);
    }

    @GetMapping
    public List<Student> getAll() {
        return studentService.getAllStudents();
    }

    @PutMapping("/{registrationNo}")
    public Student update(@PathVariable String registrationNo, @RequestBody Student updated) {
        Student existing = studentService.getStudentByReg(registrationNo);
        if (existing == null) throw new RuntimeException("Student not found");

        String oldFolder = existing.getImagePath();
        if (!existing.getName().equals(updated.getName())) {
            String newFolderName = generateFolderName(updated.getName(), existing.getRegistrationNo());
            File oldDir = new File(oldFolder);
            File newDir = new File(BASE_FOLDER, newFolderName);
            if (oldDir.exists()) oldDir.renameTo(newDir);
            existing.setImagePath(newDir.getAbsolutePath());
        }

        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setPassword(updated.getPassword());

        return studentService.updateStudentByReg(registrationNo, existing);
    }

    @DeleteMapping("/{registrationNo}")
    public String delete(@PathVariable String registrationNo) {
    Student existing = studentService.getStudentByReg(registrationNo);
    if (existing == null) throw new RuntimeException("Student not found");

    // ✅ 1. Delete all attendance records for this student before deleting student
    try {
        attendanceService.deleteAttendanceByReg(registrationNo);
        System.out.println("🗑️ All attendance records deleted for student " + registrationNo);
    } catch (Exception e) {
        System.err.println("⚠️ Error deleting attendance records for " + registrationNo + ": " + e.getMessage());
    }

    // ✅ 2. Delete image folder
    File folder = new File(existing.getImagePath());
    if (folder.exists()) deleteFolder(folder);

    // ✅ 3. Delete student from DB
    studentService.deleteStudentByReg(registrationNo);
    return "Student and related attendance deleted successfully!";
    }


    private void deleteFolder(File folder) {
        File[] files = folder.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) deleteFolder(file);
                else file.delete();
            }
        }
        folder.delete();
    }

    private String generateFolderName(String name, String regNo) {
        String digits = regNo.replaceAll("\\D", "");
        String padded = String.format("%04d", Integer.parseInt(digits.isEmpty() ? "0" : digits));
        return name.replaceAll("\\s+", "_") + padded;
    }
}

// ✅ DTO Classes (inner classes for simplicity)
class StudentDTO {
    private String name;
    private String email;
    private String registrationNo;
    private String password;
    private List<ImageData> images;

    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRegistrationNo() { return registrationNo; }
    public String getPassword() { return password; }
    public List<ImageData> getImages() { return images; }
}

class ImageData {
    private String data;
    public String getData() { return data; }
}


// package com.smartattendence.attendence.controller;

// import com.smartattendence.attendence.entity.Student;
// import com.smartattendence.attendence.services.StudentService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.*;
// import java.io.File;
// import java.io.FileOutputStream;
// import java.io.IOException;
// import java.util.Base64;
// import java.util.List;

// @RestController
// @RequestMapping("/api/students")
// @CrossOrigin(origins = "*")
// public class StudentController {

//     @Autowired
//     private StudentService studentService;

//     private static final String BASE_FOLDER = "D:\\MCA\\III sem\\Major Project\\smart-attendance-system\\python\\registered_images";

//     @PostMapping("/register")
//     public Student register(@RequestBody StudentDTO dto) {
//         Student existing = studentService.getStudentByReg(dto.getRegistrationNo());
//         if (existing != null) {
//             throw new RuntimeException("ALREADY_REGISTERED");
//         }

//         String folderName = generateFolderName(dto.getName(), dto.getRegistrationNo());
//         File folder = new File(BASE_FOLDER, folderName);
//         if (!folder.exists()) folder.mkdirs();

//         try {
//             int count = 1;
//             for (ImageData img : dto.getImages()) {
//                 byte[] decodedBytes = Base64.getDecoder().decode(img.getData());
//                 File imageFile = new File(folder, dto.getName().replaceAll("\\s+", "_") + count + ".jpg");
//                 try (FileOutputStream fos = new FileOutputStream(imageFile)) {
//                     fos.write(decodedBytes);
//                 }
//                 count++;
//             }
//         } catch (IOException e) {
//             throw new RuntimeException("Error saving images: " + e.getMessage());
//         }

//         Student s = new Student();
//         s.setName(dto.getName());
//         s.setEmail(dto.getEmail());
//         s.setRegistrationNo(dto.getRegistrationNo());
//         s.setPassword(dto.getPassword());
//         s.setImagePath(folder.getAbsolutePath());

//         return studentService.registerStudent(s);
//     }

//     @GetMapping("/{registrationNo}")
//     public Student get(@PathVariable String registrationNo) {
//         return studentService.getStudentByReg(registrationNo);
//     }

//     @GetMapping
//     public List<Student> getAll() {
//         return studentService.getAllStudents();
//     }

//     @PutMapping("/{registrationNo}")
//     public Student update(@PathVariable String registrationNo, @RequestBody Student updated) {
//         Student existing = studentService.getStudentByReg(registrationNo);
//         if (existing == null) throw new RuntimeException("Student not found");

//         String oldFolder = existing.getImagePath();
//         if (!existing.getName().equals(updated.getName())) {
//             String newFolderName = generateFolderName(updated.getName(), existing.getRegistrationNo());
//             File oldDir = new File(oldFolder);
//             File newDir = new File(BASE_FOLDER, newFolderName);
//             if (oldDir.exists()) oldDir.renameTo(newDir);
//             existing.setImagePath(newDir.getAbsolutePath());
//         }

//         existing.setName(updated.getName());
//         existing.setEmail(updated.getEmail());
//         existing.setPassword(updated.getPassword());

//         return studentService.updateStudentByReg(registrationNo, existing);
//     }

//     @DeleteMapping("/{registrationNo}")
//     public String delete(@PathVariable String registrationNo) {
//         Student existing = studentService.getStudentByReg(registrationNo);
//         if (existing == null) throw new RuntimeException("Student not found");

//         File folder = new File(existing.getImagePath());
//         if (folder.exists()) deleteFolder(folder);

//         studentService.deleteStudentByReg(registrationNo);
//         return "Student deleted successfully!";
//     }

//     private void deleteFolder(File folder) {
//         File[] files = folder.listFiles();
//         if (files != null) {
//             for (File file : files) {
//                 if (file.isDirectory()) deleteFolder(file);
//                 else file.delete();
//             }
//         }
//         folder.delete();
//     }

//     private String generateFolderName(String name, String regNo) {
//         String digits = regNo.replaceAll("\\D", "");
//         String padded = String.format("%04d", Integer.parseInt(digits.isEmpty() ? "0" : digits));
//         return name.replaceAll("\\s+", "_") + padded;
//     }
// }

// class StudentDTO {
//     private String name;
//     private String email;
//     private String registrationNo;
//     private String password;
//     private List<ImageData> images;

//     public String getName() { return name; }
//     public String getEmail() { return email; }
//     public String getRegistrationNo() { return registrationNo; }
//     public String getPassword() { return password; }
//     public List<ImageData> getImages() { return images; }
// }

// class ImageData {
//     private String data;
//     public String getData() { return data; }
// }


// package com.smartattendence.attendence.controller;

// import com.smartattendence.attendence.entity.Student;
// import com.smartattendence.attendence.services.StudentService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.*;

// import java.io.File;
// import java.io.FileOutputStream;
// import java.io.IOException;
// import java.util.Base64;
// import java.util.List;

// @RestController
// @RequestMapping("/api/students")
// @CrossOrigin(origins = "*")
// public class StudentController {

//     @Autowired
//     private StudentService studentService;

//     private static final String BASE_FOLDER = "D:\\MCA\\III sem\\Major Project\\smart-attendance-system\\python\\registered_images";

//     @PostMapping("/register")
//     public Student register(@RequestBody StudentDTO dto) {
//         Student existing = studentService.getStudentByReg(dto.getRegistrationNo());
//         if (existing != null) {
//             throw new RuntimeException("ALREADY_REGISTERED");
//         }

//         String folderName = generateFolderName(dto.getName(), dto.getRegistrationNo());
//         File folder = new File(BASE_FOLDER, folderName);
//         if (!folder.exists()) folder.mkdirs();

//         try {
//             int count = 1;
//             for (ImageData img : dto.getImages()) {
//                 byte[] decodedBytes = Base64.getDecoder().decode(img.getData());
//                 File imageFile = new File(folder, dto.getName().replaceAll("\\s+", "_") + count + ".jpg");
//                 try (FileOutputStream fos = new FileOutputStream(imageFile)) {
//                     fos.write(decodedBytes);
//                 }
//                 count++;
//             }
//         } catch (IOException e) {
//             throw new RuntimeException("Error saving images: " + e.getMessage());
//         }

//         Student s = new Student();
//         s.setName(dto.getName());
//         s.setEmail(dto.getEmail());
//         s.setRegistrationNo(dto.getRegistrationNo());
//         s.setPassword(dto.getPassword());
//         s.setImagePath(folder.getAbsolutePath());

//         return studentService.registerStudent(s);
//     }

//     @GetMapping("/{registrationNo}")
//     public Student get(@PathVariable String registrationNo) {
//         return studentService.getStudentByReg(registrationNo);
//     }

//     private String generateFolderName(String name, String regNo) {
//         String digits = regNo.replaceAll("\\D", "");
//         String padded = String.format("%04d", Integer.parseInt(digits.isEmpty() ? "0" : digits));
//         return name.replaceAll("\\s+", "_") + padded;
//     }
//     @GetMapping
//     public List<Student> getAll() {
//         return studentService.getAllStudents();
//     }

//     @PutMapping("/{id}")
//     public Student update(@PathVariable Long id, @RequestBody Student student) {
//         return studentService.updateStudent(id, student);
//     }

//     @DeleteMapping("/{id}")
//     public String delete(@PathVariable Long id) {
//         studentService.deleteStudent(id);
//         return "Student deleted successfully!";
//     }
// }

// class StudentDTO {
//     private String name;
//     private String email;
//     private String registrationNo;
//     private String password;
//     private List<ImageData> images;

//     public String getName() { return name; }
//     public String getEmail() { return email; }
//     public String getRegistrationNo() { return registrationNo; }
//     public String getPassword() { return password; }
//     public List<ImageData> getImages() { return images; }
// }

// class ImageData {
//     private String fileName;
//     private String data;

//     public String getFileName() { return fileName; }
//     public String getData() { return data; }
// }


// package com.smartattendence.attendence.controller;

// import com.smartattendence.attendence.entity.Student;
// import com.smartattendence.attendence.services.StudentService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.*;

// import java.io.File;
// import java.io.FileOutputStream;
// import java.io.IOException;
// import java.util.Base64;

// @RestController
// @RequestMapping("/api/students")
// @CrossOrigin(origins = "*")
// public class StudentController {

//     @Autowired
//     private StudentService studentService;

//     private static final String IMAGE_FOLDER = "D:\\MCA\\III sem\\Major Project\\smart-attendance-system\\python\\registered_image";

//     @PostMapping("/register")
//     public Student register(@RequestBody StudentDTO dto) {
//         Student s = new Student();
//         s.setName(dto.getName());
//         s.setEmail(dto.getEmail());
//         s.setRegistrationNo(dto.getRegistrationNo());
//         s.setPassword(dto.getPassword());

//         if (dto.getImage() != null && !dto.getImage().isEmpty()) {
//             try {
//                 String uniqueName = generateUniqueName(dto.getName(), dto.getRegistrationNo());
//                 String imagePath = saveImageToFolder(dto.getImage(), uniqueName);
//                 s.setImagePath(imagePath);
//             } catch (IOException e) {
//                 throw new RuntimeException("Error saving image: " + e.getMessage());
//             }
//         }

//         return studentService.registerStudent(s);
//     }

//     @GetMapping("/{registrationNo}")
//     public Student get(@PathVariable String registrationNo) {
//         return studentService.getStudentByReg(registrationNo);
//     }

//     private String generateUniqueName(String name, String regNo) {
//         // Pad registration number to at least 4 digits
//         String padded = String.format("%04d", Integer.parseInt(regNo.replaceAll("\\D", "")));
//         String last4 = padded.substring(padded.length() - 4);
//         return name.replaceAll("\\s+", "_") + last4;
//     }

//     private String saveImageToFolder(String base64Image, String uniqueName) throws IOException {
//         byte[] decodedBytes = Base64.getDecoder().decode(base64Image);
//         File dir = new File(IMAGE_FOLDER);
//         if (!dir.exists()) dir.mkdirs();

//         String filePath = IMAGE_FOLDER + File.separator + uniqueName + ".png";
//         try (FileOutputStream fos = new FileOutputStream(filePath)) {
//             fos.write(decodedBytes);
//         }
//         return filePath;
//     }
// }

// class StudentDTO {
//     private String name;
//     private String email;
//     private String registrationNo;
//     private String password;
//     private String image;

//     public String getName() { return name; }
//     public String getEmail() { return email; }
//     public String getRegistrationNo() { return registrationNo; }
//     public String getPassword() { return password; }
//     public String getImage() { return image; }
// }
