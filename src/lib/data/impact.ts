/**
 * Impact statistics, chart datasets, and stories (demo data).
 *
 * Phase 2 note: replace with Supabase aggregation queries over
 * `programs`, `volunteers`, and `impact_reports` tables returning
 * the same shapes.
 */

export interface ImpactStat {
  label: string;
  value: number;
  suffix: string;
  description: string;
}

export const IMPACT_STATS: ImpactStat[] = [
  {
    label: "Student Volunteers",
    value: 340,
    suffix: "+",
    description: "University students serving during holidays",
  },
  {
    label: "Communities Served",
    value: 24,
    suffix: "+",
    description: "Kebeles and towns across the region",
  },
  {
    label: "Students Reached",
    value: 4820,
    suffix: "+",
    description: "Younger students taught, mentored, and trained",
  },
  {
    label: "Programs Delivered",
    value: 18,
    suffix: "+",
    description: "Education, service, and youth initiatives",
  },
  {
    label: "Volunteer Hours",
    value: 8450,
    suffix: "+",
    description: "Hours contributed since 2021",
  },
];

export const IMPACT_DETAIL_STATS: ImpactStat[] = [
  {
    label: "Volunteers",
    value: 340,
    suffix: "+",
    description: "Registered university student volunteers",
  },
  {
    label: "Communities Served",
    value: 24,
    suffix: "+",
    description: "Communities with active GBT initiatives",
  },
  {
    label: "Schools Reached",
    value: 32,
    suffix: "",
    description: "Partner primary and secondary schools",
  },
  {
    label: "Students Taught",
    value: 4820,
    suffix: "+",
    description: "Students in classes, mentorship, and trainings",
  },
  {
    label: "Programs Completed",
    value: 18,
    suffix: "+",
    description: "Programs delivered since founding",
  },
  {
    label: "Volunteer Hours",
    value: 8450,
    suffix: "+",
    description: "Documented hours of community service",
  },
];

/** Students reached per year (demo dataset for the bar chart). */
export const STUDENTS_PER_YEAR = [
  { year: "2021", value: 210 },
  { year: "2022", value: 480 },
  { year: "2023", value: 760 },
  { year: "2024", value: 1050 },
  { year: "2025", value: 1420 },
  { year: "2026", value: 900 },
];

/** Volunteer hours by program area (demo dataset for the donut chart). */
export const HOURS_BY_AREA = [
  { label: "Free Education", value: 3100, color: "var(--chart-1)" },
  { label: "Mentorship", value: 1900, color: "var(--chart-2)" },
  { label: "Community Service", value: 1600, color: "var(--chart-3)" },
  { label: "Digital Literacy", value: 950, color: "var(--chart-4)" },
  { label: "Tolerance & Youth", value: 900, color: "var(--chart-5)" },
];

/** Active volunteers per year (demo dataset for the area chart). */
export const VOLUNTEERS_PER_YEAR = [
  { year: "2021", value: 28 },
  { year: "2022", value: 65 },
  { year: "2023", value: 120 },
  { year: "2024", value: 190 },
  { year: "2025", value: 265 },
  { year: "2026", value: 340 },
];

export interface ImpactStory {
  id: string;
  title: string;
  community: string;
  program: string;
  description: string;
  image: string;
  imageAlt: string;
}

export const IMPACT_STORIES: ImpactStory[] = [
  {
    id: "classroom-under-eucalyptus",
    title: "A Classroom Under the Eucalyptus Trees",
    community: "Tuulaa",
    program: "Tuulaa Summer School",
    description:
      "When the school compound was under renovation, volunteers moved grade 5 math under the trees. Forty-one students sat on borrowed mats every morning — and 38 of them passed the regional assessment that autumn.",
    image: "/images/programs/summer-education.jpg",
    imageAlt: "Students learning in a simple rural classroom",
  },
  {
    id: "first-generation-first-degree",
    title: "First Generation, First Degree",
    community: "West Shewa",
    program: "Bridge to University Mentorship",
    description:
      "Meron was the first in her family to consider university. Her GBT mentor helped her plan, prepare, and believe. In 2025 she enrolled to study agriculture — and last summer she returned as a mentor herself.",
    image: "/images/programs/mentorship.jpg",
    imageAlt: "A mentor guiding secondary students under a tree",
  },
  {
    id: "village-logs-on",
    title: "The Village That Learned to Log On",
    community: "Tuulaa kebele 03",
    program: "Digital Horizons Literacy Lab",
    description:
      "Sixty residents, aged 12 to 62, completed their first computer course at the community hall. Three students now help run the hall's small open-access corner on market days.",
    image: "/images/programs/digital-literacy.jpg",
    imageAlt: "Learners practicing on laptops during a training",
  },
];
