import { ProgramForm } from "../program-form";

export const metadata = {
  title: "Create Program | GBT Admin",
};

export default function NewProgramPage() {
  return (
    <div className="space-y-6">
      <ProgramForm />
    </div>
  );
}
