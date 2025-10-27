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
import { Checkbox } from "@/components/ui/checkbox"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
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

    if (!/[A-Z]/.test(password)) {
      setError("パスワードには大文字を含める必要があります")
      return
    }

    if (!/[a-z]/.test(password)) {
      setError("パスワードには小文字を含める必要があります")
      return
    }

    if (!/[0-9]/.test(password)) {
      setError("パスワードには数字を含める必要があります")
      return
    }

    if (!agreedToTerms) {
      setError("利用規約に同意してください")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          companyName,
          agreedToTerms, // agreedToTermsを追加
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "アカウント作成に失敗しました")
        setIsLoading(false)
        return
      }

      router.push(`/signup-success?email=${encodeURIComponent(email)}`)
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
                placeholder="8文字以上（大文字・小文字・数字を含む）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">※ 大文字、小文字、数字をそれぞれ1文字以上含めてください</p>
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
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                disabled={isLoading}
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <Link href="/terms" className="text-emerald-600 hover:underline" target="_blank">
                  利用規約
                </Link>
                と
                <Link href="/privacy" className="text-emerald-600 hover:underline" target="_blank">
                  プライバシーポリシー
                </Link>
                に同意します
              </label>
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
