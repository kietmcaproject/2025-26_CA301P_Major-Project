import java.util.*;

public class Main {
     public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String time = sc.nextLine().trim();
        sc.close();

        System.out.println(convertTo24Hour(time));
    }

    public static String convertTo24Hour(String time) {
        // Extract AM/PM
        String amPm = time.substring(time.length() - 2);
        // Extract main time part
        String timePart = time.substring(0, time.length() - 2);
        String[] parts = timePart.split(":");

        int hour = Integer.parseInt(parts[0]);
        int minute = Integer.parseInt(parts[1]);
        int second = Integer.parseInt(parts[2]);

        if (amPm.equalsIgnoreCase("AM")) {
            if (hour == 12) {
                hour = 0; // midnight case
            }
        } else { // PM case
            if (hour != 12) {
                hour += 12;
            }
        }

        // Format into HH:MM:SS
        return String.format("%02d:%02d:%02d", hour, minute, second);
    }
}