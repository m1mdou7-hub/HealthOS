/**
 * Rebuild ar.json with correct UTF-8 Arabic translations
 * Run: node scripts/rebuild_ar_json.js
 */

const fs = require('fs');
const path = require('path');

const ar = {
  "Common": {
    "appName": "هيلث أو إس",
    "search": "بحث",
    "searchOrRunCommand": "ابحث أو نفّذ أمراً...",
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "add": "إضافة",
    "create": "إنشاء",
    "update": "تحديث",
    "close": "إغلاق",
    "confirm": "تأكيد",
    "loading": "جارٍ التحميل...",
    "noResults": "لا توجد نتائج",
    "back": "رجوع",
    "next": "التالي",
    "previous": "السابق",
    "submit": "إرسال",
    "view": "عرض",
    "actions": "إجراءات",
    "status": "الحالة",
    "date": "التاريخ",
    "time": "الوقت",
    "name": "الاسم",
    "email": "البريد الإلكتروني",
    "phone": "الهاتف",
    "all": "الكل",
    "active": "نشط",
    "inactive": "غير نشط",
    "pending": "قيد الانتظار",
    "completed": "مكتمل",
    "signIn": "تسجيل الدخول",
    "signOut": "تسجيل الخروج",
    "systemStatus": "حالة النظام",
    "secure": "آمن",
    "workspaceOperator": "مشغّل مساحة العمل",
    "workspace": "مساحة عمل هيلث أو إس",
    "pro": "احترافي",
    "language": "اللغة",
    "arabic": "العربية",
    "english": "English"
  },
  "Roles": {
    "superAdmin": "مدير عام",
    "clinicOwner": "مالك العيادة",
    "prosthodontist": "أخصائي التركيبات السنية",
    "generalDentist": "طبيب أسنان عام",
    "assistant": "مساعد",
    "receptionist": "موظف استقبال",
    "labTechnician": "فني مختبر",
    "auditor": "مدقّق للقراءة فقط"
  },
  "OrganizationWorkspace": {
    "headerTitle": "مركز التحكم وإدارة المنظمة والعيادات",
    "adminConsole": "لوحة الإدارة الرئيسية",
    "multiClinic": "متعدد العيادات",
    "tenantDesc": "معرف المنظمة: ORG-8820-X92 • بيئة سحابية مشفرة ومخصصة • لوحة موحدة لإدارة العيادات، صلاحيات المستخدمين، وسعة التخزين.",
    "hipaaStatus": "فحص HIPAA: مطابق للمقاييس",
    "multiRegion": "نشط في مناطق متعددة",
    "nodesSynced": "جميع الأنظمة متزامنة",
    "tabs": {
      "Overview": "1. نظرة عامة للمنظمة",
      "Clinics": "2. مراكز العيادات",
      "Departments": "3. الأقسام التخصصية",
      "Users": "4. دليل الموظفين",
      "Permissions": "5. الأدوار والأمان",
      "Teams": "6. فرق العمل الطبية",
      "Audits": "7. سجل الأنشطة والتدقيق",
      "Notifications": "8. التنبيهات العامة",
      "Security": "9. مركز أمان النظام",
      "Settings": "10. إعدادات الهوية والعلامة"
    },
    "overview": {
      "clinicsTitle": "مراكز العيادات النشطة",
      "totalPatients": "إجمالي المرضى",
      "totalStaff": "الكادر الطبي",
      "totalDepts": "الأقسام",
      "activeSessions": "جلسات نشطة",
      "aiAnalysis": "التحليل الذكي للأداء",
      "systemHealth": "صحة النظام",
      "uptime": "وقت التشغيل",
      "compliance": "الامتثال"
    },
    "clinics": {
      "title": "مراكز العيادات المُدارة",
      "addClinic": "إضافة عيادة",
      "status": "الحالة",
      "location": "الموقع",
      "staff": "الكادر",
      "patients": "المرضى",
      "revenue": "الإيرادات"
    },
    "departments": {
      "title": "الأقسام التخصصية",
      "addDept": "إضافة قسم",
      "head": "المدير",
      "staffCount": "عدد الكادر"
    },
    "users": {
      "title": "دليل الموظفين",
      "inviteUser": "دعوة موظف",
      "role": "الدور",
      "lastLogin": "آخر دخول",
      "accessLevel": "مستوى الصلاحية"
    },
    "permissions": {
      "title": "إدارة الأدوار والصلاحيات",
      "role": "الدور",
      "permissions": "الصلاحيات",
      "edit": "تعديل"
    },
    "security": {
      "title": "مركز أمان النظام",
      "mfa": "التحقق الثنائي",
      "auditLog": "سجل التدقيق",
      "sessionTimeout": "انتهاء الجلسة"
    },
    "nodeStatus": "العقدة الإدارية: نشطة"
  },
  "DeveloperWorkspace": {
    "headerTitle": "بيئة المطور والتكامل التقني",
    "headerSubtitle": "أدوات API والتكامل ومراقبة النظام للمطورين والمسؤولين التقنيين.",
    "nodeStatus": "عقدة المطور: نشطة",
    "tabs": {
      "api": "واجهة API",
      "webhooks": "Webhooks",
      "logs": "سجلات النظام",
      "config": "الإعدادات التقنية"
    }
  },
  "AuditWorkspace": {
    "headerTitle": "مركز التدقيق والامتثال",
    "headerSubtitle": "سجل شامل لجميع العمليات والأنشطة المنفّذة داخل المنصة.",
    "nodeStatus": "محرك التدقيق: نشط",
    "tabs": {
      "activityLog": "سجل الأنشطة",
      "complianceReports": "تقارير الامتثال",
      "systemEvents": "أحداث النظام",
      "userActions": "إجراءات المستخدمين",
      "dataAccess": "سجل الوصول للبيانات",
      "security": "أحداث الأمان"
    },
    "filters": {
      "allTypes": "جميع الأنواع",
      "allUsers": "جميع المستخدمين",
      "allModules": "جميع الوحدات",
      "dateRange": "نطاق التاريخ",
      "search": "البحث في السجلات"
    },
    "table": {
      "timestamp": "الطابع الزمني",
      "action": "الإجراء",
      "actor": "المنفذ",
      "module": "الوحدة",
      "details": "التفاصيل",
      "ipAddress": "عنوان IP",
      "status": "الحالة"
    },
    "compliance": {
      "hipaaTitle": "الامتثال لمعايير HIPAA",
      "hipaaDesc": "فحص شامل لمدى التزام المنصة بمتطلبات HIPAA لحماية بيانات المرضى.",
      "score": "درجة الامتثال",
      "lastAudit": "آخر تدقيق",
      "nextAudit": "التدقيق القادم",
      "fullReport": "التقرير الكامل"
    },
    "systemEvents": {
      "title": "أحداث النظام الحرجة",
      "desc": "مراقبة الأحداث التقنية والأمانية على مستوى البنية التحتية."
    },
    "exportBtn": "تصدير السجل",
    "refreshBtn": "تحديث",
    "noLogs": "لا توجد سجلات تطابق معايير البحث.",
    "showing": "عرض",
    "of": "من",
    "results": "نتيجة"
  },
  "BillingWorkspace": {
    "headerTitle": "نظام الفوترة والمطالبات والعمليات المالية",
    "ledgerCore": "سجل الفوترة الرئيسي",
    "nodeId": "معرف وحدة الفوترة: FIN-7701-X22",
    "ediStatus": "فحص أهلية EDI: متصل (100%)",
    "tabs": {
      "overview": "لوحة التحكم المالية",
      "newClaim": "مطالبة جديدة",
      "claimsList": "جميع المطالبات",
      "insurance": "لوحة التأمين",
      "payments": "الدفعات والتسويات",
      "reports": "التقارير المالية",
      "eclaims": "المطالبات الإلكترونية",
      "receipts": "الإيصالات",
      "installments": "خطط التقسيط"
    },
    "overview": {
      "title": "لوحة التحكم المالية",
      "totalRevenue": "إجمالي الإيرادات",
      "pendingClaims": "المطالبات المعلقة",
      "approvedClaims": "المطالبات المعتمدة",
      "rejectedClaims": "المطالبات المرفوضة",
      "thisMonth": "هذا الشهر",
      "outstanding": "المستحقات"
    },
    "newClaim": {
      "title": "تقديم مطالبة جديدة",
      "patientName": "اسم المريض",
      "insuranceProvider": "جهة التأمين",
      "procedureCode": "رمز الإجراء",
      "amount": "المبلغ",
      "dateOfService": "تاريخ الخدمة",
      "submitClaim": "تقديم المطالبة"
    },
    "claimsList": {
      "title": "سجل جميع المطالبات",
      "claimId": "رقم المطالبة",
      "patient": "المريض",
      "amount": "المبلغ",
      "status": "الحالة",
      "date": "التاريخ",
      "provider": "جهة التأمين"
    },
    "insurance": {
      "title": "لوحة إدارة التأمين",
      "provider": "مزود التأمين",
      "policyNumber": "رقم الوثيقة",
      "coverage": "نسبة التغطية",
      "expiryDate": "تاريخ الانتهاء",
      "status": "الحالة"
    },
    "payments": {
      "title": "الدفعات والتسويات",
      "paymentId": "رقم الدفعة",
      "patient": "المريض",
      "amount": "المبلغ",
      "method": "طريقة الدفع",
      "date": "التاريخ",
      "status": "الحالة"
    }
  },
  "GlobalSettingsWorkspace": {
    "headerTitle": "إعدادات HealthOS العامة",
    "headerSubtitle": "إدارة المنظمة والموظفين والإشعارات وضوابط الأمان على مستوى المنصة.",
    "nodeStatus": "العقدة الإدارية: نشطة",
    "tabs": {
      "organization": "المنظمة والكادر",
      "profile": "بيانات الاعتماد الشخصية",
      "appConfig": "إعدادات النظام",
      "notifications": "التنبيهات والإشعارات",
      "security": "الأمان والتدقيق"
    },
    "org": {
      "hierarchyTitle": "الهيكل التنظيمي للعيادة",
      "hierarchyDesc": "إدارة الأقسام السريرية المتخصصة وتوزيع الموظفين.",
      "head": "المدير",
      "staffSize": "أعضاء الفريق",
      "addDept": "إضافة قسم",
      "deptNamePlaceholder": "اسم القسم (مثال: تقويم الأسنان)",
      "deptCodePlaceholder": "الرمز (مثال: ORTH)",
      "staffTitle": "إدارة واستدعاء كادر العيادة",
      "staffDesc": "يمكن للمدير إرسال دعوات وإضافة الموظفين للوصول السريع دون مفتاح تفعيل.",
      "inviteBtn": "دعوة / إضافة موظف جديد",
      "subscriptionTitle": "حالة الاشتراك",
      "enterprisePlan": "خطة Enterprise Ultimate",
      "planExpiry": "تنتهي يوليو 2027 • معيار HIPAA SLA",
      "seatLicenses": "تراخيص المقاعد:",
      "seats": "مقعد من أصل 15",
      "multiClinic": "مراكز متعددة:",
      "activeClinics": "3 عيادات نشطة",
      "supportDesk": "طاولة الدعم:",
      "dedicatedSupport": "مدير حساب مخصص 24/7"
    },
    "invite": {
      "title": "دعوة / إضافة موظف جديد لـ HealthOS",
      "subtitle": "سيتمكن الموظف من استخدام البريد وكلمة المرور للدخول المباشر.",
      "fullName": "اسم الموظف الكامل",
      "namePlaceholder": "د. محمد السعيد",
      "email": "البريد الإلكتروني",
      "emailPlaceholder": "m.alsaeed@healthos.io",
      "role": "الدور والصلاحية",
      "roleClinician": "طبيب معالج (صلاحيات EHR كاملة)",
      "roleReceptionist": "مسؤول استقبال (المواعيد والتسجيل)",
      "roleLabTech": "فني مختبر (CAD/CAM وSTL)",
      "roleAdmin": "مدير نظام",
      "roleAuditor": "مراجع سلامة (HIPAA)",
      "tempPassword": "كلمة المرور المبدئية",
      "cancel": "إلغاء",
      "submit": "إرسال الدعوة واعتماد الحساب"
    },
    "appConfig": {
      "appointmentTitle": "معاملات المواعيد الافتراضية",
      "slotDuration": "مدة الفتحة الزمنية",
      "cancellationPeriod": "فترة الإلغاء",
      "cancel24h": "قبل 24 ساعة",
      "cancel48h": "قبل 48 ساعة",
      "cancelAlways": "مسموح دائماً",
      "allowCancel": "السماح بالإلغاء الفوري للمريض",
      "allowCancelDesc": "إذا تم التفعيل، يمكن للمرضى سحب الموعد من التطبيق دون قواعد رسوم إدارية.",
      "aiTitle": "إعدادات الذكاء الاصطناعي / Gemini LLM",
      "primaryModel": "نموذج الذكاء الرئيسي",
      "temperature": "درجة الإبداع (Temperature)",
      "apiKeyStatus": "حالة مفتاح API",
      "apiKeyConfigured": "مُعدَّن ومؤمَّن",
      "apiKeyDesc": "يستخدم مسار خادم آمن: process.env.GEMINI_API_KEY. لا تسريب من جانب العميل.",
      "regionTitle": "الإعدادات الإقليمية واللغوية",
      "defaultLanguage": "اللغة الافتراضية",
      "timezone": "المنطقة الزمنية للعيادة",
      "applyBtn": "تطبيق إعدادات النظام"
    },
    "notifications": {
      "templatesTitle": "قوالب SMS/البريد الإلكتروني الديناميكية",
      "templatesDesc": "تُقدَّم وحدات الماكرو تلقائياً عند المواعيد والإشعارات.",
      "channelsTitle": "قنوات الإرسال النشطة",
      "emailChannel": "مُرسِل البريد الإلكتروني",
      "emailGateway": "بوابة SES SMTP",
      "smsChannel": "صندوق الرسائل القصيرة",
      "smsGateway": "Twilio Webhook Node",
      "whatsappChannel": "واتساب للأعمال",
      "whatsappGateway": "Meta Cloud API",
      "saveBtn": "حفظ حالات القنوات"
    },
    "security": {
      "auditTitle": "سجل التدقيق في الوقت الفعلي",
      "auditDesc": "سجل تسلسلي غير قابل للتعديل لجميع إجراءات المسؤولين داخل HealthOS.",
      "auditActor": "المنفذ",
      "auditAsset": "المورد",
      "hipaaTitle": "HIPAA والامتثال الأمني",
      "passwordPolicy": "سياسة كلمة المرور",
      "pwdStandard": "عادية (8+ أحرف)",
      "pwdHigh": "عالية (12+ حرف، رموز، أحرف كبيرة)",
      "pwdSuperMax": "قصوى (16+ حرف، تُجدَّد شهرياً)",
      "enforceMFA": "إلزامية التحقق الثنائي (MFA)",
      "enforceMFADesc": "طلب رمز TOTP لجميع تسجيلات الدخول السريرية.",
      "saveBtn": "حفظ سياسات الأمان"
    }
  },
  "LaboratoryWorkspace": {
    "headerTitle": "مختبر CAD/CAM والتقنيات السريرية",
    "headerSubtitle": "تتبع أعمال طب الأسنان التعويضي وحالات المختبر وملفات الطباعة ثلاثية الأبعاد.",
    "nodeStatus": "عقدة المختبر: نشطة",
    "tabs": {
      "cases": "الحالات",
      "materials": "المواد",
      "equipment": "المعدات",
      "reports": "التقارير"
    }
  },
  "InventoryWorkspace": {
    "headerTitle": "إدارة المخزون والمواد الطبية",
    "headerSubtitle": "تتبع المخزون والمواد الاستهلاكية وطلبات الشراء.",
    "nodeStatus": "عقدة المخزون: نشطة",
    "tabs": {
      "stock": "المخزون",
      "orders": "طلبات الشراء",
      "suppliers": "الموردون",
      "reports": "التقارير"
    }
  },
  "ImagingWorkspace": {
    "headerTitle": "التصوير الطبي والأشعة",
    "headerSubtitle": "عرض وتحليل صور CBCT والأشعة السينية وملفات DICOM.",
    "nodeStatus": "عقدة التصوير: نشطة",
    "tabs": {
      "viewer": "عارض الصور",
      "cbct": "مسح CBCT",
      "xray": "الأشعة السينية",
      "reports": "التقارير"
    },
    "pacs_title": "لوحة التصوير الطبي المتقدم (PACS)",
    "pacs_desc": "عرض وتحليل وقياس صور CBCT والأشعة الرقمية.",
    "pacs_no_scans": "لم يتم تحميل أي صور. اضغط على 'رفع فحص' لبدء التحليل.",
    "pacs_upload": "رفع فحص",
    "pacs_cbct": "فحص CBCT",
    "pacs_xray": "أشعة سينية",
    "pacs_panoramic": "صورة بانورامية",
    "pacs_periapical": "صورة جذر السن",
    "pacs_zoom_in": "تكبير",
    "pacs_zoom_out": "تصغير",
    "pacs_reset": "إعادة ضبط",
    "pacs_brightness": "السطوع",
    "pacs_contrast": "التباين",
    "pacs_measure": "قياس المسافة (انقر على نقطتين في الصورة)",
    "pacs_canal_overlay": "تتبع قناة الفك (Mandibular Canal)",
    "pacs_caries_overlay": "تمييز مناطق التسوس (Caries)",
    "pacs_measured_dist": "المسافة المقاسة:",
    "no_scans_logged": "لا توجد صور CBCT أو أشعة سينية مسجلة. استخدم شريط الأدوات لرفع فحص.",
    "lab_title": "منسق مختبر CAD/CAM",
    "lab_desc": "تتبع عمليات طحن الزيركونيا وتلميع الـ E.max ونماذج STL التشخيصية.",
    "btn_file_case": "تسجيل حالة مختبر",
    "lab_pipeline_title": "خط إنتاج الأطراف الاصطناعية",
    "lab_stage_design": "التصميم",
    "lab_stage_milling": "الطحن",
    "lab_stage_sintering": "التلبيد",
    "lab_stage_glazing": "التلميع والطلاء",
    "lab_stage_delivered": "تم التسليم",
    "lab_material": "المادة",
    "lab_shade": "درجة اللون",
    "lab_due": "تاريخ التسليم",
    "lab_priority": "الأولوية",
    "lab_clinician": "الطبيب المعالج",
    "lab_instructions": "تعليمات المختبر",
    "lab_no_cases": "لا توجد حالات مختبر مسجلة. اضغط 'تسجيل حالة مختبر' لإضافة واحدة.",
    "lab_progress": "تقدم التصنيع",
    "lab_countdown": "الأيام المتبقية",
    "lab_overdue": "متأخر عن الموعد",
    "lab_stl_title": "ملفات المسح ثلاثي الأبعاد (STL)",
    "lab_stl_empty": "لا توجد ملفات STL مجمّعة. انتقل إلى تبويب المستندات لرفع ملف.",
    "lab_shade_picker": "اختيار درجة اللون",
    "lab_stages_track": "متابعة المراحل"
  },
  "AnalyticsWorkspace": {
    "headerTitle": "التحليلات والتقارير الذكية",
    "headerSubtitle": "تحليلات شاملة لأداء العيادة والمرضى والإيرادات.",
    "nodeStatus": "محرك التحليلات: نشط",
    "tabs": {
      "overview": "نظرة عامة",
      "revenue": "الإيرادات",
      "patients": "المرضى",
      "clinical": "الأداء السريري",
      "staff": "الكادر الطبي"
    }
  },
  "CommunicationWorkspace": {
    "headerTitle": "مركز التواصل والمراسلات",
    "headerSubtitle": "إرسال الرسائل والإشعارات للمرضى والفريق الطبي.",
    "nodeStatus": "بوابة التواصل: نشطة",
    "tabs": {
      "messages": "الرسائل",
      "notifications": "الإشعارات",
      "templates": "القوالب",
      "campaigns": "الحملات"
    }
  },
  "AutomationsWorkspace": {
    "headerTitle": "الأتمتة والمهام التلقائية",
    "headerSubtitle": "إنشاء وإدارة سير العمل التلقائي والقواعد الذكية.",
    "nodeStatus": "محرك الأتمتة: نشط",
    "tabs": {
      "workflows": "سير العمل",
      "rules": "القواعد",
      "triggers": "المحفّزات",
      "logs": "سجل التشغيل"
    }
  },
  "DocumentWorkspace": {
    "headerTitle": "إدارة المستندات والسجلات",
    "headerSubtitle": "رفع وتنظيم وتتبع جميع الوثائق الطبية والإدارية.",
    "nodeStatus": "مستودع المستندات: نشط",
    "tabs": {
      "all": "جميع الملفات",
      "medical": "السجلات الطبية",
      "administrative": "الوثائق الإدارية",
      "consents": "نماذج الموافقة"
    }
  },
  "IntegrationsWorkspace": {
    "headerTitle": "التكاملات والاتصالات الخارجية",
    "headerSubtitle": "ربط HealthOS بالأنظمة والخدمات الخارجية.",
    "nodeStatus": "بوابة التكاملات: نشطة",
    "tabs": {
      "connected": "الاتصالات النشطة",
      "available": "التكاملات المتاحة",
      "webhooks": "Webhooks",
      "logs": "سجلات الاتصال"
    }
  },
  "TasksWorkspace": {
    "headerTitle": "إدارة المهام والمتابعة",
    "headerSubtitle": "تتبع وإدارة مهام الفريق السريري والإداري.",
    "nodeStatus": "مدير المهام: نشط",
    "tabs": {
      "myTasks": "مهامي",
      "team": "مهام الفريق",
      "completed": "المهام المنجزة",
      "reports": "التقارير"
    }
  },
  "NotificationsWorkspace": {
    "headerTitle": "مركز الإشعارات والتنبيهات",
    "headerSubtitle": "إدارة جميع الإشعارات والتنبيهات على مستوى المنصة.",
    "nodeStatus": "محرك الإشعارات: نشط",
    "tabs": {
      "all": "جميع الإشعارات",
      "unread": "غير مقروءة",
      "important": "مهمة",
      "settings": "إعدادات الإشعارات"
    }
  },
  "HelpWorkspace": {
    "headerTitle": "مركز المساعدة والدعم",
    "headerSubtitle": "الأدلة والتوثيق والدعم الفني لمنصة HealthOS.",
    "nodeStatus": "مركز الدعم: متصل",
    "tabs": {
      "guides": "الأدلة",
      "faq": "الأسئلة الشائعة",
      "support": "الدعم الفني",
      "updates": "التحديثات"
    }
  },
  "PlatformWorkspace": {
    "headerTitle": "إعدادات المنصة والبنية التحتية",
    "headerSubtitle": "إدارة البنية التحتية وإعدادات المنصة على مستوى النظام.",
    "nodeStatus": "مدير المنصة: نشط",
    "tabs": {
      "infrastructure": "البنية التحتية",
      "database": "قاعدة البيانات",
      "security": "الأمان",
      "monitoring": "المراقبة"
    }
  },
  "Navigation": {
    "dashboard": "لوحة التحكم",
    "patients": "المرضى",
    "appointments": "المواعيد",
    "billing": "الفوترة",
    "lab": "المختبر",
    "inventory": "المخزون",
    "imaging": "التصوير الطبي",
    "analytics": "التحليلات",
    "communications": "التواصل",
    "automations": "الأتمتة",
    "documents": "المستندات",
    "integrations": "التكاملات",
    "tasks": "المهام",
    "notifications": "الإشعارات",
    "help": "المساعدة",
    "settings": "الإعدادات",
    "organization": "المنظمة",
    "developer": "المطور",
    "audit": "التدقيق",
    "platform": "المنصة"
  },
  "Dashboard": {
    "title": "لوحة التحكم الرئيسية",
    "welcomeBack": "مرحباً بعودتك",
    "todayOverview": "نظرة اليوم",
    "totalPatients": "إجمالي المرضى",
    "todayAppointments": "مواعيد اليوم",
    "pendingBilling": "فواتير معلقة",
    "activeStaff": "كادر نشط",
    "recentActivity": "النشاط الأخير",
    "quickActions": "الإجراءات السريعة",
    "newPatient": "مريض جديد",
    "scheduleAppointment": "جدولة موعد",
    "createBill": "إنشاء فاتورة",
    "systemAlerts": "تنبيهات النظام"
  },
  "Patients": {
    "title": "إدارة المرضى",
    "addPatient": "إضافة مريض",
    "searchPatients": "البحث عن مريض",
    "patientId": "رقم المريض",
    "fullName": "الاسم الكامل",
    "dateOfBirth": "تاريخ الميلاد",
    "gender": "الجنس",
    "phone": "رقم الهاتف",
    "email": "البريد الإلكتروني",
    "address": "العنوان",
    "insurance": "التأمين الصحي",
    "lastVisit": "آخر زيارة",
    "status": "الحالة",
    "medicalHistory": "السجل الطبي",
    "treatmentPlan": "خطة العلاج",
    "appointments": "المواعيد",
    "documents": "المستندات",
    "billing": "الفوترة"
  },
  "Appointments": {
    "title": "إدارة المواعيد",
    "newAppointment": "موعد جديد",
    "date": "التاريخ",
    "time": "الوقت",
    "patient": "المريض",
    "doctor": "الطبيب",
    "type": "نوع الزيارة",
    "duration": "المدة",
    "status": "الحالة",
    "notes": "ملاحظات",
    "confirmed": "مؤكد",
    "pending": "قيد الانتظار",
    "cancelled": "ملغى",
    "completed": "مكتمل",
    "noShow": "لم يحضر",
    "reschedule": "إعادة الجدولة",
    "cancel": "إلغاء الموعد"
  },
  "Lab": {
    "title": "إدارة المختبر",
    "newCase": "حالة جديدة",
    "caseId": "رقم الحالة",
    "patient": "المريض",
    "doctor": "الطبيب",
    "type": "نوع العمل",
    "material": "المادة",
    "shade": "اللون",
    "dueDate": "تاريخ التسليم",
    "status": "الحالة",
    "priority": "الأولوية",
    "instructions": "التعليمات",
    "design": "التصميم",
    "milling": "الطحن",
    "sintering": "التلبيد",
    "glazing": "التلميع",
    "delivered": "مُسلَّم"
  },
  "Billing": {
    "title": "نظام الفوترة والمدفوعات",
    "newInvoice": "فاتورة جديدة",
    "invoiceId": "رقم الفاتورة",
    "patient": "المريض",
    "amount": "المبلغ",
    "status": "الحالة",
    "dueDate": "تاريخ الاستحقاق",
    "paid": "مدفوع",
    "unpaid": "غير مدفوع",
    "partial": "مدفوع جزئياً",
    "overdue": "متأخر",
    "paymentMethod": "طريقة الدفع",
    "cash": "نقداً",
    "card": "بطاقة ائتمانية",
    "insurance": "تأمين",
    "installment": "تقسيط"
  },
  "Settings": {
    "title": "الإعدادات",
    "profile": "الملف الشخصي",
    "security": "الأمان",
    "notifications": "الإشعارات",
    "language": "اللغة",
    "theme": "المظهر",
    "billing": "الفوترة والاشتراك",
    "integrations": "التكاملات",
    "saveChanges": "حفظ التغييرات",
    "changePassword": "تغيير كلمة المرور",
    "currentPassword": "كلمة المرور الحالية",
    "newPassword": "كلمة المرور الجديدة",
    "confirmPassword": "تأكيد كلمة المرور"
  },
  "Access": {
    "signIn": "تسجيل الدخول",
    "signUp": "إنشاء حساب",
    "forgotPassword": "نسيت كلمة المرور",
    "resetPassword": "إعادة تعيين كلمة المرور",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "rememberMe": "تذكرني",
    "dontHaveAccount": "ليس لديك حساب؟",
    "alreadyHaveAccount": "لديك حساب بالفعل؟",
    "continueWithGoogle": "المتابعة بـ Google",
    "continueWithGitHub": "المتابعة بـ GitHub",
    "termsAndConditions": "الشروط والأحكام",
    "privacyPolicy": "سياسة الخصوصية"
  },
  "DashboardV3": {
    "headerTitle": "لوحة التحكم الرئيسية",
    "headerSubtitle": "نظرة شاملة على أداء عيادتك في الوقت الفعلي",
    "nodeStatus": "النظام: نشط",
    "metrics": {
      "totalPatients": "إجمالي المرضى",
      "todayAppointments": "مواعيد اليوم",
      "monthlyRevenue": "إيرادات الشهر",
      "activeStaff": "الكادر النشط",
      "pendingClaims": "مطالبات معلقة",
      "labCases": "حالات مختبر"
    },
    "sections": {
      "recentActivity": "النشاط الأخير",
      "upcomingAppointments": "المواعيد القادمة",
      "alerts": "التنبيهات والإشعارات",
      "quickStats": "إحصائيات سريعة"
    }
  },
  "PatientWorkspace": {
    "headerTitle": "ملف المريض الشامل",
    "tabs": {
      "overview": "نظرة عامة",
      "soap": "ملاحظات SOAP",
      "treatmentPlan": "خطة العلاج",
      "imaging": "التصوير",
      "lab": "المختبر",
      "billing": "الفوترة",
      "documents": "المستندات",
      "timeline": "المسار الزمني"
    },
    "overview": {
      "personalInfo": "المعلومات الشخصية",
      "medicalAlerts": "التنبيهات الطبية",
      "vitalSigns": "العلامات الحيوية",
      "allergies": "الحساسية",
      "medications": "الأدوية الحالية",
      "conditions": "الحالات الطبية"
    },
    "soap": {
      "subjective": "الشكوى الذاتية (S)",
      "objective": "النتائج الموضوعية (O)",
      "assessment": "التقييم التشخيصي (A)",
      "plan": "خطة العلاج (P)",
      "saveNote": "حفظ الملاحظة",
      "generateAI": "توليد بالذكاء الاصطناعي"
    },
    "treatmentPlan": {
      "title": "خطة العلاج",
      "addProcedure": "إضافة إجراء",
      "procedure": "الإجراء",
      "tooth": "السن",
      "cost": "التكلفة",
      "status": "الحالة",
      "priority": "الأولوية",
      "notes": "ملاحظات"
    }
  }
};

const outputPath = path.join(__dirname, '..', 'messages', 'ar.json');
fs.writeFileSync(outputPath, JSON.stringify(ar, null, 2), 'utf8');
console.log('✅ ar.json rebuilt successfully with correct Arabic UTF-8 encoding!');
console.log('File size:', fs.statSync(outputPath).size, 'bytes');

// Verify it's valid
const verify = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
console.log('✅ JSON validation passed!');
console.log('Sections:', Object.keys(verify).join(', '));
