import { DemoBanner } from "@/components/DemoBanner";
import { MomentFeed } from "@/components/MomentFeed";
import { fetchFamilyFeed } from "@/lib/queries/moments";

export default async function FamilyFeedPage() {
  const { items, error } = await fetchFamilyFeed();

  return (
    <main>
      <DemoBanner />
      <h1>????????</h1>
      <p className="muted">?????????????????????????</p>
      <MomentFeed items={items} {...(error ? { error } : {})} />
    </main>
  );
}
