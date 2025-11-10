import ResidentLayout from "./ResidentLayout";
import ScheduleForm from "./sections/ScheduleForm";

export default function Schedule() {
  return (
    <ResidentLayout title="MY SCHEDULE">
      <ScheduleForm />
    </ResidentLayout>
  );
}