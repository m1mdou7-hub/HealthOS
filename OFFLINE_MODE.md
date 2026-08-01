# 📱 HealthOS - وضع Offline (2-in-1)

## 🎯 الفكرة

HealthOS يدعم الآن **وضع 2-in-1**:
- ✅ **اوفلاين**: يشتغل بدون إنترنت
- ✅ **اونلاين**: يزامن البيانات مع السيرفر تلقائياً

---

## 🏗️ البنية

```
┌─────────────────────────────────────────────┐
│           HealthOS App (الموبايل)            │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────┐    ┌─────────────────┐     │
│  │  الواجهة   │    │  قاعدة بيانات   │     │
│  │   (UI)     │ ←→ │  SQLite محلية   │     │
│  └─────────────┘    └────────┬────────┘     │
│                              │              │
│                     ┌────────▼────────┐     │
│                     │  خدمة المزامنة  │     │
│                     │  Sync Service   │     │
│                     └────────┬────────┘     │
└──────────────────────────────│──────────────┘
                               │
                    (when online)
                               │
                    ┌──────────▼──────────┐
                    │    Supabase Server  │
                    │    (السيرفر)        │
                    └─────────────────────┘
```

---

## 📁 الملفات الجديدة

| الملف | الوصف |
|-------|-------|
| `src/database/offline-db.ts` | إدارة قاعدة البيانات المحلية |
| `src/database/sync-service.ts` | خدمة المزامنة |
| `app/api/sync/route.ts` | API للمزامنة |
| `app/api/sync/patients/route.ts` | API لمرضى sync |
| `app/api/sync/appointments/route.ts` | API لمواعيد sync |

---

## 🔧 كيفية الاستخدام

### 1️⃣ التهيئة
```typescript
import { offlineDb, syncService } from '@/database';

// تهيئة قاعدة البيانات المحلية
await offlineDb.initialize();

// بدء المزامنة التلقائية
syncService.startAutoSync();
```

### 2️⃣ حفظ البيانات (اوفلاين)
```typescript
// حفظ مريض - يحفظ محلياً فوراً
await offlineDb.savePatient({
  id: '123',
  name: 'أحمد محمد',
  phone: '0501234567'
});

// حفظ موعد
await offlineDb.saveAppointment({
  id: '456',
  patient_id: '123',
  date: '2024-01-15',
  time: '10:00'
});
```

### 3️⃣ قراءة البيانات (اوفلاين)
```typescript
// جلب كل المرضى
const patients = await offlineDb.getPatients();

// جلب كل المواعيد
const appointments = await offlineDb.getAppointments();
```

### 4️⃣ المزامنة التلقائية
```typescript
// يبدأ يزامن تلقائياً كل 30 ثانية
syncService.startAutoSync(30000);

// إيقاف المزامنة
syncService.stopAutoSync();

// مزامنة يدوية
const result = await syncService.sync();
```

---

## 📊 الجدول الزمني للمزامنة

```
الإنترنت متصل؟     ماذا يحدث
─────────────────────────────
✅ نعم           → يحفظ محلياً + يُزامن للسيرفر فوراً
❌ لا            → يحفظ محلياً فقط + يُضيف لقائمة الانتظار
                  ↓
              (بعد ما يرجع الإنترنت)
                  ↓
              → يُزامن كل شي تلقائياً
```

---

## 🔌 API Endpoints

### POST /api/sync
```json
{
  "table": "patients",
  "action": "upsert",
  "id": "123",
  "data": { ... }
}
```

### GET /api/sync/patients?since=2024-01-01
### GET /api/sync/appointments?since=2024-01-01

---

## 📱 بناء التطبيق

### Android
```bash
npm run build
npx cap sync android
npx cap open android
# في Android Studio: Build → Build APK
```

### iOS
```bash
npm run build
npx cap sync ios
npx cap open ios
# في Xcode: Product → Archive
```

---

## ⚙️ إعدادات

### ربط بالسيرفر
```typescript
// في التطبيق
syncService.setServerUrl('https://your-server.com');
```

---

## 🎉 المميزات

- ✅ حفظ البيانات محلياً
- ✅ يعمل بدون إنترنت
- ✅ مزامنة تلقائية
- ✅ مزامنة يدوية
- ✅ كشف حالة الاتصال
- ✅ طابور المزامنة
- ✅ معالجة الأخطاء

---

## 🐛 حل المشاكل

### التطبيق ما يشتغل اوفلاين؟
```
1. تأكد إنك تستدعي offlineDb.initialize()
2. تأكد إن SQLite plugin مثبت
3. تأكد من Console للأخطاء
```

### البيانات ما تُزامن؟
```
1. تأكد إن السيرفر شغال
2. تأكد من صحة URL
3. تحقق من Console للأخطاء
4. جرب مزامنة يدوية
```

---

## 📞 الدعم

للأسئلة أو المشاكل، تواصل معنا!
