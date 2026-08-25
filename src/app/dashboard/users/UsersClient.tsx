"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Users, Calendar, PawPrint } from "lucide-react";

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
  const now = new Date();
  const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const newUsers = users.filter((u) => new Date(u.createdAt) >= days30).length;
  const withPets = users.filter((u) => u.pets > 0).length;
  const androidCount = users.filter((u) => u.platform === "android").length;
  const iosCount = users.filter((u) => u.platform === "ios").length;
  const unknownCount = users.filter((u) => !u.platform).length;

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
        <CardContent className="p-0">
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
                users.map((user) => {
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
      </Card>
    </div>
  );
}
