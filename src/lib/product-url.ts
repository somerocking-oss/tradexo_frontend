export function getProductPath(product: { _id?: string; slug?: string }) {
  const slug = product.slug?.trim();
  if (slug) return `/product/${slug}`;
  return `/product/${product._id}`;
}
