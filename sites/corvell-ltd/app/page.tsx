import { hasSectionPlan } from "@/lib/plan";
import { PlanPage } from "@/components/PlanPage";
import LegacyHomePage from "@/components/LegacyHomePage";

export default function HomePage() {
  if (hasSectionPlan()) {
    return <PlanPage />;
  }
  return <LegacyHomePage />;
}
