import { getOrders } from "@/lib/actions/orders";
import { OrdersManager } from "@/components/admin/orders-manager";

export default async function OrdersPage() {
  const orders = await getOrders();
  return <OrdersManager orders={orders} />;
}
