import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Ensure the Gemini API Client is initialized only if the key is available
// and use the required 'aistudio-build' User-Agent for standard telemetry.
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, patientContext, prompt, additionalData } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Missing required parameter: action" },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    // Compile comprehensive patient background context for the model
    const patientDetailsPrompt = `
PATIENT PROFILE:
- ID: ${patientContext?.id || "N/A"}
- Name: ${patientContext?.name || "N/A"}
- Age: ${patientContext?.age || "N/A"}
- Gender: ${patientContext?.gender || "N/A"}
- Blood Group: ${patientContext?.bloodGroup || "N/A"}
- Allergy Status: ${patientContext?.allergyStatus || "N/A"}
- Medical Alerts: ${patientContext?.medicalAlerts?.join(", ") || "None"}
- Primary Doctor/Operator: ${patientContext?.primaryDoctor || "Dr. Ahmed"}
- Current Treatment Plan: ${patientContext?.currentTreatment || "N/A"}

CLINICAL BACKGROUND:
- Medical History: ${patientContext?.medicalHistory || "None logged"}
- Medications: ${patientContext?.medications || "None logged"}
- Chief Complaint: ${patientContext?.chiefComplaint || "N/A"}
- Previous Dental Treatment: ${patientContext?.prevDentalTreatment || "N/A"}
- Previous Prosthodontic treatment: ${patientContext?.prevProsthodonticTreatment || "N/A"}
- Implant History: ${patientContext?.implantHistory || "N/A"}
- Oral Hygiene Status: ${patientContext?.oralHygieneAssessment || "Moderate"}
- Caries Risk: ${patientContext?.cariesRisk || "Low"}
- Periodontal Status: ${patientContext?.periodontalStatus || "Healthy"}
- Occlusion Notes: ${patientContext?.occlusionNotes || "N/A"}

ACTIVE CLINICAL DATABASE:
- Soap Clinical Notes: ${JSON.stringify(patientContext?.clinicalNotesList || [])}
- Active Treatment Options: ${JSON.stringify(patientContext?.treatmentPlans || [])}
- Active CBCT & Restorative STL Files: ${JSON.stringify(patientContext?.uploadedFiles || [])}
`;

    let systemInstruction = "";
    let finalPrompt = "";

    switch (action) {
      case "copilot":
        systemInstruction = `You are a high-end Digital Dentistry and Clinical Prosthodontics AI Decision Support System. 
You are advising the primary dentist, providing evidence-based guidance.
Always be clinically professional, extremely accurate, objective, and reference dental terminology (e.g., tooth numbering systems, specific implant surgical guides, custom abutment parameters, occlusion schemes like canine guidance vs group function, and materials like Zirconia, E.max, Titanium, PMMA).
Format your response using pristine Markdown with clear headings and bullet points.`;
        
        finalPrompt = `
${patientDetailsPrompt}

USER QUERY FOR CLINICAL ASSISTANCE:
"${prompt}"

Please analyze the query in the context of this patient's digital dental record. Provide safe, precise, actionable, and HIPAA-compliant recommendations.`;
        break;

      case "soap":
        const soapMode = additionalData?.mode || "create"; // create, rewrite, expand, summarize, formatting
        systemInstruction = `You are an expert Clinical Scribe specializing in Prosthodontics, Fixed/Removable Prosthesis, and Implant Dentistry. 
Your goal is to output, edit, or formatting high-fidelity SOAP (Subjective, Objective, Assessment, Plan) dental clinical notes.
Ensure notes are extremely detailed, using professional dental vocabulary (e.g., torque values in Ncm, margins, subgingival/supragingival placement, gingival retraction, tissue health, occlusal paper marks, scan status in STL/CBCT, anesthesia type and dosages).
Always present the output in standard SOAP section blocks:
### SUBJECTIVE
[Detailed patient symptoms, concerns, feedback, pain scales, or history]
### OBJECTIVE
[Clinical observations, radiographic findings, bone density, measurements, materials used, anesthetic administered, tooth numbers]
### ASSESSMENT
[Clinical diagnosis, healing progress, implant stability, crown fitting assessment]
### PLAN
[Next procedural steps, laboratory prescriptions, home care, and next appointment schedule]`;

        if (soapMode === "create") {
          finalPrompt = `
${patientDetailsPrompt}

Create a comprehensive clinical SOAP note based on this quick input or procedure description:
"${prompt}"

Structure it perfectly. Make realistic dental assumptions where necessary to make it a bulletproof medical record.`;
        } else {
          finalPrompt = `
${patientDetailsPrompt}

You are requested to perform a "${soapMode.toUpperCase()}" operation on the following existing draft SOAP fields:
- Subjective Draft: "${additionalData?.subjective || ""}"
- Objective Draft: "${additionalData?.objective || ""}"
- Assessment Draft: "${additionalData?.assessment || ""}"
- Plan Draft: "${additionalData?.plan || ""}"

Instruction: ${prompt || "Improve the draft SOAP note."}
Return the refined note structured in standard SOAP format.`;
        }
        break;

      case "treatment_plan":
        systemInstruction = `You are an expert Dental Treatment Coordinator and Prosthodontist.
Your task is to generate a comprehensive, structured treatment plan proposal based on the patient's clinical conditions, chief complaint, medical/periodontal risks, and dental history.
You must provide multiple treatment options:
1. Option A (Ideal/Premium treatment - e.g., Implant-retained bridge, CAD/CAM crowns, high-end restorations).
2. Option B (Conservative/Alternative treatment - e.g., conventional fixed bridge, resin-bonded, or partial coverage).
3. Option C (Maintenance/Removable or minimal treatment - if appropriate).

For each option, outline:
- Description & Procedures (with ADA dental codes if helpful, e.g. D6010, D6058)
- Advantages & Biocompatibility
- Clinical Risks & Potential Mechanical/Biological Failures
- Estimated Timeline & Appointment Count
- Recommended Restorative Materials (e.g., Zirconia vs Lithium Disilicate vs Titanium)

Include a "Clinical Guidance & Final Recommendation" section at the end explaining which option fits this patient's systemic and structural profile best.`;

        finalPrompt = `
${patientDetailsPrompt}

Generate a comprehensive treatment plan proposal for the patient's condition. Chief complaint or focus area: "${prompt || "Full arch prosthodontics rehabilitation"}".`;
        break;

      case "clinical_summary":
        systemInstruction = `You are a Lead Clinical Director. 
Generate a comprehensive, executive Patient Clinical Summary for handover or referral.
Synthesize the electronic health records into a clean, unified dashboard summary.
You must structure the output under these exact sections:
### 1. CLINICAL PROFILE & ANAMNESIS
[Age, gender, primary conditions, active medications, critical medical alerts]
### 2. DENTAL HISTORY & DIAGNOSIS
[Chief complaint, previous restorations, periodontal status, and dental chart findings]
### 3. ACTIVE TREATMENT COURSE
[Current procedure progress, stage of restoration, CAD/CAM in-house mill status, lab items]
### 4. KEY CBCT & STL RADIOGRAPH FINDINGS
[Radiograph assessments, bone density, STL digital articulations]
### 5. CRITICAL RISKS & WARNINGS
[Systemic alerts, mechanical occlusion dangers, implant failure risk vectors]
### 6. PENDING PROCEDURES & SCHEDULING
[Next appointments, recalls, and upcoming laboratory milling requirements]`;

        finalPrompt = `
${patientDetailsPrompt}

Generate the complete Patient Clinical Summary based on all active parameters in the database. Ensure zero mock data and reflect real medical alerts or history.`;
        break;

      case "patient_education":
        systemInstruction = `You are a compassionate, clear Patient Advocate and Educator in a high-end dental clinic.
Your job is to translate complex clinical dental diagnoses, prosthodontics terminology, and surgical treatment plans into warm, clear, jargon-free patient-friendly explanations.
Use simple, clear analogies (e.g., comparing bone osseointegration to a tree rooting or a house foundation, comparing zirconia crowns to protective armor).
Maintain a highly encouraging, informative, reassuring, and gentle tone.
Structure the explanation with:
- **What is happening**: A simple, clear explanation of their dental situation.
- **The proposed solution**: Why this plan is recommended and how it helps them eat, smile, and live better.
- **What to expect**: Step-by-step description of the procedure in a comfortable, non-scary way.
- **Caring for your restoration**: Simple hygiene tips and maintenance.`;

        finalPrompt = `
${patientDetailsPrompt}

Topic to explain to the patient: "${prompt || "Proposed dental implants and zirconia crowns"}".`;
        break;


      case "progress_notes":
        systemInstruction = `You are an expert Clinical Scribe. Your goal is to write a concise Progress Note summarizing the patient's recent appointments, ongoing treatments, and overall trajectory. Maintain a professional tone, focusing on clinical outcomes, unresolved issues, and the timeline of care.`;
        finalPrompt = `
${patientDetailsPrompt}

Generate a concise clinical progress note summarizing the recent visits and treatment status based on the patient record.`;
        break;

      case "clinical_findings":
        systemInstruction = `You are a Lead Diagnostician. Your task is to extract and summarize ONLY the objective clinical findings (radiographic, periodontal, hard/soft tissue, occlusal) from the patient's record. Exclude subjective complaints or planned treatments. Present the findings in a clear, bulleted list.`;
        finalPrompt = `
${patientDetailsPrompt}

Summarize the objective clinical findings for this patient.`;
        break;

      case "referral_letter":
        systemInstruction = `You are a referring Dentist writing a formal Referral Letter to a specialist (e.g., Oral Surgeon, Endodontist, Periodontist).
Use a highly professional, respectful tone.
Structure the letter with:
- Patient Introduction (Name, Age)
- Reason for Referral (Chief Complaint / Diagnosis)
- Relevant Medical/Dental History (including alerts and medications)
- Summary of Findings (radiographs, clinical exam)
- Requested Action / Treatment from the specialist.
Sign off as the referring provider.`;
        finalPrompt = `
${patientDetailsPrompt}

Write a formal referral letter to a specialist regarding this patient. Context: "${prompt}"`;
        break;

      case "lab_prescription":
        systemInstruction = `You are an expert Prosthodontist writing a detailed Laboratory Prescription (Lab Rx).
Your instructions must be crystal clear to the dental technician to avoid remakes.
Include:
- Restoration Type & Teeth Numbers
- Material Selection (e.g., Monolithic Zirconia, e.max, PFM, PMMA)
- Shade (Vita shade, stump shade, incisal translucency details)
- Margin Design & Contacts (e.g., heavy/light contacts, supragingival/subgingival margins)
- Pontic Design (if applicable)
- Implant details (platform size, custom vs ti-base, screw vs cement retained)
- Enclosed items (e.g., impression, bite registration, opposing model)
- Due Date / Delivery Date request.`;
        finalPrompt = `
${patientDetailsPrompt}

Draft a detailed Dental Laboratory Prescription for this patient based on this context: "${prompt}"`;
        break;

      case "follow_up":
        systemInstruction = `You are an AI Clinical Assistant. Based on the patient's recent treatment and current status, suggest 3-5 specific, actionable follow-up tasks for the clinical team (e.g., 'Call patient tomorrow to check on extraction site', 'Schedule 2-week post-op for crown seat', 'Send periodontal maintenance recall').`;
        finalPrompt = `
${patientDetailsPrompt}

Suggest actionable follow-up tasks and recalls for this patient.`;
        break;

      case "risk_detection":
        systemInstruction = `You are a Board-Certified Oral Surgeon and Clinical Pharmacologist.
Your task is to analyze the patient's complete profile, medical history, allergies, systemic conditions, active medications, and dental plans to scan for critical medical-dental risk vectors.
Be meticulous. Identify and elaborate on:
1. **Critical Medical Alerts & Contraindications**: E.g., bleeding risks with anticoagulants, bone necrosis (MRONJ) with bisphosphonates, cardiac conditions, anesthetic selection warnings.
2. **Drug-Drug & Drug-Procedure Interactions**: E.g., epinephrine limits, systemic antibiotics.
3. **Implant Failure Risk Vectors**: E.g., uncontrolled diabetes Hba1c risks on bone healing, heavy smoking, severe nocturnal bruxism mechanical stresses.
4. **Prosthodontic Warnings**: E.g., thin periodontal biotype, high smile-line aesthetics, occlusion wear, lateral shear forces.

For every risk identified, you MUST provide a concrete, step-by-step "Clinical Mitigation Strategy" for the dentist.`;

        finalPrompt = `
${patientDetailsPrompt}

Run a complete Clinical Risk & Contraindication Scan for this patient's current prosthodontic/implant plan.`;
        break;

      default:
        return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
    }

    const formattedHistory = (history && Array.isArray(history)) ? history.map((msg: any) => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] })) : [];

    const stream = await ai.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: [...formattedHistory, { role: "user", parts: [{ text: finalPrompt }] }],
      config: {
        systemInstruction,
        temperature: 0.2, // Keep temperature low for precise, safe, clinical answers
      },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk.text));
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error("Gemini API server route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI clinical request" },
      { status: 500 }
    );
  }
}
