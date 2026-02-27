

## Plan: Create Image & Video Gallery Section

### Overview
Add a new "Gallery" section to the homepage showcasing the uploaded Hajj/Umrah trip photos and videos in an attractive grid layout with lightbox modal viewing.

### Assets to Copy
- 6 images → `public/gallery/` directory
- 2 videos → `public/gallery/` directory

### New Component: `src/components/GallerySection.tsx`
- Grid layout with images and videos mixed together
- Thumbnail view with hover effects (play icon overlay for videos)
- Click to open fullscreen lightbox modal
- Navigate between items in modal (prev/next)
- Bilingual labels (Bengali/English) using LanguageContext
- Framer Motion animations consistent with other sections
- Videos play inline in the modal with controls

### Layout
- Section title: "আমাদের গ্যালারি" / "Our Gallery"
- Subtitle describing the travel memories
- Responsive grid: 2 cols mobile, 3 cols tablet, 4 cols desktop
- Masonry-style or uniform aspect-ratio thumbnails

### Homepage Integration
- Add `<GallerySection />` to `Index.tsx` between `VideoGuideSection` and `AboutSection`

### Implementation Steps
1. Copy all 6 images and 2 videos to `public/gallery/`
2. Create `GallerySection.tsx` component with grid + lightbox modal
3. Add the section to `Index.tsx`

