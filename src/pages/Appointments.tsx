import AppointmentDetails from "@/components/AppointmentDetails";
import { PageHeader } from "@/components/PageHeader";

const Appointments = () => {
  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <PageHeader 
        title="Gestão de Agendamentos"
        description="Visualize e gerencie todos os agendamentos"
        showBack={false}
      />
      <AppointmentDetails onBack={() => {}} />
    </div>
  );
};

export default Appointments;
