import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - nodemailer types are not included in this project
import nodemailer from "nodemailer";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, region, province, city, interest, details, chatSessionId } =
      await request.json();

    const supabase = createServerClient();

    const interestLabels: Record<string, string> = {
      // Products
      "ev-charging-station": "EV Charging Station",
      "solar-street-lights": "Solar Street Lights",
      "smart-home-ips": "Smart Home IPS",
      "cabinet-type-power-supply": "Power Supplies",
      "container-type-power-supply": "Container Type Power Supply",
      // Services - EV Charging
      "ev-charging-installation": "EV Charging Installation",
      "ev-charging-quote": "EV Charging Quote",
      "ac-charger-installation": "AC Charger Installation (7kW)",
      "dc-fast-charger-installation": "DC Fast Charger Installation (60-400kW)",
      // Services - Solar Installation
      "solar-energy-installation": "Solar Energy Installation",
      "solar-installation-quote": "Solar Installation Quote",
      "street-light-installation": "Street Light Installation",
      "solar-street-light-quote": "Solar Street Light Quote",
      "off-grid-power-generation": "Off-Grid Power Generation System",
      "energy-storage-installation": "Energy Storage Installation",
      // Sector-Specific
      "residential-solutions": "Residential Solutions",
      "commercial-solutions": "Commercial Solutions",
      "industrial-solutions": "Industrial Solutions",
      "rural-projects": "Rural Projects",
      // General
      "general-inquiry": "General Inquiry",
      "technical-support": "Technical Support",
      "maintenance-service": "Maintenance Service",
    };

    const interestLabel =
      interestLabels[interest as keyof typeof interestLabels] ?? "Inquiry";

    const subject = `${interestLabel} - ${firstName} ${lastName}`;

    const bodyLines = [
      "",
      "",
      details || "",
      "",
      `${firstName} ${lastName}`,
      phone ? `Phone Number: ${phone}` : "",
      email ? `Email Address: ${email}` : "",
      region ? `Region: ${region}` : "",
      province ? `Province: ${province}` : "",
      city ? `City: ${city}` : "",
    ].filter(Boolean);

    const body = bodyLines.join("\n");

    // Save to database first
    const { data: submission, error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        region: region || null,
        province: province || null,
        city: city || null,
        interest: interest,
        details: details || null,
        chat_session_id: chatSessionId || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error saving contact submission to database:", dbError);
      // Continue with email even if DB save fails
    }

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    try {
    await transporter.sendMail({
      // Gmail requires the authenticated account as the actual sender
      from: `"${firstName} ${lastName} via VoltHub" <${
        process.env.SMTP_FROM || process.env.SMTP_USER
      }>`,
      to: "admin-help@volthub-ev.com",
      subject,
      text: body,
      // This makes replies go directly to the email entered in the form
      replyTo: email || undefined,
    });

      // Update database to mark email as sent
      if (submission?.id) {
        const { error: emailUpdateError } = await supabase
          .from("contact_submissions")
          .update({
            email_sent: true,
            email_sent_at: new Date().toISOString(),
          })
          .eq("id", submission.id);

        if (emailUpdateError) {
          console.error("Error updating email_sent status:", emailUpdateError);
        }
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't fail the request if email fails, submission is already saved
    }

    // Update chat session with user's name if chatSessionId is provided
    // Do this outside the email try-catch so it always runs
    if (chatSessionId) {
      console.log("Updating chat session with name:", chatSessionId, firstName, lastName);
      
      // Update chat session
      const { data: sessionUpdateData, error: sessionUpdateError } = await supabase
        .from("chat_sessions")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("session_id", chatSessionId)
        .select();

      if (sessionUpdateError) {
        console.error("Error updating chat session with name:", sessionUpdateError);
        console.error("Session ID:", chatSessionId);
        console.error("Error details:", JSON.stringify(sessionUpdateError, null, 2));
      } else {
        console.log("Chat session updated successfully:", sessionUpdateData);
      }

      // Also update all messages in this session with the name
      const { data: messagesUpdateData, error: messagesUpdateError } = await supabase
        .from("chat_messages")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("session_id", chatSessionId)
        .is("first_name", null) // Only update messages that don't already have a name
        .select();

      if (messagesUpdateError) {
        console.error("Error updating chat messages with name:", messagesUpdateError);
        console.error("Session ID:", chatSessionId);
        console.error("Error details:", JSON.stringify(messagesUpdateError, null, 2));
      } else {
        console.log(`Updated ${messagesUpdateData?.length || 0} chat messages with name`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}