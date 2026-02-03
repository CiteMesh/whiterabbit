"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Bot {
  id: string;
  name: string;
  status: "pending" | "approved" | "revoked";
  tier: string;
  contact_email: string | null;
  user_agent: string | null;
  pairing_code: string | null;
  pairing_expires_at: string | null;
  created_at: string;
  last_used_at: string | null;
}

interface BotListResponse {
  bots: Bot[];
  total: number;
}

export default function AdminBotsPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "revoked">("all");

  useEffect(() => {
    fetchBots();
  }, [filter]);

  const fetchBots = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_WRBT_API_BASE || "http://localhost:5001";
      const url = filter === "all"
        ? `${baseUrl}/api/admin/bots`
        : `${baseUrl}/api/admin/bots?status=${filter}`;

      const res = await fetch(url, {
        credentials: "include", // Send session cookie
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch bots: ${res.status}`);
      }

      const data: BotListResponse = await res.json();
      setBots(data.bots);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bots");
    } finally {
      setLoading(false);
    }
  };

  const approveBot = async (botId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_WRBT_API_BASE || "http://localhost:5001";
      const res = await fetch(`${baseUrl}/api/admin/bots/${botId}/approve`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to approve bot: ${res.status}`);
      }

      const result = await res.json();
      alert(`Bot approved!\n\nToken (show this to the user once):\n${result.token}`);
      fetchBots();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Failed to approve bot"}`);
    }
  };

  const revokeBot = async (botId: string) => {
    if (!confirm("Are you sure you want to revoke this bot's access?")) {
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_WRBT_API_BASE || "http://localhost:5001";
      const res = await fetch(`${baseUrl}/api/admin/bots/${botId}/revoke`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to revoke bot: ${res.status}`);
      }

      alert("Bot access revoked");
      fetchBots();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Failed to revoke bot"}`);
    }
  };

  const filteredBots = bots.filter(bot => {
    if (filter === "all") return true;
    return bot.status === filter;
  });

  const pendingCount = bots.filter(b => b.status === "pending").length;
  const approvedCount = bots.filter(b => b.status === "approved").length;
  const revokedCount = bots.filter(b => b.status === "revoked").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="wrbt-card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-wide text-muted">Admin / Bots</div>
            <h1 className="text-2xl font-semibold">Bot Management</h1>
          </div>
          <Link href="/" className="text-sm text-accent hover:underline">
            ← Back to Home
          </Link>
        </div>
        <p className="text-muted text-sm max-w-3xl">
          Approve or revoke bot access. Bots register via <code className="bg-surface px-1 rounded">POST /api/bots/register</code> and receive a pairing code. Once you approve them here, they get a Bearer token for API access.
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`wrbt-card p-4 text-left transition-colors ${
            filter === "all" ? "border-accent" : ""
          }`}
        >
          <div className="text-2xl font-bold">{bots.length}</div>
          <div className="text-sm text-muted">Total Bots</div>
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`wrbt-card p-4 text-left transition-colors ${
            filter === "pending" ? "border-accent" : ""
          }`}
        >
          <div className="text-2xl font-bold text-yellow-400">{pendingCount}</div>
          <div className="text-sm text-muted">Pending Approval</div>
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`wrbt-card p-4 text-left transition-colors ${
            filter === "approved" ? "border-accent" : ""
          }`}
        >
          <div className="text-2xl font-bold text-green-400">{approvedCount}</div>
          <div className="text-sm text-muted">Approved</div>
        </button>
        <button
          onClick={() => setFilter("revoked")}
          className={`wrbt-card p-4 text-left transition-colors ${
            filter === "revoked" ? "border-accent" : ""
          }`}
        >
          <div className="text-2xl font-bold text-red-400">{revokedCount}</div>
          <div className="text-sm text-muted">Revoked</div>
        </button>
      </div>

      {/* Bot List */}
      <section className="wrbt-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            {filter === "all" ? "All Bots" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Bots`}
          </h2>
          <button
            onClick={fetchBots}
            className="text-sm text-accent hover:underline"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted py-8">Loading bots...</div>
        ) : filteredBots.length === 0 ? (
          <div className="text-center text-muted py-8">
            No {filter === "all" ? "" : filter} bots found
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBots.map(bot => (
              <div
                key={bot.id}
                className="p-4 bg-surface border border-border rounded-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{bot.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          bot.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : bot.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {bot.status}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                        {bot.tier}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted space-y-1">
                      {bot.contact_email && (
                        <div>Email: {bot.contact_email}</div>
                      )}
                      {bot.pairing_code && (
                        <div>
                          Pairing Code: <code className="bg-bg px-1 rounded">{bot.pairing_code}</code>
                          {bot.pairing_expires_at && (
                            <span className="ml-2">
                              (expires {new Date(bot.pairing_expires_at).toLocaleString()})
                            </span>
                          )}
                        </div>
                      )}
                      <div>Registered: {new Date(bot.created_at).toLocaleString()}</div>
                      {bot.last_used_at && (
                        <div>Last Used: {new Date(bot.last_used_at).toLocaleString()}</div>
                      )}
                      {bot.user_agent && (
                        <div className="text-xs">User-Agent: {bot.user_agent}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {bot.status === "pending" && (
                      <button
                        onClick={() => approveBot(bot.id)}
                        className="px-3 py-1.5 text-sm rounded-md bg-green-500 hover:bg-green-600 text-white font-medium"
                      >
                        Approve
                      </button>
                    )}
                    {bot.status === "approved" && (
                      <button
                        onClick={() => revokeBot(bot.id)}
                        className="px-3 py-1.5 text-sm rounded-md bg-red-500 hover:bg-red-600 text-white font-medium"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Instructions */}
      <section className="wrbt-card p-6 space-y-3">
        <h3 className="font-semibold">Bot Registration Flow</h3>
        <ol className="text-sm text-muted space-y-2 list-decimal list-inside">
          <li>Bot calls <code className="bg-surface px-1 rounded">POST /api/bots/register</code> with name and email</li>
          <li>Bot receives a 6-digit pairing code (valid for 1 hour)</li>
          <li>Bot appears in "Pending Approval" above</li>
          <li>Admin clicks "Approve" → bot receives Bearer token</li>
          <li>Bot uses token in <code className="bg-surface px-1 rounded">Authorization: Bearer &lt;token&gt;</code> header</li>
          <li>Admin can revoke access anytime by clicking "Revoke"</li>
        </ol>
      </section>
    </div>
  );
}
