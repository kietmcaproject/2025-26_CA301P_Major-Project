// routes/hospital.js
import express from "express";
import User from "../models/User.js";
import DonationSchedule from "../models/DonationSchedule.js";

const router = express.Router();

/* ---------------------------------------------------------
   0️⃣ GET ALL HOSPITALS
----------------------------------------------------------*/
router.get("/all", async (req, res) => {
  try {
    const hospitals = await User.find(
      { role: "hospital" },
      "fullName phone location address"
    ).lean();

    console.log(`Found ${hospitals.length} hospitals in database`);

    // Filter hospitals that have valid locations only
    const hospitalsWithValidLocation = hospitals.filter(h => 
      h.location && h.location.latitude && h.location.longitude
    );

    console.log(`Hospitals with valid locations: ${hospitalsWithValidLocation.length}`);
    
    // Log hospitals without locations
    const hospitalsWithoutLocation = hospitals.filter(h => 
      !h.location || !h.location.latitude || !h.location.longitude
    );
    if (hospitalsWithoutLocation.length > 0) {
      console.warn(`${hospitalsWithoutLocation.length} hospitals without valid locations:`, 
        hospitalsWithoutLocation.map(h => h.fullName)
      );
    }

    const formatted = hospitalsWithValidLocation.map((hospital) => ({
      id: hospital._id,
      hospitalName: hospital.fullName || "Hospital",
      phone: hospital.phone || "N/A",
      location: {
        latitude: hospital.location.latitude,
        longitude: hospital.location.longitude,
        address: hospital.address || "Address not provided"
      },
      address: hospital.address || "Address not provided",
    }));

    res.json({ 
      success: true, 
      hospitals: formatted,
      count: formatted.length 
    });

  } catch (err) {
    console.error("Error fetching hospitals:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
});

/* ---------------------------------------------------------
   1️⃣ REAL HOSPITAL STATS (ACTIVE DONORS + AVG MATCH TIME)
----------------------------------------------------------*/
router.get("/stats", async (req, res) => {
  try {
    const activeDonors = await User.find({ available: true });

    res.json({
      success: true,
      donorsNearby: activeDonors.length,
      avgMatchTime: activeDonors.length > 0 ? 3 : 0,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------------------
   2️⃣ GET ACTIVE DONORS (FOR MAP)
----------------------------------------------------------*/
router.get("/active-donors", async (req, res) => {
  try {
    const donors = await User.find(
      { available: true, "location.latitude": { $exists: true } },
      "fullName bloodType location"
    );

    res.json({ success: true, donors });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------------------
   3️⃣ GET SCHEDULES FOR SPECIFIC HOSPITAL
----------------------------------------------------------*/
router.get("/schedules/:hospitalName", async (req, res) => {
  try {
    const hospitalName = req.params.hospitalName;

    const schedules = await DonationSchedule.find()
      .populate("donorId", "fullName email")
      .populate("requestId");

    const filtered = schedules.filter(
      (s) => s.requestId?.hospital === hospitalName
    );

    const formatted = filtered.map((s) => ({
      _id: s._id,
      donorName: s.donorId?.fullName,
      contact: s.contact,
      date: s.date,
      time: s.time,
      notes: s.notes,
      status: s.status,
      bloodType: s.requestId?.bloodType,
      unitsNeeded: s.requestId?.unitsNeeded,
    }));

    res.json({ success: true, schedules: formatted });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------------------
   4️⃣ SEED TEST HOSPITALS (FOR DEVELOPMENT)
----------------------------------------------------------*/
router.post("/seed-hospitals", async (req, res) => {
  try {
    // Check if hospitals already exist
    const existingHospitals = await User.find({ role: "hospital" });
    if (existingHospitals.length > 0) {
      return res.json({ 
        success: true, 
        message: `${existingHospitals.length} hospitals already exist in database` 
      });
    }

    const testHospitals = [
      {
        fullName: "Apollo Hospital Nagpur",
        email: "apollo.nagpur@example.com",
        password: "password123",
        phone: "+91 7122-234567",
        role: "hospital",
        location: {
          latitude: 21.1489,
          longitude: 79.0873
        },
        address: "Ramdaspeth, Nagpur 440010"
      },
      {
        fullName: "Care Hospital Nagpur",
        email: "care.nagpur@example.com",
        password: "password123",
        phone: "+91 7122-445678",
        role: "hospital",
        location: {
          latitude: 21.1520,
          longitude: 79.0940
        },
        address: "Sitabuldi, Nagpur 440013"
      },
      {
        fullName: "Ruby Hall Clinic",
        email: "ruby.nagpur@example.com",
        password: "password123",
        phone: "+91 7122-556789",
        role: "hospital",
        location: {
          latitude: 21.1410,
          longitude: 79.0810
        },
        address: "Lakhanpal, Nagpur 440009"
      },
      {
        fullName: "Government Medical College Hospital",
        email: "gmch.nagpur@example.com",
        password: "password123",
        phone: "+91 7122-667890",
        role: "hospital",
        location: {
          latitude: 21.1460,
          longitude: 79.0920
        },
        address: "Mahal Road, Nagpur 440009"
      }
    ];

    const created = await User.insertMany(testHospitals);
    res.json({ 
      success: true, 
      message: `Created ${created.length} test hospitals`,
      hospitals: created.map(h => ({ id: h._id, name: h.fullName }))
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------------------
   RESET HOSPITALS (DELETE OLD AND CREATE NEW)
----------------------------------------------------------*/
router.post("/reset-hospitals", async (req, res) => {
  try {
    // Delete all existing hospitals
    const deleted = await User.deleteMany({ role: "hospital" });
    console.log(`Deleted ${deleted.deletedCount} hospitals`);

    // Create new hospitals with proper locations
    const testHospitals = [
      {
        fullName: "Apollo Hospital Nagpur",
        email: "apollo.nagpur@example.com",
        password: "password123",
        phone: "+91 7122-234567",
        role: "hospital",
        location: {
          latitude: 21.1489,
          longitude: 79.0873
        },
        address: "Ramdaspeth, Nagpur 440010"
      },
      {
        fullName: "Care Hospital Nagpur",
        email: "care.nagpur@example.com",
        password: "password123",
        phone: "+91 7122-445678",
        role: "hospital",
        location: {
          latitude: 21.1520,
          longitude: 79.0940
        },
        address: "Sitabuldi, Nagpur 440013"
      },
      {
        fullName: "Ruby Hall Clinic",
        email: "ruby.nagpur@example.com",
        password: "password123",
        phone: "+91 7122-556789",
        role: "hospital",
        location: {
          latitude: 21.1410,
          longitude: 79.0810
        },
        address: "Lakhanpal, Nagpur 440009"
      },
      {
        fullName: "Government Medical College Hospital",
        email: "gmch.nagpur@example.com",
        password: "password123",
        phone: "+91 7122-667890",
        role: "hospital",
        location: {
          latitude: 21.1460,
          longitude: 79.0920
        },
        address: "Mahal Road, Nagpur 440009"
      }
    ];

    const created = await User.insertMany(testHospitals);
    res.json({ 
      success: true, 
      message: `Reset complete: Deleted ${deleted.deletedCount}, Created ${created.length} new hospitals`,
      hospitals: created.map(h => ({ 
        id: h._id, 
        name: h.fullName,
        location: h.location
      }))
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ---------------------------------------------------------
   5️⃣ UPDATE HOSPITAL LOCATION
----------------------------------------------------------*/
router.post("/update-location", async (req, res) => {
  try {
    const { hospitalId, latitude, longitude, address } = req.body;

    if (!hospitalId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "hospitalId, latitude, and longitude are required" 
      });
    }

    // Log the incoming ID for debugging
    console.log(`Attempting to update location for hospital ID: ${hospitalId}`);

    const updated = await User.findByIdAndUpdate(
      hospitalId,
      {
        location: { latitude, longitude },
        address: address || undefined
      },
      { new: true }
    );

    if (!updated) {
      console.error(`Hospital not found with ID: ${hospitalId}`);
      return res.status(404).json({ 
        success: false, 
        message: "Hospital not found. Please log in again." 
      });
    }

    console.log(`Hospital location updated: ${updated.fullName} - Lat: ${latitude}, Lon: ${longitude}`);

    res.json({ 
      success: true, 
      message: "Hospital location updated successfully",
      hospital: {
        id: updated._id,
        name: updated.fullName,
        location: updated.location
      }
    });

  } catch (err) {
    console.error("Error updating hospital location:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
