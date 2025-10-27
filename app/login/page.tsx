"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError("メールアドレスまたはパスワードが正しくありません")
        setIsLoading(false)
        return
      }

      if (!data.user) {
        setError("ログインに失敗しました")
        setIsLoading(false)
        return
      }

      console.log("[v0] Login successful, user ID:", data.user.id)

      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "ユーザー情報の取得に失敗しました")
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      const userData = await response.json()
      console.log("[v0] User data:", userData)

      if (!userData.is_active) {
        setError("アカウントが無効化されています")
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      if (!userData.email_confirmed) {
        setError("メールアドレスの確認が完了していません。受信トレイを確認してください。")
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      // オンボーディング完了状態に応じてリダイレクト
      if (userData.onboarding_completed) {
        router.push("/dashboard")
      } else {
        router.push("/onboarding")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("ログイン中にエラーが発生しました")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-900">VizyAs</CardTitle>
          <CardDescription className="text-base">アカウントにログインしてください</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline">
                パスワードをお忘れですか？
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </Button>
            <div className="text-center text-sm text-gray-600">
              アカウントをお持ちでない方は{" "}
              <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                新規登録
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
