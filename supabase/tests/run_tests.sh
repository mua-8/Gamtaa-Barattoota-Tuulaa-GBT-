#!/usr/bin/env bash
# ============================================================================
# GBT Phase 2 — database & RLS verification.
# Executes the real migration against a local Postgres with a Supabase-stub
# harness, then asserts ownership/RLS behavior for student, anon, admin and
# service_role sessions.
# ============================================================================
set -u

A=11111111-1111-1111-1111-111111111111
B=22222222-2222-2222-2222-222222222222
SPA=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
SPB=bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
DB=gbt_test
HERE="$(cd "$(dirname "$0")" && pwd)"

PASS=0; FAIL=0
ok()  { echo "PASS: $1"; PASS=$((PASS+1)); }
bad() { echo "FAIL: $1"; FAIL=$((FAIL+1)); }
expect_eq() { # desc expected actual
  if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 — expected [$2], got [$3]"; fi
}
expect_err() { # desc sql
  if sudo -u postgres psql -X -v ON_ERROR_STOP=1 -qtA -d "$DB" >/dev/null 2>&1 <<SQL
$2
SQL
  then bad "$1 — statement succeeded but should have been denied"; else ok "$1"; fi
}
as_role() { # role uuid sql -> stdout (last line only)
  sudo -u postgres psql -X -v ON_ERROR_STOP=1 -qtA -d "$DB" <<SQL | tail -n 1
set role $1;
select set_config('request.jwt.claim.sub', '$2', false);
$3
SQL
}

echo "== Setting up test database =="
sudo -u postgres psql -X -qtA -d postgres -c "drop database if exists $DB" -c "create database $DB" || exit 1
sudo -u postgres psql -X -v ON_ERROR_STOP=1 -qtA -d "$DB" < "$HERE/harness.sql" || exit 1
echo "== Running real migration 0001_initial_schema.sql =="
sudo -u postgres psql -X -v ON_ERROR_STOP=1 -qtA -d "$DB" < "$HERE/../migrations/0001_initial_schema.sql" || { echo "MIGRATION FAILED"; exit 1; }
echo "== Running real migration 0002_student_portal.sql =="
sudo -u postgres psql -X -v ON_ERROR_STOP=1 -qtA -d "$DB" < "$HERE/../migrations/0002_student_portal.sql" || { echo "MIGRATION 0002 FAILED"; exit 1; }
# Supabase projects grant anon SELECT on public tables by default; RLS does
# the row filtering. Emulate that default for the harness.
sudo -u postgres psql -X -qtA -d "$DB" -c "grant select on all tables in schema public to anon" || exit 1

echo "== Seeding auth users =="
sudo -u postgres psql -X -v ON_ERROR_STOP=1 -qtA -d "$DB" <<SQL || exit 1
insert into auth.users (id, email, raw_user_meta_data) values
  ('$A', 'a@student.test', '{"full_name":"User A","phone":"+251911111111"}'),
  ('$B', 'b@student.test', '{"full_name":"User B","phone":"+251922222222"}');
SQL

echo "== Schema & trigger checks =="
expect_eq "signup trigger creates profile rows" "2" \
  "$(sudo -u postgres psql -X -qtA -d $DB -c "select count(*) from public.profiles")"
expect_eq "new profiles default to student role" "student" \
  "$(sudo -u postgres psql -X -qtA -d $DB -c "select role from public.profiles where id='$A'")"

echo "== Student data privacy (RLS) =="
expect_eq "student A sees only own profile" "1" \
  "$(as_role authenticated $A "select count(*) from public.profiles")"
expect_eq "student A's visible profile is own" "$A" \
  "$(as_role authenticated $A "select id from public.profiles")"
expect_eq "anon sees zero profiles" "0" \
  "$(as_role anon 00000000-0000-0000-0000-000000000000 "select count(*) from public.profiles")"
expect_eq "anon sees zero student_profiles" "0" \
  "$(as_role anon 00000000-0000-0000-0000-000000000000 "select count(*) from public.student_profiles")"
expect_eq "anon sees zero applications" "0" \
  "$(as_role anon 00000000-0000-0000-0000-000000000000 "select count(*) from public.applications")"

echo "== Student writes own data =="
as_role authenticated $A "insert into public.student_profiles (id, profile_id, university, department) values ('$SPA','$A','Jimma University','Civil Engineering');" >/dev/null \
  && ok "student A inserts own student_profile" || bad "student A inserts own student_profile"
as_role authenticated $B "insert into public.student_profiles (id, profile_id, university) values ('$SPB','$B','Haramaya University');" >/dev/null \
  && ok "student B inserts own student_profile" || bad "student B inserts own student_profile"
as_role authenticated $A "insert into public.student_skills (student_profile_id, skill) values ('$SPA','Teaching');" >/dev/null \
  && ok "student A inserts own skill" || bad "student A inserts own skill"

