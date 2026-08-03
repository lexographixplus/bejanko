"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Package,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  setOrderStatus,
  setOrderNotes,
  deleteOrder,
} from "@/lib/actions/orders";
import { ConfirmDialog } from "./confirm-dialog";
import { cn, formatDate } from "@/lib/utils";

type OrderStatus = "NEW" | "CONFIRMED" | "FULFILLED" | "CANCELLED";

type Order = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  quantity: number;
  format: string | null;
  message: string | null;
  status: OrderStatus;
  notes: string | null;
  createdAt: Date;
  book: { title: string; slug: string };
};

const statusStyles: Record<OrderStatus, string> = {
  NEW: "bg-mark/10 text-mark",
  CONFIRMED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  FULFILLED: "bg-green-500/10 text-green-600 dark:text-green-400",
  CANCELLED: "bg-stone text-soft",
};

const statuses: OrderStatus[] = ["NEW", "CONFIRMED", "FULFILLED", "CANCELLED"];

function OrderRow({
  order,
  isPending,
  onStatus,
  onNotes,
  onDelete,
}: {
  order: Order;
  isPending: boolean;
  onStatus: (id: string, status: OrderStatus) => void;
  onNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(order.notes ?? "");

  return (
    <div className="border-b border-rule last:border-0">
      <div className="flex items-center gap-4 p-4 hover:bg-stone/10 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-mark/10 flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-mark" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-ink truncate">
            {order.book.title}
            <span className="text-soft font-normal"> &times;{order.quantity}</span>
          </p>
          <p className="text-xs text-soft truncate">
            {order.name} &middot; {order.email}
          </p>
        </div>

        <span
          className={cn(
            "shrink-0 text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md",
            statusStyles[order.status]
          )}
        >
          {order.status}
        </span>

        <span className="hidden sm:block text-xs text-soft shrink-0 tabular-nums">
          {formatDate(order.createdAt)}
        </span>

        <button
          onClick={() => setOpen((v) => !v)}
          className="p-1.5 rounded-md text-soft hover:text-ink hover:bg-stone/50 transition-colors shrink-0"
          aria-expanded={open}
          aria-label={open ? "Hide details" : "Show details"}
        >
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {open && (
        <div className="px-4 pb-5 pt-1 bg-stone/10 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <a
              href={`mailto:${order.email}`}
              className="flex items-center gap-2 text-soft hover:text-mark transition-colors"
            >
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">{order.email}</span>
            </a>
            {order.phone && (
              <a
                href={`tel:${order.phone}`}
                className="flex items-center gap-2 text-soft hover:text-mark transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span className="truncate">{order.phone}</span>
              </a>
            )}
          </div>

          {order.address && (
            <div className="flex items-start gap-2 text-sm text-soft">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="whitespace-pre-wrap">{order.address}</span>
            </div>
          )}

          {order.format && (
            <p className="text-sm text-soft">
              Format: <span className="text-ink">{order.format}</span>
            </p>
          )}

          {order.message && (
            <div className="rounded-lg border border-rule bg-paper p-3">
              <p className="text-[11px] uppercase tracking-wider text-soft/70 mb-1">
                Their note
              </p>
              <p className="text-sm text-ink whitespace-pre-wrap">
                {order.message}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor={`notes-${order.id}`}
              className="block text-[11px] uppercase tracking-wider text-soft/70 mb-1.5"
            >
              Private notes
            </label>
            <textarea
              id={`notes-${order.id}`}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (notes !== (order.notes ?? "")) onNotes(order.id, notes);
              }}
              placeholder="Only you can see this."
              className="w-full px-3 py-2 rounded-lg border border-rule bg-paper text-ink text-sm placeholder:text-soft/50 focus:outline-none focus:ring-2 focus:ring-mark/30 focus:border-mark resize-y"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => onStatus(order.id, s)}
                disabled={isPending || order.status === s}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  order.status === s
                    ? "bg-mark text-white cursor-default"
                    : "border border-rule text-soft hover:text-ink hover:bg-stone/50"
                )}
              >
                {s}
              </button>
            ))}

            <Link
              href={`/books/${order.book.slug}`}
              className="ml-auto text-xs text-soft hover:text-mark transition-colors"
            >
              View book
            </Link>

            <button
              onClick={() => onDelete(order.id)}
              disabled={isPending}
              className="p-1.5 rounded-md text-soft hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
              aria-label="Delete order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function OrdersManager({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const visible =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  function handleStatus(id: string, status: OrderStatus) {
    startTransition(async () => {
      try {
        await setOrderStatus(id, status);
        router.refresh();
        toast.success(`Marked ${status.toLowerCase()}.`);
      } catch {
        toast.error("Could not update the order.");
      }
    });
  }

  function handleNotes(id: string, notes: string) {
    startTransition(async () => {
      try {
        await setOrderNotes(id, notes);
        router.refresh();
        toast.success("Note saved.");
      } catch {
        toast.error("Could not save the note.");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteOrder(id);
        setDeleteId(null);
        router.refresh();
        toast.success("Order deleted.");
      } catch {
        toast.error("Could not delete the order.");
      }
    });
  }

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Orders</h1>
        <p className="text-soft text-sm mt-1">
          {orders.length} book {orders.length === 1 ? "order" : "orders"}
          {counts.NEW ? ` · ${counts.NEW} new` : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["ALL", ...statuses] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filter === s
                ? "bg-mark text-white"
                : "border border-rule text-soft hover:text-ink hover:bg-stone/50"
            )}
          >
            {s}
            {s !== "ALL" && counts[s] ? ` (${counts[s]})` : ""}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-rule bg-surface overflow-hidden">
        {visible.length === 0 ? (
          <p className="p-6 text-sm text-soft text-center">
            {orders.length === 0
              ? "No orders yet. They'll appear here as soon as someone orders a book."
              : "No orders with this status."}
          </p>
        ) : (
          visible.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              isPending={isPending}
              onStatus={handleStatus}
              onNotes={handleNotes}
              onDelete={setDeleteId}
            />
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete order?"
        description="This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
