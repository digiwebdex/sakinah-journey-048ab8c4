

## Plan: Admin Banner Image Upload System

### Current State
- Hero section reads slides from CMS (`site_content` table, `hero` section, `hero_slides` array)
- Each slide has `src` (desktop image URL) and `mobile_src` (mobile image URL) fields
- Currently admins type URLs manually in text inputs — no file upload capability
- A `company-assets` storage bucket already exists (public)
- `HotelImageUpload` component exists as a reference pattern for Supabase storage uploads

### What Will Be Built

A dedicated **Banner Image Upload** system in the CMS editor that replaces the manual URL text fields for `hero_slides` with proper file upload fields showing recommended sizes.

### Changes

**1. Create `src/components/admin/BannerImageUpload.tsx`**
- Reusable upload component (based on `HotelImageUpload` pattern)
- Uploads to `company-assets` bucket under `banners/` folder
- Shows image preview after upload
- Displays recommended size info (Desktop: 1920×700px, Mobile: 800×800px)
- Has clear/remove button

**2. Modify `src/components/AdminCmsEditor.tsx`**
- Update the `hero_slides` array field config to use a new field type `"image_upload"` for `src` and `mobile_src` fields
- Add `mobile_src` field to the `hero_slides` arrayFields config (currently only `src` and `alt`)
- In the render logic, when a field type is `"image_upload"`, render the `BannerImageUpload` component instead of a text input
- Each slide item will show:
  - Desktop banner upload (recommended: 1920×700px)
  - Mobile banner upload (recommended: 800×800px)  
  - Alt text field (text input)

**3. Update hero_slides field config** in `SECTION_CONFIG`:
```
arrayFields: [
  { key: "src", label: "Desktop Banner Image", type: "image_upload" },
  { key: "mobile_src", label: "Mobile Banner Image", type: "image_upload" },
  { key: "alt", label: "Alt Text", type: "text" },
]
```

### Technical Details
- Storage bucket: `company-assets` (already public)
- Upload path: `banners/desktop-{timestamp}.{ext}` and `banners/mobile-{timestamp}.{ext}`
- Max file size: 5MB
- Accepted formats: JPG, PNG, WebP
- The uploaded URL auto-populates the CMS field value, which saves to `site_content` table on "Save"
- `HeroSection.tsx` already reads `src` and `mobile_src` from CMS data — no changes needed there

### Files to Create/Modify
1. **Create**: `src/components/admin/BannerImageUpload.tsx`
2. **Modify**: `src/components/AdminCmsEditor.tsx` (add image_upload type + update hero_slides config)

