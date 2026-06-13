import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Lock,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RegistrationRecord = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentProvider: string;
  paymentIntentId: string | null;
  operationId: string;
  refundId?: string | null;
  refundStatus?: string | null;
  refundedAt?: string | null;
  paidAt: string | null;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    whatsapp: string;
  };
  coach: {
    name: string;
    slug: string;
  };
  challenge: {
    name: string;
    slug: string;
    entryCode: string | null;
  };
};

type AdminSummary = {
  totalPaidRegistrations: number;
  totalRevenue: number;
  totalPendingRegistrations: number;
  byChallenge: Array<{
    coachName: string;
    challengeName: string;
    paidRegistrations: number;
    revenue: number;
  }>;
};

const passwordStorageKey = "coach-admin-password";

function formatMoney(amount: number, currency = "AED") {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function formatDate(value: string | null) {
  if (!value) return "Not paid yet";
  return new Intl.DateTimeFormat("en-AE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function downloadCsv(rows: RegistrationRecord[]) {
  const headers = [
    "Name",
    "Email",
    "WhatsApp",
    "Coach",
    "Challenge",
    "Status",
    "Amount",
    "Currency",
    "Paid At",
    "Payment Intent",
    "Registration ID",
    "Operation ID",
  ];

  const csvRows = rows.map((row) => [
    row.customer.name,
    row.customer.email,
    row.customer.whatsapp,
    row.coach.name,
    row.challenge.name,
    row.status,
    String(row.amount / 100),
    row.currency,
    row.paidAt || "",
    row.paymentIntentId || "",
    row.id,
    row.operationId,
  ]);

  const csv = [headers, ...csvRows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `coach-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminPortal() {
  const [password, setPassword] = useState(
    () => window.localStorage.getItem(passwordStorageKey) || "",
  );
  const [loginPassword, setLoginPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(password));
  const [statusFilter, setStatusFilter] = useState("paid");
  const [coachFilter, setCoachFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return registrations.filter((registration) => {
      if (coachFilter !== "all" && registration.coach.slug !== coachFilter) return false;
      if (!query) return true;
      return [
        registration.customer.name,
        registration.customer.email,
        registration.customer.whatsapp,
        registration.coach.name,
        registration.challenge.name,
        registration.status,
        registration.id,
        registration.paymentIntentId || "",
        registration.operationId,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [coachFilter, registrations, search]);

  const coachOptions = useMemo(
    () =>
      Array.from(
        new Map(registrations.map((item) => [item.coach.slug, item.coach])).values(),
      ),
    [registrations],
  );

  const fetchAdminData = async (adminPassword = password) => {
    if (!adminPassword) return;
    setIsLoading(true);
    setError(null);

    try {
      const registrationsUrl =
        statusFilter === "all"
          ? "/api/admin/registrations"
          : `/api/admin/registrations?status=${encodeURIComponent(statusFilter)}`;

      const [summaryResponse, registrationsResponse] = await Promise.all([
        fetch("/api/admin/summary", {
          headers: { "x-admin-password": adminPassword },
        }),
        fetch(registrationsUrl, {
          headers: { "x-admin-password": adminPassword },
        }),
      ]);

      if (!summaryResponse.ok || !registrationsResponse.ok) {
        throw new Error("Could not load admin data. Check password and Supabase config.");
      }

      const summaryJson = await summaryResponse.json();
      const registrationsJson = await registrationsResponse.json();

      setSummary(summaryJson.summary);
      setRegistrations(registrationsJson.registrations || []);
      setIsAuthenticated(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load admin data.");
      if (!window.localStorage.getItem(passwordStorageKey)) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && password) {
      fetchAdminData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, password, statusFilter]);

  const login = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword }),
      });

      if (!response.ok) {
        throw new Error("Invalid password or admin portal is not configured.");
      }

      window.localStorage.setItem(passwordStorageKey, loginPassword);
      setPassword(loginPassword);
      setIsAuthenticated(true);
      await fetchAdminData(loginPassword);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not log in.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    window.localStorage.removeItem(passwordStorageKey);
    setPassword("");
    setLoginPassword("");
    setIsAuthenticated(false);
    setSummary(null);
    setRegistrations([]);
  };

  const copyValue = async (label: string, value: string | null) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedId(`${label}:${value}`);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  const updateStatus = async (registrationId: string, status: string) => {
    setUpdatingId(registrationId);
    setError(null);
    try {
      const response = await fetch("/api/admin/registration-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ registrationId, status }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || data?.message || "Update failed.");
      await fetchAdminData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Update failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  const refundRegistration = async (registration: RegistrationRecord) => {
    if (
      registration.status === "paid" &&
      !window.confirm(`Refund ${formatMoney(registration.amount, registration.currency)} to this customer?`)
    ) {
      return;
    }
    setUpdatingId(registration.id);
    setError(null);
    try {
      const response = await fetch("/api/admin/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ registrationId: registration.id }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || data?.message || "Refund failed.");
      await fetchAdminData();
    } catch (refundError) {
      setError(refundError instanceof Error ? refundError.message : "Refund failed.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background px-4 py-10 text-white">
        <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
          <div className="rounded-2xl border border-white/10 bg-card p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-3xl font-extrabold">Coach Portal</h1>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-white/55">
              View paid members across all coach challenges.
            </p>

            <div className="mt-6 space-y-3">
              <Input
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") login();
                }}
                placeholder="Admin password"
                className="h-12 border-white/10 bg-white/[0.04] text-white placeholder:text-white/30"
              />
              {error ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
                  {error}
                </p>
              ) : null}
              <Button
                type="button"
                onClick={login}
                disabled={isLoading || !loginPassword}
                className="h-12 w-full bg-primary font-extrabold text-black hover:bg-primary/90"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-5 text-white md:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-extrabold text-primary">Coach Portal</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">
              Challenge Members
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fetchAdminData()}
              disabled={isLoading}
              className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={logout}
              className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </header>

        <section className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <Users className="h-5 w-5 text-primary" />
            <p className="mt-4 text-3xl font-black">
              {summary?.totalPaidRegistrations ?? 0}
            </p>
            <p className="mt-1 text-sm font-bold text-white/50">Paid members</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <Wallet className="h-5 w-5 text-primary" />
            <p className="mt-4 text-3xl font-black">
              {formatMoney(summary?.totalRevenue ?? 0)}
            </p>
            <p className="mt-1 text-sm font-bold text-white/50">Paid revenue</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card p-5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="mt-4 text-3xl font-black">
              {summary?.totalPendingRegistrations ?? 0}
            </p>
            <p className="mt-1 text-sm font-bold text-white/50">Pending attempts</p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-card">
          <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, WhatsApp, coach..."
                className="h-11 border-white/10 bg-white/[0.04] pl-9 text-white placeholder:text-white/30"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={coachFilter}
                onChange={(event) => setCoachFilter(event.target.value)}
                className="h-10 rounded-full border border-white/10 bg-[#111512] px-4 text-sm font-extrabold text-white"
                aria-label="Filter by coach"
              >
                <option value="all">All coaches</option>
                {coachOptions.map((coach) => (
                  <option key={coach.slug} value={coach.slug}>{coach.name}</option>
                ))}
              </select>
              {["paid", "pending", "refunded", "all"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`h-10 rounded-full px-4 text-sm font-extrabold transition active:scale-95 ${
                    statusFilter === status
                      ? "bg-primary text-black"
                      : "border border-white/10 bg-white/[0.04] text-white/65 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadCsv(filteredRegistrations)}
                className="h-10 border-white/10 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            </div>
          </div>

          {error ? (
            <p className="m-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
              {error}
            </p>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-white/45">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Coach</th>
                  <th className="px-4 py-3">Challenge</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Paid At</th>
                  <th className="px-4 py-3">IDs</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-white/[0.025]">
                    <td className="px-4 py-4">
                      <p className="font-extrabold text-white">{registration.customer.name}</p>
                      <p className="mt-1 text-xs font-semibold text-white/45">
                        {registration.customer.email}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-bold text-white/70" dir="ltr">
                      {registration.customer.whatsapp}
                    </td>
                    <td className="px-4 py-4 font-bold text-white/70">
                      {registration.coach.name}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-white/80">{registration.challenge.name}</p>
                      <p className="mt-1 text-xs font-semibold text-primary">
                        Code: {registration.challenge.entryCode || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          registration.status === "paid"
                            ? "bg-primary/15 text-primary"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {registration.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-extrabold text-white">
                      {formatMoney(registration.amount, registration.currency)}
                    </td>
                    <td className="px-4 py-4 text-white/60">
                      {formatDate(registration.paidAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <IdCopyRow
                          label="REG"
                          value={registration.id}
                          copied={copiedId === `REG:${registration.id}`}
                          onCopy={() => copyValue("REG", registration.id)}
                        />
                        <IdCopyRow
                          label="PAY"
                          value={registration.paymentIntentId}
                          copied={copiedId === `PAY:${registration.paymentIntentId}`}
                          onCopy={() => copyValue("PAY", registration.paymentIntentId)}
                        />
                        {registration.refundId ? (
                          <IdCopyRow
                            label="REF"
                            value={registration.refundId}
                            copied={copiedId === `REF:${registration.refundId}`}
                            onCopy={() => copyValue("REF", registration.refundId || null)}
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="grid min-w-40 gap-2">
                        <select
                          value={registration.status}
                          disabled={updatingId === registration.id || registration.status === "refunded"}
                          onChange={(event) => updateStatus(registration.id, event.target.value)}
                          className="h-9 rounded-lg border border-white/10 bg-[#111512] px-2 text-xs font-bold text-white"
                          aria-label={`Change status for ${registration.customer.name}`}
                        >
                          {["pending", "paid", "cancelled", "failed", "refund_pending", "refunded"].map((status) => (
                            <option key={status} value={status} disabled={status.startsWith("refund")}>
                              {status}
                            </option>
                          ))}
                        </select>
                        {registration.status === "paid" && registration.paymentProvider === "ziina" ? (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={updatingId === registration.id}
                            onClick={() => refundRegistration(registration)}
                            className="h-9 border-red-400/25 bg-red-500/10 text-xs font-extrabold text-red-100 hover:bg-red-500/20 hover:text-white"
                          >
                            <RotateCcw className="mr-2 h-3.5 w-3.5" />
                            Full refund
                          </Button>
                        ) : null}
                        {registration.status === "refund_pending" ? (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={updatingId === registration.id}
                            onClick={() => refundRegistration(registration)}
                            className="h-9 border-yellow-400/25 bg-yellow-500/10 text-xs font-extrabold text-yellow-100 hover:bg-yellow-500/20 hover:text-white"
                          >
                            <RefreshCw className="mr-2 h-3.5 w-3.5" />
                            Refresh refund
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && filteredRegistrations.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-lg font-extrabold text-white">No registrations found</p>
              <p className="mt-2 text-sm font-semibold text-white/45">
                Paid members will appear here after successful checkout.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}


function IdCopyRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string | null;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex max-w-[310px] items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-2.5 py-2">
      <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-black text-primary">
        {label}
      </span>
      <span className="min-w-0 flex-1 truncate font-mono text-xs font-bold text-white/65" dir="ltr">
        {value || "-"}
      </span>
      <button
        type="button"
        onClick={onCopy}
        disabled={!value}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-white/70 transition hover:border-primary/35 hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
        aria-label={`Copy ${label} ID`}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
