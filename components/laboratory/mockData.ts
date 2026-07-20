import { LabCase, TechnicianUtilization } from './types';

export const MOCK_TECHNICIANS: TechnicianUtilization[] = [
  { name: 'Marcus Sterling', activeCases: 4, completedToday: 3, utilizationRate: 85, rating: 4.9 },
  { name: 'Yuri Gagarin', activeCases: 3, completedToday: 4, utilizationRate: 90, rating: 4.8 },
  { name: 'Anya Chalotra', activeCases: 5, completedToday: 2, utilizationRate: 95, rating: 4.7 },
  { name: 'Lucius Fox', activeCases: 2, completedToday: 5, utilizationRate: 60, rating: 5.0 },
];

export const INITIAL_LAB_CASES: LabCase[] = [
  {
    id: 'CASE-2026-A1',
    patientName: 'Amelia Vance',
    doctorName: 'Dr. Robert Carter',
    laboratoryName: 'Apex Digital Esthetics',
    caseType: 'Digital Scan',
    restorationType: 'Crown',
    priority: 'Urgent',
    status: 'CAD',
    dueDate: '2026-07-22',
    createdDate: '2026-07-18',
    progressPercent: 25,
    isDelayed: true, // Specifically marked delayed to showcase delayed alerts!
    assignedTechnician: 'Marcus Sterling',
    internalNotes: 'Patient has high translucency in the incisal halo. Ensure e.max block is milled with high translucency. Sub-gingival margin 0.2mm on facial.',
    files: [
      {
        id: 'file-101',
        name: 'amelia_vance_maxillary_prep.stl',
        type: 'STL',
        size: '42.5 MB',
        uploadedAt: '2026-07-18 09:30',
        uploadedBy: 'Dr. Robert Carter',
        version: 2,
        versionHistory: [
          { version: 1, date: '2026-07-18 09:30', note: 'Initial upload from intraoral scanner', author: 'Dr. Robert Carter' },
          { version: 2, date: '2026-07-19 11:20', note: 'Re-scanned margin for clearer finish line', author: 'Dr. Robert Carter' }
        ],
        category: 'Raw Impression',
        tags: ['Maxillary', 'Prep', 'Tooth #11']
      },
      {
        id: 'file-102',
        name: 'mandibular_antagonist_jaw.ply',
        type: 'PLY',
        size: '35.8 MB',
        uploadedAt: '2026-07-18 09:32',
        uploadedBy: 'Dr. Robert Carter',
        version: 1,
        versionHistory: [
          { version: 1, date: '2026-07-18 09:32', note: 'Antagonist bite scanner capture', author: 'Dr. Robert Carter' }
        ],
        category: 'Raw Impression',
        tags: ['Mandibular', 'Antagonist']
      },
      {
        id: 'file-103',
        name: 'buccal_bite_alignment.obj',
        type: 'OBJ',
        size: '12.4 MB',
        uploadedAt: '2026-07-18 09:33',
        uploadedBy: 'Dr. Robert Carter',
        version: 1,
        versionHistory: [{ version: 1, date: '2026-07-18 09:33', note: 'Bite lock registration', author: 'Dr. Robert Carter' }],
        category: 'Raw Impression',
        tags: ['Bite', 'Alignment']
      },
      {
        id: 'file-104',
        name: 'clinical_shade_matching.jpg',
        type: 'Clinical Photo',
        size: '4.8 MB',
        uploadedAt: '2026-07-18 09:40',
        uploadedBy: 'Dr. Robert Carter',
        version: 1,
        versionHistory: [{ version: 1, date: '2026-07-18 09:40', note: 'Initial DSLR photography of adjacent teeth', author: 'Dr. Robert Carter' }],
        category: 'Clinical Photography',
        tags: ['Photo', 'Shade A2']
      },
      {
        id: 'file-105',
        name: 'maxillary_cbct_segment.dcm',
        type: 'CBCT',
        size: '112.4 MB',
        uploadedAt: '2026-07-18 10:15',
        uploadedBy: 'Dr. Robert Carter',
        version: 1,
        versionHistory: [{ version: 1, date: '2026-07-18 10:15', note: 'Segmented bone volume', author: 'Dr. Robert Carter' }],
        category: 'Radiology',
        tags: ['DICOM', 'Bone Level']
      }
    ],
    shade: {
      vitaShade: 'A2',
      customShade: '70% A2 Body + 30% OM3 Incisal Bleach Halo',
      photos: ['clinical_shade_matching.jpg'],
      shadeNotes: 'Extremely translucent incisal edge, transition to higher chroma at the cervical third.',
      shadeHistory: [
        { date: '2026-07-18 09:30', shade: 'A2', updatedBy: 'Dr. Robert Carter', note: 'Identified as best matching classical VITA shade.' },
        { date: '2026-07-19 14:00', shade: 'A2 with OM3 incisal', updatedBy: 'Marcus Sterling', note: 'Custom stain mix suggested for optimal incisal halo emulation.' }
      ]
    },
    communication: [
      {
        id: 'msg-101',
        sender: 'Clinician',
        senderName: 'Dr. Robert Carter',
        text: 'This is a premium cosmetic restoration for Amelia. She is very selective about her smile line. Let me know if you need high resolution pre-op photos.',
        timestamp: '2026-07-18 09:45',
        type: 'Message'
      },
      {
        id: 'msg-102',
        sender: 'Technician',
        senderName: 'Marcus Sterling',
        text: 'Scans imported to Exocad. The margin on the distal of #11 was slightly blurry. Could you verify the margin line trace before we proceed to CNC milling?',
        timestamp: '2026-07-19 10:00',
        type: 'Revision Request'
      },
      {
        id: 'msg-103',
        sender: 'Clinician',
        senderName: 'Dr. Robert Carter',
        text: 'I uploaded version 2 scan with refined margin. disto-gingival finish line is now pristine.',
        timestamp: '2026-07-19 11:22',
        type: 'Status Update'
      },
      {
        id: 'msg-104',
        sender: 'Technician',
        senderName: 'Marcus Sterling',
        text: 'Awaiting design approval. Please review the 3D crown contour preview below.',
        timestamp: '2026-07-20 10:30',
        type: 'Approval Request',
        isApproved: false
      }
    ],
    smileDesign: {
      interpupillaryLine: 'Parallel',
      smileLine: 'High',
      dentalMidline: 'Aligned',
      goldenProportionCheck: 'Needs Adjustment',
      facialPhotos: [
        { angle: 'Full Face Smile', url: 'facial_smile.jpg', status: 'Verified' },
        { angle: 'Retracted Facial', url: 'retracted.jpg', status: 'Verified' }
      ],
      waxUpPlanning: {
        step: 'Virtual diagnostic wax-up',
        status: 'Completed',
        notes: 'Slightly lengthened the incisal edge of #11 to match #21 and follow the lower lip line contour.'
      },
      mockUpTracking: {
        date: '2026-07-21',
        feedback: 'Aesthetics approved, phonetics check passed',
        status: 'Approved'
      },
      caseNotes: '3D printed mock-up trial was successful. Clinician approved smile line symmetry.'
    },
    timeline: [
      { stage: 'Prescription received', timestamp: '2026-07-18 09:30', note: 'Signed electronic prescription verified.', completed: true },
      { stage: 'Design', timestamp: '2026-07-19 10:00', note: 'Margin traces established in Exocad Rijeka.', completed: true },
      { stage: 'CAD', timestamp: '2026-07-20 08:00', note: 'Virtual mockups placed under active crown design.', completed: true },
      { stage: 'CAM', timestamp: '', note: 'Milling path calculation and block nesting.', completed: false },
      { stage: 'Milling', timestamp: '', note: 'Diamond carver toolpath execution.', completed: false },
      { stage: 'Printing', timestamp: '', note: 'Trial model printing in Formlabs Dental Resin.', completed: false },
      { stage: 'Sintering', timestamp: '', note: 'High temp ceramic crystallization.', completed: false },
      { stage: 'Staining', timestamp: '', note: 'Ceramist stain and glaze layers.', completed: false },
      { stage: 'Glazing', timestamp: '', note: 'Vitreous gloss finish bake.', completed: false },
      { stage: 'Try-in', timestamp: '', note: 'Clinical test of marginal fit.', completed: false },
      { stage: 'Delivery', timestamp: '', note: 'Express clinical courier dispatch.', completed: false },
      { stage: 'Completion', timestamp: '', note: 'Final cementation complete.', completed: false }
    ]
  },
  {
    id: 'CASE-2026-B5',
    patientName: 'Richard Hendricks',
    doctorName: 'Dr. Elena Rostova',
    laboratoryName: 'HealthOS Dental Lab',
    caseType: 'Digital Scan',
    restorationType: 'Bridge',
    priority: 'High',
    status: 'Milling',
    dueDate: '2026-07-25',
    createdDate: '2026-07-19',
    progressPercent: 50,
    isDelayed: false,
    assignedTechnician: 'Yuri Gagarin',
    internalNotes: 'Multi-layer monolithic zirconia bridge #18 to #20. Extreme load warning. Ensure connectors are at least 9mm2 in area.',
    files: [
      {
        id: 'file-201',
        name: 'richard_hendricks_prep_arch.stl',
        type: 'STL',
        size: '51.2 MB',
        uploadedAt: '2026-07-19 14:15',
        uploadedBy: 'Dr. Elena Rostova',
        version: 1,
        versionHistory: [{ version: 1, date: '2026-07-19 14:15', note: 'Initial high-res digital scan', author: 'Dr. Elena Rostova' }],
        category: 'Raw Impression',
        tags: ['Maxillary', 'Bridge Prep']
      },
      {
        id: 'file-202',
        name: 'prescribe_bridge_form.pdf',
        type: 'PDF',
        size: '1.4 MB',
        uploadedAt: '2026-07-19 14:18',
        uploadedBy: 'Dr. Elena Rostova',
        version: 1,
        versionHistory: [{ version: 1, date: '2026-07-19 14:18', note: 'Signed PDF script', author: 'Dr. Elena Rostova' }],
        category: 'Documentation',
        tags: ['PDF', 'Script']
      }
    ],
    shade: {
      vitaShade: 'A3',
      customShade: 'Monolithic multi-layer A3',
      photos: [],
      shadeNotes: 'Match shade of posterior teeth. High opacity block requested to mask dark underlying pillars.',
      shadeHistory: [
        { date: '2026-07-19 14:15', shade: 'A3', updatedBy: 'Dr. Elena Rostova', note: 'Posterior quadrant shade match.' }
      ]
    },
    communication: [
      {
        id: 'msg-201',
        sender: 'Clinician',
        senderName: 'Dr. Elena Rostova',
        text: 'Severe clencher. Must maximize connector strength.',
        timestamp: '2026-07-19 14:20',
        type: 'Message'
      },
      {
        id: 'msg-202',
        sender: 'Technician',
        senderName: 'Yuri Gagarin',
        text: 'Approved. Design completed with 11.5mm2 connectors. Toolpath compiled for Roland DWX.',
        timestamp: '2026-07-20 09:15',
        type: 'Status Update'
      }
    ],
    timeline: [
      { stage: 'Prescription received', timestamp: '2026-07-19 14:15', note: 'Prescription received.', completed: true },
      { stage: 'Design', timestamp: '2026-07-19 17:00', note: 'Bridge design completed.', completed: true },
      { stage: 'CAD', timestamp: '2026-07-19 18:30', note: 'CAD model finished and verified.', completed: true },
      { stage: 'CAM', timestamp: '2026-07-20 08:30', note: 'Nested on monolithic zirconia disk.', completed: true },
      { stage: 'Milling', timestamp: '2026-07-20 11:00', note: 'Roland 5-axis mill active.', completed: true },
      { stage: 'Printing', timestamp: '', note: 'Not required for this monolithic bridge.', completed: false },
      { stage: 'Sintering', timestamp: '', note: 'Pending milling completion.', completed: false },
      { stage: 'Staining', timestamp: '', note: '', completed: false },
      { stage: 'Glazing', timestamp: '', note: '', completed: false },
      { stage: 'Try-in', timestamp: '', note: '', completed: false },
      { stage: 'Delivery', timestamp: '', note: '', completed: false },
      { stage: 'Completion', timestamp: '', note: '', completed: false }
    ]
  },
  {
    id: 'CASE-2026-C8',
    patientName: 'Clara Oswald',
    doctorName: 'Dr. Sarah Jenkins',
    laboratoryName: 'Apex Digital Esthetics',
    caseType: 'Digital Scan',
    restorationType: 'Veneer',
    priority: 'Standard',
    status: 'Staining',
    dueDate: '2026-07-28',
    createdDate: '2026-07-20',
    progressPercent: 70,
    isDelayed: false,
    assignedTechnician: 'Anya Chalotra',
    internalNotes: 'Ultra-thin veneers #6 to #11. Patient is extremely conscious of bright value. Prefers VITA Classical B1 or BL2.',
    files: [
      {
        id: 'file-301',
        name: 'clara_oswald_veneers_prep.ply',
        type: 'PLY',
        size: '48.9 MB',
        uploadedAt: '2026-07-20 08:30',
        uploadedBy: 'Dr. Sarah Jenkins',
        version: 1,
        versionHistory: [{ version: 1, date: '2026-07-20 08:30', note: 'Color digital model scan', author: 'Dr. Sarah Jenkins' }],
        category: 'Raw Impression',
        tags: ['Veneer', 'Anterior']
      }
    ],
    shade: {
      vitaShade: 'B1',
      customShade: 'BL2 Bleach Shade',
      photos: [],
      shadeNotes: 'Very bright smile. Ensure thin margins do not look opaque gray.',
      shadeHistory: [
        { date: '2026-07-20 08:30', shade: 'B1', updatedBy: 'Dr. Sarah Jenkins', note: 'Initial selected shade.' }
      ]
    },
    communication: [
      {
        id: 'msg-301',
        sender: 'Clinician',
        senderName: 'Dr. Sarah Jenkins',
        text: 'Patient requested bleach shades. Let us press with e.max BL2 ingots.',
        timestamp: '2026-07-20 08:35',
        type: 'Message'
      }
    ],
    smileDesign: {
      interpupillaryLine: 'Parallel',
      smileLine: 'Average',
      dentalMidline: 'Aligned',
      goldenProportionCheck: 'Passed',
      facialPhotos: [],
      waxUpPlanning: {
        step: 'Press casting prep',
        status: 'In Progress',
        notes: 'Hand contouring model margins under stereo-microscope.'
      },
      mockUpTracking: {
        date: '2026-07-22',
        feedback: 'Pending try-in',
        status: 'Pending Try-in'
      },
      caseNotes: 'Aesthetic veneers pressed successfully. Beginning handcrafted staining.'
    },
    timeline: [
      { stage: 'Prescription received', timestamp: '2026-07-20 08:30', note: 'Prescription accepted.', completed: true },
      { stage: 'Design', timestamp: '2026-07-20 09:30', note: 'Veneers designed.', completed: true },
      { stage: 'CAD', timestamp: '2026-07-20 10:15', note: 'Crown contours verified.', completed: true },
      { stage: 'CAM', timestamp: '2026-07-20 12:00', note: 'Nesting compiled.', completed: true },
      { stage: 'Milling', timestamp: '2026-07-20 14:00', note: 'Wax-ups milled for pressing.', completed: true },
      { stage: 'Printing', timestamp: '2026-07-20 15:30', note: 'Working models printed.', completed: true },
      { stage: 'Sintering', timestamp: '2026-07-20 18:00', note: 'e.max hot pressing complete.', completed: true },
      { stage: 'Staining', timestamp: '2026-07-20 19:30', note: 'Ceramist glazing active.', completed: true },
      { stage: 'Glazing', timestamp: '', note: '', completed: false },
      { stage: 'Try-in', timestamp: '', note: '', completed: false },
      { stage: 'Delivery', timestamp: '', note: '', completed: false },
      { stage: 'Completion', timestamp: '', note: '', completed: false }
    ]
  },
  {
    id: 'CASE-2026-D9',
    patientName: 'Bruce Wayne',
    doctorName: 'Dr. Harley Quinn',
    laboratoryName: 'Gotham Esthetic Lab',
    caseType: 'Digital Scan',
    restorationType: 'Implant Abutment',
    priority: 'Standard',
    status: 'Prescription received',
    dueDate: '2026-07-30',
    createdDate: '2026-07-20',
    progressPercent: 8,
    isDelayed: false,
    assignedTechnician: 'Lucius Fox',
    internalNotes: 'Custom titanium abutment + cement-retained zirconia crown on #19. Nobel Biocare CC NP 3.5mm implant scanbody.',
    files: [
      {
        id: 'file-401',
        name: 'bruce_wayne_implant_scanbody.stl',
        type: 'STL',
        size: '56.1 MB',
        uploadedAt: '2026-07-20 10:00',
        uploadedBy: 'Dr. Harley Quinn',
        version: 1,
        versionHistory: [{ version: 1, date: '2026-07-20 10:00', note: 'Scanbody 3D mesh model', author: 'Dr. Harley Quinn' }],
        category: 'Raw Impression',
        tags: ['Implant', 'Scanbody', '#19']
      }
    ],
    shade: {
      vitaShade: 'A3.5',
      customShade: 'Cervical transition to high chroma',
      photos: [],
      shadeNotes: 'Blend into existing dark-molar environment. Avoid too high value.',
      shadeHistory: [
        { date: '2026-07-20 10:00', shade: 'A3.5', updatedBy: 'Dr. Harley Quinn', note: 'Standard molar shade.' }
      ]
    },
    communication: [
      {
        id: 'msg-401',
        sender: 'Technician',
        senderName: 'Lucius Fox',
        text: 'Awaiting antagonist scans and bite registration file. Can you upload these?',
        timestamp: '2026-07-20 10:45',
        type: 'Revision Request'
      }
    ],
    timeline: [
      { stage: 'Prescription received', timestamp: '2026-07-20 10:00', note: 'Scanbody prescription registered.', completed: true },
      { stage: 'Design', timestamp: '', note: 'Awaiting antagonist files.', completed: false },
      { stage: 'CAD', timestamp: '', note: '', completed: false },
      { stage: 'CAM', timestamp: '', note: '', completed: false },
      { stage: 'Milling', timestamp: '', note: '', completed: false },
      { stage: 'Printing', timestamp: '', note: '', completed: false },
      { stage: 'Sintering', timestamp: '', note: '', completed: false },
      { stage: 'Staining', timestamp: '', note: '', completed: false },
      { stage: 'Glazing', timestamp: '', note: '', completed: false },
      { stage: 'Try-in', timestamp: '', note: '', completed: false },
      { stage: 'Delivery', timestamp: '', note: '', completed: false },
      { stage: 'Completion', timestamp: '', note: '', completed: false }
    ]
  }
];
