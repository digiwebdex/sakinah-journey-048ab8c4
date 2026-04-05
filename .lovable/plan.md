
## Full CMS Audit Results

### ✅ Already Dynamic (CMS-Managed via Admin Panel)
These are ALL editable from admin → CMS page:

| Section | Status | Admin Control |
|---------|--------|--------------|
| Hero Section | ✅ Dynamic | Badge, headings, CTAs, stats (bilingual) |
| Navbar | ✅ Dynamic | Company name, tagline, phone, nav links |
| Services | ✅ Dynamic | Label, heading, items with icons (bilingual repeater) |
| About | ✅ Dynamic | Label, heading, description, reasons (bilingual repeater) |
| Packages | ✅ Dynamic | Label, heading, description, button texts |
| Facilities | ✅ Dynamic | Label, heading, items (bilingual repeater) |
| Gallery | ✅ Dynamic | Label, heading, items (image/video repeater) |
| Guidelines | ✅ Dynamic | Label, heading, steps, dos/don'ts |
| Video Guide | ✅ Dynamic | Label, heading, video tutorials repeater |
| Testimonials | ✅ Dynamic | Label, heading, review items repeater |
| Contact | ✅ Dynamic | Phone, email, location, hours, form services |
| WhatsApp | ✅ Dynamic | Phone, message, button text |
| Footer | ✅ Dynamic | Company name, tagline, description, phone, email, address, social URLs, services list, developer info |
| Privacy Policy | ✅ Dynamic | Title, sections (heading+body repeater) |
| Terms & Conditions | ✅ Dynamic | Title, sections repeater |
| Refund Policy | ✅ Dynamic | Title, sections repeater |

### ✅ Already Dynamic (Admin Settings)
| Feature | Status |
|---------|--------|
| Section Show/Hide | ✅ Section Visibility Manager |
| Menu Show/Hide | ✅ Menu Visibility Manager |
| PDF/Invoice Branding | ✅ PDF Company Settings |
| SEO Meta Tags | ✅ SEO Settings Page |
| Notification Events | ✅ Notification Settings |
| Packages CRUD | ✅ Admin Packages Page |
| Hotels CRUD | ✅ Admin Hotels Page |
| Blog Posts CRUD | ✅ CMS Blog Manager |
| User Management | ✅ Admin User Manager |
| Version History | ✅ CMS Version History |

### 🔴 Remaining Gaps (What's Still Hardcoded)

1. **Hero Slider Images** - 3 images imported from JS assets, not admin-uploadable
2. **Footer Journey Banner** - Image hardcoded from assets
3. **Logo** - File-based import, not admin-changeable
4. **Favicon** - Hardcoded in index.html
5. **Quranic Verse Arabic Text** - Hardcoded in HeroSection
6. **Footer Journey Section Text** - Hardcoded Bengali/English text
7. **Contact Form Service Dropdown** - Uses i18n translations, not CMS
8. **Hero Slide Images** - No admin upload for slider backgrounds

### 📋 Plan to Close Remaining Gaps

**Phase 1: Make Hero Slider Images Admin-Managed**
- Add `hero_slides` field to hero CMS section (with image URL + alt text)
- Frontend reads slide images from CMS, falls back to defaults

**Phase 2: Make Footer Journey Banner Admin-Managed**
- Add journey banner fields to footer CMS (image URL, texts)
- Frontend reads from CMS

**Phase 3: Make Quranic Verse Fully CMS-Managed**
- The hero CMS already has `quran_arabic`, `quran_translation`, `quran_reference` fields
- But the HeroSection component doesn't read them - wire it up

**Phase 4: Make Contact Form Services CMS-Driven**
- The contact CMS already has `form_services` field
- Wire the contact form dropdown to use it

**Phase 5: Logo/Favicon Note**
- Logo and favicon require file uploads - currently the admin can't upload new logos
- This would need a file upload UI in admin settings + storage integration
- Mark as "needs admin file upload feature"

### Decision Needed
Should I proceed with closing all remaining gaps (Phases 1-4)?
Phase 5 (logo/favicon upload) requires more significant infrastructure work.
