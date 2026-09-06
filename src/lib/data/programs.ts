/**
 * Program demo data.
 *
 * Phase 2 note: this module is the data-access seam. Replace the exported
 * arrays with Supabase queries (table `programs`) that return the same
 * `Program` shape — pages and components will not need to change.
 */

export const PROGRAM_CATEGORIES = [
  "Education",
  "Mentorship",
  "Digital Literacy",
  "Community Service",
  "Tolerance & Peace",
  "Youth Development",
] as const;

export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number];

export type ProgramStatus = "Active" | "Upcoming" | "Completed";

export interface Program {
  slug: string;
  title: string;
  category: ProgramCategory;
  shortDescription: string;
  description: string[];
  objectives: string[];
  location: string;
  date: string;
  status: ProgramStatus;
  image: string;
  imageAlt: string;
  participants: string;
}

export const PROGRAMS: Program[] = [
  {
    slug: "tuulaa-summer-school",
    title: "Tuulaa Summer School",
    category: "Education",
    shortDescription:
      "Free summer academic support in math, science, and English for primary and secondary students, taught by university student volunteers.",
    description: [
      "Every summer, GBT volunteers return home and open free classes for students who would otherwise have little academic support during the long holiday. Classes run for six weeks in partner school classrooms and community spaces around Tuulaa.",
      "Volunteer teachers prepare lessons together, follow the national curriculum, and focus on the subjects students struggle with most: mathematics, natural science, and English. Small group sizes and peer learning keep every student engaged.",
    ],
    objectives: [
      "Provide free tutoring in mathematics, science, and English",
      "Prevent summer learning loss for primary and secondary students",
      "Build study habits and confidence before the new school year",
    ],
    location: "Tuulaa, Oromia",
    date: "July – August 2026",
    status: "Active",
    image: "/images/programs/summer-school-real.jpg",
    imageAlt:
      "A GBT volunteer standing at a chalkboard teaching mathematics to students in a rural classroom",
    participants: "120 students · 18 volunteers",
  },
  {
    slug: "bridge-to-university",
    title: "Bridge to University Mentorship",
    category: "Mentorship",
    shortDescription:
      "University students mentor grade 11–12 students on university preparation, career choices, and study skills.",
    description: [
      "Bridge to University pairs secondary-school students with current university students from similar backgrounds. Mentors meet their mentees in person during the holiday and stay in touch through the school year.",
      "Conversations cover choosing a field of study, preparing for the university entrance examination, managing time, and building the confidence to aim higher. Many mentees become GBT volunteers themselves after joining university.",
    ],
    objectives: [
      "Guide students through university and career decisions",
      "Share practical study and examination skills",
      "Grow a pipeline of future student volunteers",
    ],
    location: "Tuulaa & nearby towns, Oromia",
    date: "Year-round · holiday intensives",
    status: "Active",
    image: "/images/programs/mentorship-real.jpg",
    imageAlt:
      "Instructor in white shirt engaging and mentoring students in a classroom session",
    participants: "85 mentees · 40 mentors",
  },
  {
    slug: "digital-horizons",
    title: "Digital Horizons Literacy Lab",
    category: "Digital Literacy",
    shortDescription:
      "Hands-on computer, internet, and safe-technology training for students and community members with little prior access.",
    description: [
      "Digital Horizons brings laptops, a portable projector, and patient volunteer trainers to schools and community halls. Beginners start with the keyboard and mouse and progress to documents, spreadsheets, email, and responsible internet use.",
      "The lab also introduces online learning resources so students can keep learning after the training ends, and covers internet safety for young users and their parents.",
    ],
    objectives: [
      "Teach foundational computer and internet skills",
      "Introduce free online learning resources",
      "Promote safe and responsible technology use",
    ],
    location: "Tuulaa community hall, Oromia",
    date: "September 2026",
    status: "Upcoming",
    image: "/images/programs/digital-literacy-real.jpg",
    imageAlt:
      "Students working at desks in a classroom with teacher supervising",
    participants: "60 learners · 10 trainers",
  },
  {
    slug: "green-roots-service-day",
    title: "Green Roots Community Service",
    category: "Community Service",
    shortDescription:
      "Volunteer work days for cleanups, tree planting, and small community-development projects organized with local residents.",
    description: [
      "Green Roots mobilizes students and residents to work side by side on projects the community chooses: cleaning shared spaces, planting trees, repairing school compounds, and supporting elderly residents.",
      "Each service day begins with a short briefing and ends with a shared meal, because the work is as much about relationships as it is about results.",
    ],
    objectives: [
      "Deliver visible, community-chosen improvement projects",
      "Model a culture of volunteering for younger students",
      "Strengthen bonds between students and residents",
    ],
    location: "Tuulaa & surrounding kebeles",
    date: "Every holiday season",
    status: "Active",
    image: "/images/programs/community-service-real.jpg",
    imageAlt:
      "A GBT volunteer writing on a chalkboard while students attentively follow the lesson",
    participants: "200+ volunteers per season",
  },
  {
    slug: "bridges-of-tolerance",
    title: "Bridges of Tolerance Dialogue Series",
    category: "Tolerance & Peace",
    shortDescription:
      "Facilitated dialogues, games, and cultural evenings that promote respect, peaceful coexistence, and social harmony among youth.",
    description: [
      "Bridges of Tolerance creates safe spaces where young people from different backgrounds listen to one another. Trained student facilitators lead structured dialogues, cooperative games, and cultural evenings.",
      "The series works with schools and religious and community institutions so that the conversations continue beyond our sessions.",
    ],
    objectives: [
      "Promote dialogue, respect, and peaceful coexistence",
      "Counter misinformation and prejudice among youth",
      "Build lasting friendships across communities",
    ],
    location: "Schools & community centers, Oromia",
    date: "August 2026",
    status: "Active",
    image: "/images/programs/tolerance-real.jpg",
    imageAlt:
      "Students sitting together at desks engaging during a GBT community learning session",
    participants: "150 participants · 12 facilitators",
  },
  {
    slug: "young-leaders-workshop",
    title: "Young Leaders Workshop",
    category: "Youth Development",
    shortDescription:
      "A leadership camp helping young people build skills, confidence, public speaking, and community-project planning ability.",
    description: [
      "The Young Leaders Workshop is a multi-day camp for motivated secondary students. Sessions cover leadership, communication, teamwork, goal setting, and how to design a small community project from idea to execution.",
      "Every participant leaves with a simple project plan and an invitation to join a GBT mentorship circle for follow-up support.",
    ],
    objectives: [
      "Develop leadership and communication skills",
      "Help youth design their own community projects",
      "Raise confidence and aspiration",
    ],
    location: "Tuulaa, Oromia",
    date: "December 2026",
    status: "Upcoming",
    image: "/images/programs/mentorship-real.jpg",
    imageAlt:
      "Young students attentively engaged in a classroom workshop session",
    participants: "70 youth · 15 facilitators",
  },
  {
    slug: "homework-circles",
    title: "Homework Circles",
    category: "Education",
    shortDescription:
      "Weekly peer-study circles where older students help younger students with homework and reading practice.",
    description: [
      "Homework Circles ran as a pilot during the 2025–26 school year: small groups met twice a week after school, guided by student volunteers, to complete homework and practice reading together.",
      "The pilot reached three kebeles and will return in an expanded form next school year.",
    ],
    objectives: [
      "Support daily learning outside the classroom",
      "Pair strong readers with emerging readers",
      "Engage parents in their children's education",
    ],
    location: "Three kebeles around Tuulaa",
    date: "October 2025 – June 2026",
    status: "Completed",
    image: "/images/programs/summer-school-real.jpg",
    imageAlt:
      "Children studying at desks in a classroom with volunteers assisting",
    participants: "90 students · 14 volunteers",
  },
  {
    slug: "career-guidance-caravan",
    title: "Career Guidance Caravan",
    category: "Mentorship",
    shortDescription:
      "A traveling career fair bringing professionals and university students to rural secondary schools.",
    description: [
      "The Career Guidance Caravan visited six secondary schools with short talks, Q&A sessions, and one-on-one advice from university students and young professionals who grew up in the area.",
      "Students learned what different careers involve, what subjects they require, and how to plan their path step by step.",
    ],
    objectives: [
      "Expose rural students to a wide range of careers",
      "Connect students with role models from similar backgrounds",
      "Support informed subject choices",
    ],
    location: "Six secondary schools, West Shewa",
    date: "March 2026",
    status: "Completed",
    image: "/images/programs/digital-literacy-real.jpg",
    imageAlt:
      "Students engaged in a learning and guidance session",
    participants: "6 schools · 700+ students reached",
  },
];

export function getProgramBySlug(slug: string): Program | undefined {
  return PROGRAMS.find((p) => p.slug === slug);
}
