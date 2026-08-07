import { PostRequirementForm } from "./PostRequirementForm";
import { PostRequirementHero } from "./PostRequirementHero";

export default async function PostRequirementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialProduct = String(params.product || params.keyword || "");
  const initialCity = String(params.city || "");
  const initialBulk = params.bulk === "1";

  return (
    <>
      <PostRequirementHero />
      <PostRequirementForm
        initialProduct={initialProduct}
        initialCity={initialCity}
        initialBulk={initialBulk}
      />
    </>
  );
}
