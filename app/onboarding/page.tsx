"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const steps = [
  {
    title: "アスベスト判定アプリへようこそ",
    description: "現場での迅速な判定をサポートします",
    icon: (
      <svg className="w-16 h-16 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
        />
      </svg>
    ),
  },
  {
    title: "写真を撮影して判定",
    description: "建材の写真を撮影するだけでAIが自動判定します",
    icon: (
      <svg className="w-16 h-16 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "レポートを自動生成",
    description: "判定結果をPDFレポートとして出力・共有できます",
    icon: (
      <svg className="w-16 h-16 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push("/dashboard")
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-center">{steps[currentStep].icon}</div>
          <CardTitle className="text-2xl font-bold text-center text-emerald-900">{steps[currentStep].title}</CardTitle>
          <CardDescription className="text-center text-base leading-relaxed">
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-emerald-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1 h-11">
                戻る
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700">
              {currentStep === steps.length - 1 ? "始める" : "次へ"}
            </Button>
          </div>
          <Button variant="ghost" onClick={handleSkip} className="w-full text-gray-600 hover:text-gray-800">
            スキップ
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
