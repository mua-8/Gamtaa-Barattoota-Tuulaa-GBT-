/**
 * Gallery demo data.
 *
 * Phase 2 note: swap for a Supabase Storage-backed `gallery_items` table.
 * Keep the same shape; `src` becomes the public Storage URL.
 */

export const GALLERY_CATEGORIES = [
  "Education",
  "Community Service",
  "Training",
  "Events",
  "Youth Activities",
  "Tolerance Programs",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  caption: string;
  category: GalleryCategory;
  date: string;
  location: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g1",
    src: "/images/hero-students.jpg",
    alt: "GBT student volunteers lined up outdoors while an organizer hands over documents",
    caption: "Volunteer welcome and briefing on the opening day of summer service",
    category: "Events",
    date: "July 2026",
    location: "Tuulaa, Oromia",
  },
  {
    id: "g13",
    src: "/images/volunteers-selfie.jpg",
    alt: "Volunteers posing for a group selfie holding completion certificates under trees",
    caption: "Certificate day — volunteers celebrate finishing orientation training",
    category: "Youth Activities",
    date: "August 2026",
    location: "Tuulaa, Oromia",
  },
  {
    id: "g2",
    src: "/images/programs/summer-school-real.jpg",
    alt: "Student teacher writing on a chalkboard in a rural classroom",
    caption: "Morning mathematics class at the Tuulaa Summer School",
    category: "Education",
    date: "July 2026",
    location: "Tuulaa Primary School",
  },
  {
    id: "g3",
    src: "/images/gallery/library.jpg",
    alt: "Children reading at desks in a small rural reading room",
    caption: "Homework Circles reading afternoon with grade 3 and 4 students",
    category: "Education",
    date: "February 2026",
    location: "Tuulaa reading room",
  },
  {
    id: "g4",
    src: "/images/programs/community-service-real.jpg",
    alt: "A GBT volunteer writing on a chalkboard while students follow attentively",
    caption: "Green Roots and classroom learning support day",
    category: "Community Service",
    date: "April 2026",
    location: "Tuulaa town park",
  },
  {
    id: "g5",
    src: "/images/programs/digital-literacy-real.jpg",
    alt: "Young students working on learning assignments at classroom desks",
    caption: "Digital Horizons and skills learning session",
    category: "Youth Activities",
    date: "September 2025",
    location: "Tuulaa community hall",
  },
  {
    id: "g6",
    src: "/images/gallery/training.jpg",
    alt: "Facilitator leading a workshop with participants raising hands",
    caption: "Volunteer teacher training before the summer school opens",
    category: "Training",
    date: "June 2026",
    location: "Tuulaa, Oromia",
  },
  {
    id: "g7",
    src: "/images/gallery/events.jpg",
    alt: "A lively community gathering with dancing and traditional dress",
    caption: "Closing ceremony cultural evening with the whole community",
    category: "Events",
    date: "August 2025",
    location: "Tuulaa, Oromia",
  },
  {
    id: "g8",
    src: "/images/programs/mentorship-real.jpg",
    alt: "GBT instructor mentoring students in a classroom session",
    caption: "Bridge to University mentorship and guidance session",
    category: "Events",
    date: "March 2026",
    location: "Near Tuulaa",
  },
  {
    id: "g9",
    src: "/images/gallery/youth-activities.jpg",
    alt: "Teenagers playing a friendly football match at dusk",
    caption: "Youth camp friendly match — teamwork beyond the classroom",
    category: "Youth Activities",
    date: "December 2025",
    location: "Tuulaa field",
  },
  {
    id: "g10",
    src: "/images/programs/youth-empowerment.jpg",
    alt: "A young woman presenting during a youth leadership workshop",
    caption: "Young Leaders Workshop: participants pitch community projects",
    category: "Youth Activities",
    date: "December 2025",
    location: "Tuulaa, Oromia",
  },
  {
    id: "g11",
    src: "/images/programs/tolerance-real.jpg",
    alt: "Young people seated closely during a classroom dialogue session",
    caption: "Bridges of Tolerance dialogue circle with students",
    category: "Tolerance Programs",
    date: "August 2026",
    location: "Tuulaa secondary school",
  },
  {
    id: "g12",
    src: "/images/about-founding.jpg",
    alt: "Founding student volunteers standing together on a campus lawn",
    caption: "The founding cohort, reunited on campus before summer service",
    category: "Events",
    date: "June 2026",
    location: "Jimma University",
  },
];
