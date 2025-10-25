"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"

const members = [
  {
    id: 1,
    name: "田中太郎",
    email: "tanaka@example.com",
    role: "Owner",
    department: "営業部",
    lastLogin: "2時間前",
    status: "active",
  },
  {
    id: 2,
    name: "佐藤花子",
    email: "sato@example.com",
    role: "Admin",
    department: "技術部",
    lastLogin: "1日前",
    status: "active",
  },
  {
    id: 3,
    name: "鈴木一郎",
    email: "suzuki@example.com",
    role: "Member",
    department: "営業部",
    lastLogin: "3日前",
    status: "active",
  },
]

export function TeamManagement() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>チーム管理</CardTitle>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            メンバーを追加
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
              <Avatar>
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <Badge
                    variant={member.role === "Owner" ? "default" : "secondary"}
                    className={member.role === "Owner" ? "bg-emerald-600" : ""}
                  >
                    {member.role}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{member.email}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{member.department}</span>
                  <span>•</span>
                  <span>最終ログイン: {member.lastLogin}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
                {member.role !== "Owner" && (
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
