import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-900">確認メールを送信しました</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            ご登録いただいたメールアドレスに確認メールを送信しました。
            <br />
            メール内のリンクをクリックして、アカウントを有効化してください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800">
            <p className="font-medium mb-1">メールが届かない場合</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>迷惑メールフォルダをご確認ください</li>
              <li>メールアドレスが正しいかご確認ください</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full h-11 bg-emerald-600 hover:bg-emerald-700">
            <Link href="/login">ログインページに戻る</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
