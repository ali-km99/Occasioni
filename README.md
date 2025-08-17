# نظام إدارة حجز القاعات - Occasioni

نظام متكامل لإدارة حجز القاعات والأنشطة، مبني باستخدام Vue 3 و Vuetify 3.

## الميزات الرئيسية

- **إدارة القاعات**: إضافة، تعديل، وحظر القاعات
- **إدارة أنواع الأنشطة**: إدارة أنواع الأنشطة المتاحة (مثل: صالة، مطعم، إلخ)
- **إدارة المستخدمين**: إدارة حسابات المستخدمين والصلاحيات
- **نظام الحجوزات**: إدارة حجوزات القاعات
- **واجهة عربية**: تصميم متجاوب مع دعم كامل للغة العربية

## هيكل البيانات

### أنواع الأنشطة (Activity Types)
```json
{
  "totalRecords": 1,
  "data": [
    {
      "id": "ab081b27-3394-420c-9f49-f934980ba838",
      "name": "صالة",
      "createAt": "2025-08-08T22:50:29.703729",
      "updatedAt": null,
      "status": 1
    }
  ]
}
```

**الحقول:**
- `id`: معرف فريد للنوع
- `name`: اسم نوع النشاط
- `createAt`: تاريخ الإنشاء
- `updatedAt`: تاريخ آخر تحديث (null إذا لم يتم التحديث)
- `status`: الحالة (1 = نشط، 3 = محظور)

### القاعات (Halls)
```json
{
  "id": "string",
  "name": "اسم القاعة",
  "phoneNumber": "رقم الهاتف",
  "latitude": 0.0,
  "longitude": 0.0,
  "address": "العنوان",
  "location": "الموقع",
  "typeOfActivityId": "معرف نوع النشاط",
  "typeOfActivityName": "اسم نوع النشاط",
  "status": 1,
  "createAt": "تاريخ الإنشاء",
  "updatedAt": "تاريخ التحديث"
}
```

## API Endpoints

### أنواع الأنشطة
- `GET /typeOfActivities/all` - جلب جميع أنواع الأنشطة مع pagination
- `POST /typeOfActivities` - إنشاء نوع نشاط جديد
- `PATCH /typeOfActivities/{id}` - تحديث نوع النشاط
- `DELETE /typeOfActivities/{id}` - حذف نوع النشاط

### القاعات
- `GET /Hall/all` - جلب جميع القاعات مع filters و pagination
- `POST /hall` - إنشاء قاعة جديدة
- `PATCH /hall/{id}` - تحديث القاعة
- `POST /hall/{id}/block` - حظر/إلغاء حظر القاعة

## التثبيت والتشغيل

1. **تثبيت المتطلبات:**
```bash
npm install
```

2. **إعداد المتغيرات البيئية:**
```bash
cp env.template .env
# تعديل VITE_API_URL في ملف .env
```

3. **تشغيل التطبيق:**
```bash
npm run dev
```

4. **بناء التطبيق للإنتاج:**
```bash
npm run build
```

## التقنيات المستخدمة

- **Frontend**: Vue 3 + Composition API
- **UI Framework**: Vuetify 3
- **Styling**: Tailwind CSS
- **TypeScript**: دعم كامل للأنواع
- **Routing**: Vue Router 4
- **State Management**: Pinia
- **HTTP Client**: Axios

## هيكل المشروع

```
src/
├── components/          # المكونات المشتركة
│   └── AppLayout.vue   # التخطيط الرئيسي
├── views/              # صفحات التطبيق
│   ├── Dashboard.vue   # لوحة التحكم
│   ├── Halls.vue       # إدارة القاعات
│   ├── ReservationTypes.vue # إدارة أنواع الأنشطة
│   ├── Activities.vue  # إدارة الأنشطة
│   └── Users.vue       # إدارة المستخدمين
├── services/           # خدمات API
│   └── api.ts         # تعريفات API
├── stores/             # إدارة الحالة
│   └── auth.ts        # متجر المصادقة
├── types/              # تعريفات TypeScript
│   └── index.ts       # الأنواع الرئيسية
└── router/             # إعدادات التوجيه
    └── index.ts       # تعريفات المسارات
```

## المسارات المتاحة

- `/` → `/dashboard` - لوحة التحكم
- `/halls` - إدارة القاعات
- `/reservation-types` - إدارة أنواع الأنشطة
- `/activities` - إدارة الأنشطة
- `/users` - إدارة المستخدمين
- `/login` - صفحة تسجيل الدخول

## المطورون

تم تطوير هذا النظام باستخدام أحدث التقنيات وأفضل الممارسات في تطوير تطبيقات الويب.