APP_NUM="$(as_role authenticated $A "insert into public.applications (student_profile_id, motivation) values ('$SPA','I want to serve') returning application_number")"
if [[ "$APP_NUM" =~ ^GBT-APP-2026-[0-9]{4}$ ]]; then ok "application number format ($APP_NUM)"; else bad "application number format — got [$APP_NUM]"; fi
expect_eq "sequence increments" "GBT-APP-2026-0002" \
  "$(as_role authenticated $B "insert into public.applications (student_profile_id, motivation) values ('$SPB','me too') returning application_number")"
expect_eq "student sees own application only" "1" \
  "$(as_role authenticated $A "select count(*) from public.applications")"

echo "== Cross-student access denied =="
expect_eq "A sees zero of B's student_profiles" "0" \
  "$(as_role authenticated $A "select count(*) from public.student_profiles where profile_id='$B'")"
expect_eq "A sees zero of B's applications" "0" \
  "$(as_role authenticated $A "select count(*) from public.applications where student_profile_id='$SPB'")"
expect_eq "A updating B's profile touches 0 rows" "0" \
  "$(as_role authenticated $A "with u as (update public.profiles set full_name='hax' where id='$B' returning 1) select count(*) from u")"
expect_err "A cannot insert application for B" \
  "set role authenticated; select set_config('request.jwt.claim.sub','$A',false); insert into public.applications (student_profile_id, motivation) values ('$SPB','steal');"
expect_err "A cannot insert skill for B" \
  "set role authenticated; select set_config('request.jwt.claim.sub','$A',false); insert into public.student_skills (student_profile_id, skill) values ('$SPB','Hacking');"
expect_eq "A updating B's student_profile touches 0 rows" "0" \
  "$(as_role authenticated $A "with u as (update public.student_profiles set university='hax' where id='$SPB' returning 1) select count(*) from u")"
expect_err "student cannot self-approve application" \
  "set role authenticated; select set_config('request.jwt.claim.sub','$A',false); insert into public.applications (student_profile_id, motivation, status) values ('$SPA','x','approved');"
expect_err "student cannot self-escalate role" \
  "set role authenticated; select set_config('request.jwt.claim.sub','$A',false); update public.profiles set role='admin' where id='$A';"

echo "== contact_messages: service role only =="
expect_err "anon cannot insert contact message" \
  "set role anon; insert into public.contact_messages (name,email,subject,message) values ('x','x@x.test','s','m');"
expect_err "authenticated cannot insert contact message" \
  "set role authenticated; select set_config('request.jwt.claim.sub','$A',false); insert into public.contact_messages (name,email,subject,message) values ('x','x@x.test','s','m');"
as_role service_role 00000000-0000-0000-0000-000000000000 "insert into public.contact_messages (name,email,subject,message) values ('Visitor','v@x.test','Hello','Testing');" >/dev/null \
  && ok "service role inserts contact message" || bad "service role inserts contact message"
expect_eq "student sees zero contact messages (RLS-filtered)" "0" \
  "$(as_role authenticated $A "select count(*) from public.contact_messages")"

echo "== Storage policies =="
as_role authenticated $A "insert into storage.objects (bucket_id,name,owner) values ('avatars','$A/me.jpg','$A');" >/dev/null \
  && ok "A uploads avatar into own folder" || bad "A uploads avatar into own folder"
expect_err "A cannot upload into B's avatar folder" \
  "set role authenticated; select set_config('request.jwt.claim.sub','$A',false); insert into storage.objects (bucket_id,name,owner) values ('avatars','$B/evil.jpg','$A');"
expect_err "student cannot write gallery bucket" \
  "set role authenticated; select set_config('request.jwt.claim.sub','$A',false); insert into storage.objects (bucket_id,name,owner) values ('gallery','pic.jpg','$A');"
expect_eq "anon can read public avatar" "1" \
  "$(as_role anon 00000000-0000-0000-0000-000000000000 "select count(*) from storage.objects where bucket_id='avatars'")"

echo "== Admin capabilities =="
sudo -u postgres psql -X -qtA -d "$DB" -c "update public.profiles set role='admin' where id='$A'" >/dev/null
expect_eq "admin sees all student_profiles" "2" \
  "$(as_role authenticated $A "select count(*) from public.student_profiles")"
expect_eq "admin can review application" "approved" \
  "$(as_role authenticated $A "update public.applications set status='approved', reviewed_at=now(), reviewed_by='$A' where application_number='GBT-APP-2026-0001' returning status")"
expect_eq "admin can read contact messages" "1" \
  "$(as_role authenticated $A "select count(*) from public.contact_messages")"
expect_eq "student B still sees only own application" "1" \
  "$(as_role authenticated $B "select count(*) from public.applications")"

echo "== Phase 3: programs, participation, service records =="
P1=cccccccc-cccc-cccc-cccc-cccccccccccc
P2=dddddddd-dddd-dddd-dddd-dddddddddddd
P3=eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee
sudo -u postgres psql -X -v ON_ERROR_STOP=1 -qtA -d "$DB" <<SQL >/dev/null || exit 1
insert into public.programs (id,title,slug,status) values
  ('$P1','Summer School 2026','summer-school-2026','active'),
  ('$P2','Digital Horizons','digital-horizons','upcoming'),
  ('$P3','Secret Draft','secret-draft','draft');
