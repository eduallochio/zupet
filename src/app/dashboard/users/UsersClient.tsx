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
};

export default function UsersClient({ users }: { users: User[] }) {
  const [page, setPage] = useState(1);
  const now = new Date();
  const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const newUsers = users.filter((u) => new Date(u.createdAt) >= days30).length;
  const withPets = users.filter((u) => u.pets > 0).length;
  const androidCount = users.filter((u) => u.platform === "android").length;
  const iosCount = users.filter((u) => u.platform === "ios").length;
  const unknownCount = users.filter((u) => !u.platform).length;

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const paginatedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        <CardHeader>
          <CardTitle>Todos os Usuários</CardTitle>
        </CardHeader>

        {/* Mobile: cards */}
        <div className="md:hidden divide-y divide-border">
          {users.length === 0 ? (
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
              {users.length === 0 ? (
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
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, users.length)} de {users.length.toLocaleString("pt-BR")} usuários
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
