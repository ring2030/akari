import { DemoBanner } from "@/components/DemoBanner";
import { MomentForm } from "@/components/MomentForm";
import { DEMO_RESIDENTS } from "@/lib/demo-ids";

export default function CaregiverMomentNewPage() {
  return (
    <main>
      <DemoBanner />
      <h1>出来事を残す</h1>
      <p className="muted">30 秒で、小さな出来事を残せます。</p>
      <MomentForm residents={DEMO_RESIDENTS} />
    </main>
  );
}
