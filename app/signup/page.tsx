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

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("パスワードが一致しません")
      return
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください")
      return
    }

    setIsLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()

      // Supabase Authでユーザー作成
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name,
          },
        },
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("このメールアドレスは既に登録されています")
        } else {
          setError(authError.message)
        }
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        setError("アカウント作成に失敗しました")
        setIsLoading(false)
        return
      }

      // 会社レコード作成
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: companyName,
          owner_id: authData.user.id,
        })
        .select()
        .single()

      if (companyError) {
        console.error("[v0] Company creation error:", companyError)
        setError("会社情報の作成に失敗しました")
        setIsLoading(false)
        return
      }

      // ユーザーテーブルに登録（Owner権限）
      const { error: userError } = await supabase.from("users").insert({
        id: authData.user.id,
        email,
        name,
        company_id: company.id,
        role: "owner",
        is_active: true,
        onboarding_completed: false,
      })

      if (userError) {
        console.error("[v0] User creation error:", userError)
        setError("ユーザー情報の作成に失敗しました")
        setIsLoading(false)
        return
      }

      // ユーザー設定初期化
      await supabase.from("user_settings").insert({
        user_id: authData.user.id,
        notification_email: true,
        notification_push: false,
      })

      // トライアルサブスクリプション作成
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 30)

      await supabase.from("subscriptions").insert({
        company_id: company.id,
        plan_name: "trial",
        status: "trialing",
        monthly_limit: 50,
        trial_ends_at: trialEndDate.toISOString(),
      })

      // オンボーディングへリダイレクト
      router.push("/onboarding")
    } catch (err) {
      console.error("[v0] Signup error:", err)
      setError("アカウント作成中にエラーが発生しました")
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-900">新規アカウント登録</CardTitle>
          <CardDescription className="text-base">アカウントを作成して始めましょう</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="company">会社名</Label>
              <Input
                id="company"
                type="text"
                placeholder="株式会社サンプル"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <Input
                id="name"
                type="text"
                placeholder="山田 太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>
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
                placeholder="8文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード（確認）</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="パスワードを再入力"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "登録中..." : "アカウント登録"}
            </Button>
            <div className="text-center text-sm text-gray-600">
              すでにアカウントをお持ちの方は{" "}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                ログイン
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
