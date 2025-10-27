"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ExternalLink } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

const faqs = [
  {
    category: "基本的な使い方",
    items: [
      {
        question: "AI判定の精度はどのくらいですか？",
        answer:
          "当社のAIモデルは、95%以上の精度でアスベストの含有を判定できます。ただし、最終的な判断は専門の分析機関による検査をお勧めします。",
      },
      {
        question: "判定にかかる時間はどのくらいですか？",
        answer: "通常、画像をアップロードしてから数秒以内に判定結果が表示されます。",
      },
      {
        question: "どのような画像をアップロードすればよいですか？",
        answer:
          "対象物を明るい場所で、できるだけ近距離から撮影した画像が最適です。ピントが合っていて、対象物がはっきり写っている画像をご使用ください。",
      },
    ],
  },
  {
    category: "料金・プラン",
    items: [
      {
        question: "無料トライアルはありますか？",
        answer:
          "はい、新規登録時に14日間の無料トライアルをご利用いただけます。トライアル期間中は月30回まで判定が可能です。",
      },
      {
        question: "プランの変更はいつでもできますか？",
        answer:
          "はい、いつでもプランの変更が可能です。アップグレードは即座に反映され、ダウングレードは次回の請求サイクルから適用されます。",
      },
      {
        question: "判定回数の上限を超えた場合はどうなりますか？",
        answer:
          "上限に達すると、その月は追加の判定ができなくなります。プランをアップグレードするか、次月まで待つ必要があります。",
      },
    ],
  },
  {
    category: "技術的な質問",
    items: [
      {
        question: "オフラインでも使用できますか？",
        answer:
          "PWAとしてインストールすることで、一部の機能はオフラインでも使用できますが、AI判定にはインターネット接続が必要です。",
      },
      {
        question: "対応しているブラウザは何ですか？",
        answer:
          "Chrome、Safari、Edge、Firefoxの最新版に対応しています。スマートフォンではiOS SafariとAndroid Chromeを推奨します。",
      },
      {
        question: "データのセキュリティは大丈夫ですか？",
        answer:
          "すべてのデータは暗号化されて保存され、SSL/TLS通信で保護されています。また、定期的なセキュリティ監査を実施しています。",
      },
    ],
  },
]

export function FAQDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start bg-transparent">
          <ExternalLink className="w-4 h-4 mr-2" />
          FAQ
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>よくある質問（FAQ）</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {faqs.map((category, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-lg mb-3 text-emerald-700">{category.category}</h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, itemIdx) => (
                    <AccordionItem key={itemIdx} value={`item-${idx}-${itemIdx}`}>
                      <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                      <AccordionContent className="text-gray-700">{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
