import type { RfqLineItem } from "@/types";

interface RfqItemsTableProps {
  items: RfqLineItem[];
  compact?: boolean;
}

function categoryName(categoryId: RfqLineItem["categoryId"]) {
  return typeof categoryId === "object" && categoryId?.name ? categoryId.name : "";
}

export function RfqItemsTable({ items, compact }: RfqItemsTableProps) {
  if (!items.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Product</th>
            {!compact && <th className="px-3 py-2 font-medium">Qty</th>}
            {!compact && <th className="px-3 py-2 font-medium">Category</th>}
            {!compact && <th className="px-3 py-2 font-medium">Specifications</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item, index) => (
            <tr key={`${item.productName}-${index}`}>
              <td className="px-3 py-2 text-slate-500">{index + 1}</td>
              <td className="px-3 py-2 font-medium text-slate-900">{item.productName}</td>
              {!compact && (
                <td className="px-3 py-2 text-slate-600">
                  {item.quantity != null
                    ? `${item.quantity}${item.unit ? ` ${item.unit}` : ""}`
                    : "—"}
                </td>
              )}
              {!compact && (
                <td className="px-3 py-2 text-slate-600">
                  {categoryName(item.categoryId) || "—"}
                </td>
              )}
              {!compact && (
                <td className="px-3 py-2 text-slate-600">
                  {item.specifications || "—"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
