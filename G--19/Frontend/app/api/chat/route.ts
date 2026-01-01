import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message: string = body?.message;
    const user = body?.user || null; // { role?: string, id?: string }

    if (!message) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    }

    // Role-aware AI response logic (simple rule-based, replaceable with real AI)
    const reply = generateAIResponse(message, user);

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ success: false, error: "Failed to process message" }, { status: 500 });
  }
}

// Role-aware AI response generator
function generateAIResponse(message: string, user: { role?: string; id?: string } | null): string {
  const lowerMessage = (message || "").toLowerCase();
  const role = user?.role || "guest";

  // Role-specific quick replies
  if (role === "donor") {
    if (lowerMessage.includes("where") && lowerMessage.includes("donate")) {
      return "You can donate at any certified blood center. To schedule, go to the 'Schedule Donation' section in your dashboard — enter your availability and preferred hospital.";
    }
    if (lowerMessage.includes("availability") || lowerMessage.includes("available")) {
      return "To mark yourself available, share your location and press 'Mark Available' on your dashboard. We'll notify nearby hospitals when you are available.";
    }
  }

  if (role === "recipient") {
    if (lowerMessage.includes("request") || lowerMessage.includes("need")) {
      return "To request blood, go to the hospital dashboard and create a new request. Include blood type, units needed, and urgency. Hospitals will notify donors nearby.";
    }
    if (lowerMessage.includes("status") || lowerMessage.includes("track")) {
      return "If you've submitted a request, check the Requests table under your hospital dashboard for updates. Hospitals update status once donors respond.";
    }
  }

  // General answers (works for all roles)
  if (lowerMessage.includes("blood type") || lowerMessage.includes("compatible")) {
    return "Blood compatibility depends on the ABO and Rh systems. O- is the universal donor, AB+ is the universal recipient. For specific compatibility, consult medical staff.";
  }

  if (lowerMessage.includes("donate") || lowerMessage.includes("donation")) {
    return "Whole blood can be donated every 56 days (8 weeks). Ensure you meet eligibility criteria and stay hydrated. Contact local centers for appointment details.";
  }

  if (lowerMessage.includes("health") || lowerMessage.includes("safe")) {
    return "Blood donation is safe when performed at licensed centers; donors are screened and procedures are followed to ensure safety.";
  }

  if (lowerMessage.includes("hi") || lowerMessage.includes("hello") || lowerMessage.includes("hey")) {
    return `Hello${role && role !== "guest" ? " " + role : ""}! I'm Pulse Bot. I can help with donation info, requests, scheduling, and your dashboard.`;
  }

  if (lowerMessage.includes("hospital") || lowerMessage.includes("service")) {
    return "Pulse Bank connects donors and recipients. Use the dashboards to create requests, mark availability, and schedule donations.";
  }

  // Fallback
  return "I can help with blood donation info, scheduling, requests and dashboard actions. Please ask a specific question or include your role (donor/recipient/hospital).";
}
