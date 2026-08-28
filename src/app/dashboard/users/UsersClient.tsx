"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Users, Calendar, PawPrint, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 20;

type User = {
  id: string;
  name: string;
  email: string;
  location: string;
  pets: number;
  createdAt: string;
  platform: "android" | "ios" | null;
  appVersion: string | null;
  isWalker: boolean;
  providers: string[];
};

type PlatformFilter = "all" | "android" | "ios" | "unknown";

function ProviderBadges({ providers }: { providers: string[] }) {
  return (
    <>
      {providers.includes("google") && (
        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-blue-400/40 text-blue-700 bg-blue-500/5 gap-0.5">
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </Badge>
      )}
      {providers.includes("apple") && (
        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-slate-400/40 text-slate-700 bg-slate-500/5 gap-0.5">
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.3.07 2.21.74 2.98.8 1.12-.19 2.19-.89 3.39-.84 1.44.07 2.53.61 3.22 1.57-2.9 1.74-2.25 5.57.42 6.65-.57 1.46-1.32 2.9-2.01 4.7zM13 3.5c.12 2.2-1.77 4-3.82 3.84-.22-1.97 1.77-4 3.82-3.84z"/>
          </svg>
          Apple
        </Badge>
      )}
      {providers.includes("email") && !providers.includes("google") && !providers.includes("apple") && (
        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-violet-400/40 text-violet-700 bg-violet-500/5">
          E-mail
        </Badge>
      )}
    </>
  );
}

export default function UsersClient({ users }: { users: User[] }) {
  const [page, setPage] = useState(1);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const now = new Date();
  const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const newUsers = users.filter((u) => new Date(u.createdAt) >= days30).length;
  const withPets = users.filter((u) => u.pets > 0).length;
  const androidCount = users.filter((u) => u.platform === "android").length;
  const iosCount = users.filter((u) => u.platform === "ios").length;
  const unknownCount = users.filter((u) => !u.platform).length;

  const filteredUsers = platformFilter === "all" ? users
    : platformFilter === "android" ? users.filter((u) => u.platform === "android")
    : platformFilter === "ios" ? users.filter((u) => u.platform === "ios")
    : users.filter((u) => !u.platform);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Usuários</h1>
        <p className="text-muted-foreground text-sm mt-1">Todas as contas cadastradas no Zupet</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{users.length.toLocaleString("pt-BR")}</p>
                <p className="text-xs text-muted-foreground">Total de usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{newUsers}</p>
                <p className="text-xs text-muted-foreground">Novos este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <PawPrint className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold">{withPets}</p>
                <p className="text-xs text-muted-foreground">Com pets cadastrados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center text-lg">
                📱
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-heading font-bold">{androidCount}</p>
                  <span className="text-xs text-muted-foreground">/ {iosCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Android / iOS</p>
                {unknownCount > 0 && (
                  <p className="text-[10px] text-muted-foreground">{unknownCount} sem dados</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle>Todos os Usuários</CardTitle>
            {platformFilter !== "all" && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {filteredUsers.length} de {users.length} usuários
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["all", "android", "ios", "unknown"] as PlatformFilter[]).map((f) => {
              const labels: Record<PlatformFilter, string> = {
                all: "Todos",
                android: `Android (${androidCount})`,
                ios: `iOS (${iosCount})`,
                unknown: `Sem OS (${unknownCount})`,
              };
              return (
                <button
                  key={f}
                  onClick={() => { setPlatformFilter(f); setPage(1); }}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    platformFilter === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>
        </CardHeader>

        {/* Mobile: cards */}
        <div className="md:hidden divide-y divide-border">
          {filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">Nenhum usuário encontrado</p>
          ) : (
            paginatedUsers.map((user) => {
              const isNew = new Date(user.createdAt) >= days30;
              return (
                <div key={user.id} className="px-4 py-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      {isNew && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">
                          novo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <Badge className="text-[9px] px-1 py-0 h-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                        Zupet
                      </Badge>
                      {user.isWalker && (
                        <Badge className="text-[9px] px-1 py-0 h-4 bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/10">
                          Walker
                        </Badge>
                      )}
                      {user.pets > 0 && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                          {user.pets} pet{user.pets !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      {user.platform === "android" && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-emerald-500/30 text-emerald-700 bg-emerald-500/5">
                          Android
                        </Badge>
                      )}
                      {user.platform === "ios" && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-slate-400/30 text-slate-600 bg-slate-500/5">
                          iOS
                        </Badge>
                      )}
                      <ProviderBadges providers={user.providers} />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                      {user.location !== "—" && <span>{user.location}</span>}
                      <span>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</span>
                      {user.appVersion && <span className="font-mono">v{user.appVersion}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop: tabela */}
        <CardContent className="p-0 hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Usuário</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Pets</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Versão</TableHead>
                <TableHead className="pr-6">Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12 text-sm">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const isNew = new Date(user.createdAt) >= days30;
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}…</p>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              <Badge className="text-[9px] px-1 py-0 h-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                                Zupet
                              </Badge>
                              {user.isWalker && (
                                <Badge className="text-[9px] px-1 py-0 h-4 bg-amber-500/10 text-amber-700 border-amber-500/30 hover:bg-amber-500/10">
                                  Walker
                                </Badge>
                              )}
                              <ProviderBadges providers={user.providers} />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.location}</TableCell>
                      <TableCell>
                        <Badge variant={user.pets > 0 ? "default" : "outline"}
                          className={user.pets > 0 ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10" : ""}>
                          {user.pets} pet{user.pets !== 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.platform === "android" && (
                          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-700 bg-emerald-500/5">
                            Android
                          </Badge>
                        )}
                        {user.platform === "ios" && (
                          <Badge variant="outline" className="text-xs border-slate-400/30 text-slate-600 bg-slate-500/5">
                            iOS
                          </Badge>
                        )}
                        {!user.platform && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.appVersion ? (
                          <Badge variant="outline" className="text-xs font-mono">
                            v{user.appVersion}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                          {isNew && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">
                              novo
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredUsers.length)} de {filteredUsers.length.toLocaleString("pt-BR")} usuários
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`h-8 w-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                        page === p
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
