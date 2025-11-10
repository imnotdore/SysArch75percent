import ResidentLayout from "./ResidentLayout";
import ComputerBorrowingForm from "./sections/ComputerBorrowingForm";

export default function ComputerBorrowing() {
  return (
    <ResidentLayout title="Computer Borrowing">
      <ComputerBorrowingForm />
    </ResidentLayout>
  );
}