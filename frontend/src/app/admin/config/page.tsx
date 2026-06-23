"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import type { User, UserRole } from "@/lib/types";
import {
  Users,
  Shield,
  ShieldCheck,
  Search,
  Check,
  X,
  ChevronDown,
} from "lucide-react";

const ROLE_CONFIG: Record<UserRole, { label: string; icon: typeof Shield; color: string; bg: string }> = {
  admin: { label: "Admin", icon: ShieldCheck, color: "text-brand-700", bg: "bg-brand-50" },
  user: { label: "User", icon: Shield, color: "text-gray-600", bg: "bg-gray-100" },
};

export default function AdminConfigPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const loadUsers = () => {
    setLoading(true);
    api.getUsers().then(setUsers).finally(() => setLoading(false));
  };

  useEffect(loadUsers, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      await api.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      showToast(`Role updated to ${ROLE_CONFIG[newRole].label}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update role", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const haystack = `${u.name} ${u.email} ${u.role}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  return (
    <ProtectedRoute adminOnly>
      <div className="animate-fade-in">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Configuration</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user roles and permissions. Admins can access all requests and the admin console.
          </p>
        </div>

        {!loading && users.length > 0 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="surface-card flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </div>
            <div className="surface-card flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
                <p className="text-xs text-gray-500">Admins</p>
              </div>
            </div>
            <div className="surface-card flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{userCount}</p>
                <p className="text-xs text-gray-500">Regular Users</p>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div
            className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-elevated animate-slide-up ${
              toast.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {toast.type === "success" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {toast.message}
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="mb-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search by name, email, role..."
                className="field-input pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner label="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Users will appear here after they register." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No matching users" description="Try adjusting your search." />
        ) : (
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Joined</th>
                    <th>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => {
                    const config = ROLE_CONFIG[u.role];
                    const RoleIcon = config.icon;
                    const isSelf = u.id === currentUser?.id;
                    const isUpdating = updatingId === u.id;

                    return (
                      <tr key={u.id} className="group">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                              {u.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {u.name}
                                {isSelf && (
                                  <span className="ml-1.5 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                                    You
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-gray-500">{u.email}</td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.color}`}>
                            <RoleIcon className="h-3.5 w-3.5" />
                            {config.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap text-gray-500">
                          {new Date(u.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </td>
                        <td>
                          {isSelf ? (
                            <span className="text-xs text-gray-400">Cannot change own role</span>
                          ) : (
                            <div className="relative inline-block">
                              <select
                                value={u.role}
                                disabled={isUpdating}
                                onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-gray-700 transition hover:border-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