SQL
# Note: A was promoted to admin in the Phase 2 section; B stays a student.
expect_eq "admin sees drafts too" "3" \
  "$(as_role authenticated $A "select count(*) from public.programs")"
expect_eq "student sees published programs only" "2" \
  "$(as_role authenticated $B "select count(*) from public.programs")"
expect_err "student cannot create programs" \
  "set role authenticated; select set_config('request.jwt.claim.sub','$B',false); insert into public.programs (title,slug) values ('x','x');"
as_role authenticated $B "insert into public.program_participants (program_id, student_id) values ('$P1','$B');" >/dev/null \
  && ok "B joins a program (registered)" || bad "B joins a program (registered)"
expect_err "A cannot enroll B into a program" \
  "set role authenticated; select set_config('request.jwt.claim.sub','$A',false); insert into public.program_participants (program_id, student_id) values ('$P2','$B');"
expect_err "student cannot self-activate enrollment" \
  "set role authenticated; select set_config('request.jwt.claim.sub','$B',false); insert into public.program_participants (program_id, student_id, status) values ('$P2','$B','active');"
as_role authenticated $B "insert into public.service_records (student_id, program_id, activity, hours) values ('$B','$P1','Taught grade 8 math',4);" >/dev/null \
  && ok "B submits pending service record" || bad "B submits pending service record"
expect_err "student cannot submit pre-verified record" \
  "set role authenticated; select set_config('request.jwt.claim.sub','$B',false); insert into public.service_records (student_id, program_id, activity, hours, verification_status) values ('$B','$P1','x',2,'verified');"
expect_err "student cannot self-verify (no UPDATE grant)" \
  "set role authenticated; select set_config('request.jwt.claim.sub','$B',false); update public.service_records set verification_status='verified' where student_id='$B';"
expect_eq "verified hours are 0 before verification" "0" \
  "$(as_role authenticated $B "select public.my_verified_hours()")"
sudo -u postgres psql -X -qtA -d "$DB" -c "insert into public.service_records (student_id, program_id, activity, hours) values ('$A','$P1','Mentoring circle',2)" >/dev/null
expect_eq "B cannot read A's service records" "0" \
  "$(as_role authenticated $B "select count(*) from public.service_records where student_id='$A'")"
sudo -u postgres psql -X -qtA -d "$DB" -c "update public.program_participants set status='accepted' where program_id='$P1' and student_id='$B'" >/dev/null
expect_eq "enrollment acceptance notified the student" "1" \
  "$(as_role authenticated $B "select count(*) from public.notifications where type='program'")"
sudo -u postgres psql -X -qtA -d "$DB" -c "update public.service_records set verification_status='verified', verified_by='$A', verified_at=now() where student_id='$B'" >/dev/null
expect_eq "verified hours computed automatically" "4.00" \
  "$(as_role authenticated $B "select public.my_verified_hours()")"
expect_eq "verification created a notification" "1" \
  "$(as_role authenticated $B "select count(*) from public.notifications where type='service'")"

echo "== Phase 3: notifications & certificates =="
# B's application was never reviewed, so this is exactly one decision event.
sudo -u postgres psql -X -qtA -d "$DB" -c "update public.applications set status='approved', reviewed_at=now(), reviewed_by='$A' where student_profile_id='$SPB'" >/dev/null
expect_eq "application decision created a notification" "1" \
  "$(as_role authenticated $B "select count(*) from public.notifications where type='application'")"
CERT_NUM="$(sudo -u postgres psql -X -qtA -d "$DB" -c "insert into public.certificates (student_id, program_id, service_hours) values ('$A','$P1',72) returning certificate_number")"
if [[ "$CERT_NUM" =~ ^GBT-CERT-2026-[0-9]{4}$ ]]; then ok "certificate number format ($CERT_NUM)"; else bad "certificate number format — got [$CERT_NUM]"; fi
expect_eq "certificate issuance notified the student" "1" \
  "$(as_role authenticated $A "select count(*) from public.notifications where type='certificate'")"
expect_eq "A sees own certificate" "1" \
  "$(as_role authenticated $A "select count(*) from public.certificates")"
expect_eq "B sees zero of A's certificates" "0" \
  "$(as_role authenticated $B "select count(*) from public.certificates")"
expect_eq "student can mark own notifications read" "2" \
  "$(as_role authenticated $A "with u as (update public.notifications set read=true where user_id='$A' returning 1) select count(*) from u")"
expect_eq "student cannot touch other users' notifications" "0" \
  "$(as_role authenticated $A "with u as (update public.notifications set read=false where user_id='$B' returning 1) select count(*) from u")"

echo
echo "==================== RESULT: $PASS passed, $FAIL failed ===================="
[ "$FAIL" -eq 0 ]
