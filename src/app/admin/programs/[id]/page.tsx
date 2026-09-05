import { redirect } from "next/navigation";

export default async function AdminProgramDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  redirect(`/admin/programs/${id}/edit`);
}
