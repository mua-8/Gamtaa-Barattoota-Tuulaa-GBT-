/**
 * Team demo data.
 *
 * Phase 2 note: replace with a Supabase `team_members` table query that
 * returns the same `TeamMember` shape (photos from Supabase Storage).
 */

export type TeamGroup = "Program Team";

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  group: TeamGroup;
  university: string;
  department: string;
  bio: string;
  photo: string;
  socials: { label: string; href: string }[];
}

export const TEAM: TeamMember[] = [
  {
    id: "member-1",
    name: "Name Coming Soon",
    position: "Program Team Member",
    group: "Program Team",
    university: "University",
    department: "Department",
    bio: "Placeholder description for a program team member.",
    photo: "/images/team/member-4.jpg",
    socials: [
      { label: "LinkedIn", href: "#" },
      { label: "Email", href: "#" },
    ],
  },
  {
    id: "member-2",
    name: "Name Coming Soon",
    position: "Program Team Member",
    group: "Program Team",
    university: "University",
    department: "Department",
    bio: "Placeholder description for a program team member.",
    photo: "/images/team/member-5.jpg",
    socials: [
      { label: "LinkedIn", href: "#" },
      { label: "Email", href: "#" },
    ],
  },
  {
    id: "member-3",
    name: "Name Coming Soon",
    position: "Program Team Member",
    group: "Program Team",
    university: "University",
    department: "Department",
    bio: "Placeholder description for a program team member.",
    photo: "/images/team/member-6.jpg",
    socials: [
      { label: "LinkedIn", href: "#" },
      { label: "Email", href: "#" },
    ],
  },
  {
    id: "member-4",
    name: "Name Coming Soon",
    position: "Program Team Member",
    group: "Program Team",
    university: "University",
    department: "Department",
    bio: "Placeholder description for a program team member.",
    photo: "/images/team/member-7.jpg",
    socials: [
      { label: "LinkedIn", href: "#" },
      { label: "Email", href: "#" },
    ],
  },
];

export const TEAM_GROUPS: TeamGroup[] = [
  "Program Team",
];
