"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { AddMemberDialog } from "./add-member-dialog"
import type { Database } from "@/lib/types/database.types"

type User = Database["public"]["Tables"]["users"]["Row"]

interface TeamManagementProps {
  teamMembers: User[]
}

export function TeamManagement({ teamMembers }: TeamManagementProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>チーム管理</CardTitle>
          <AddMemberDialog />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
              <Avatar>
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <Badge
                    variant={member.role === "owner" ? "default" : "secondary"}
                    className={member.role === "owner" ? "bg-emerald-600" : ""}
                  >
                    {member.role === "owner" ? "オーナー" : "メンバー"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{member.email}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>
                    最終ログイン:{" "}
                    {member.last_login_at ? new Date(member.last_login_at).toLocaleDateString("ja-JP") : "未ログイン"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
                {member.role !== "owner" && (
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
