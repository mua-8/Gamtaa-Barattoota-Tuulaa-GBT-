-- ============================================================================
-- GBT seed data — demo programs for the student portal.
-- Run AFTER the migrations (as superuser / service role).
-- ============================================================================

insert into public.programs
  (title, slug, description, category, start_date, end_date, location,
   target_audience, objectives, requirements, status)
values
  (
    'Tuulaa Summer School 2026',
    'tuulaa-summer-school-2026',
    'Six weeks of free academic support in mathematics, science, and English for primary and secondary students around Tuulaa.',
    'Education',
    '2026-07-06', '2026-08-14', 'Tuulaa, Oromia',
    'Primary & secondary students',
    array['Prevent summer learning loss', 'Build study habits', 'Support exam preparation'],
    array['Attend the orientation day', 'Commit to at least 3 weeks', 'Follow the safeguarding guidelines'],
    'active'
  ),
  (
    'Bridge to University Mentorship',
    'bridge-to-university-2026',
    'One-on-one mentorship for grade 11–12 students on university preparation, careers, and study skills.',
    'Mentorship',
    '2026-08-01', '2026-12-20', 'Tuulaa & nearby towns',
    'Grade 11–12 students',
    array['Guide university and career decisions', 'Share study skills', 'Grow future volunteers'],
    array['Be a registered university student', 'Attend mentor training'],
    'active'
  ),
  (
    'Digital Horizons Literacy Lab',
    'digital-horizons-2026',
    'Hands-on computer and internet training for students and community members, including online safety.',
    'Digital Literacy',
    '2026-09-07', '2026-09-25', 'Tuulaa community hall',
    'Students & community members',
    array['Teach foundational computer skills', 'Introduce online learning', 'Promote internet safety'],
    array['Basic computer literacy helpful', 'Commit to the full lab schedule'],
    'upcoming'
  ),
  (
    'Green Roots Service Week',
    'green-roots-2026',
    'A community work week: cleanups, tree planting, and small development projects chosen with residents.',
    'Community Service',
    '2026-10-05', '2026-10-09', 'Tuulaa kebeles',
    'All volunteers',
    array['Deliver visible community projects', 'Model volunteering'],
    array['Physical readiness for outdoor work'],
    'upcoming'
  ),
  (
    'Bridges of Tolerance Dialogue Series',
    'bridges-of-tolerance-2026',
    'Facilitated youth dialogues and cultural evenings promoting respect and peaceful coexistence.',
    'Tolerance & Peace',
    '2026-08-17', '2026-08-21', 'Schools & community centers',
    'Youth (grade 9–12)',
    array['Promote dialogue and respect', 'Build friendships across communities'],
    array['Attend facilitator briefing'],
    'completed'
  )
on conflict (slug) do nothing;
