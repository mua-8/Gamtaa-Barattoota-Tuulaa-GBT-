export interface FounderData {
  id?: string;
  name: string;
  position: string;
  photo_url: string;
  intro: string;
  bio: string;
  university?: string;
  department?: string;
  is_active: boolean;
}

export function parseTeamMember(row: any) {
  if (!row) return null;
  const isFounder =
    row.member_type === "founder" ||
    (row.position && row.position.trim().toLowerCase() === "founder") ||
    row.display_order === -999;

  let intro = row.intro || "";
  let bio = row.bio || "";
  let department = row.department || "";

  // Fallback unpacking if schema migration has not been run in PostgreSQL
  if ((!intro || !bio) && row.department && row.department.startsWith("{")) {
    try {
      const parsed = JSON.parse(row.department);
      intro = parsed.intro || intro;
      bio = parsed.bio || bio;
      department = parsed.department || "";
    } catch {
      // not json, leave department as is
    }
  }

  return {
    ...row,
    member_type: isFounder ? ("founder" as const) : ("program_team" as const),
    intro,
    bio,
    department,
  };
}
