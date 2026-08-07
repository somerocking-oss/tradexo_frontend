import { createStaticCmsPage } from "@/components/cms/staticCmsPage";

const { generateMetadata, Page } = createStaticCmsPage({
  slug: "infringement",
  fallbackTitle: "Infringement Policy",
  fallbackDescription: "Report copyright or trademark infringement on Tradexo.",
});

export { generateMetadata };
export default Page;
