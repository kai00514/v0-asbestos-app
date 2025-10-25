import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const faqs = [
  {
    question: "トライアル中に解約できますか？",
    answer: "はい、トライアル期間中はいつでも解約可能です。解約後は即座にサービスが停止します。",
  },
  {
    question: "プラン変更は即時反映されますか？",
    answer:
      "アップグレードは即時反映されます。ダウングレードは次回更新日から適用されます。差額の返金は行っておりません。",
  },
  {
    question: "返金はできますか？",
    answer:
      "サービスの性質上、原則として返金は行っておりません。ただし、システム障害など当社の責任による場合は個別に対応いたします。",
  },
  {
    question: "請求書は発行されますか？",
    answer: "はい、請求書の発行に対応しております。アカウント設定の請求管理ページからダウンロードできます。",
  },
  {
    question: "年払いの途中でプラン変更できますか？",
    answer: "はい可能です。アップグレードの場合は差額を日割り計算して請求いたします。",
  },
]

export function PricingFAQ() {
  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle>よくある質問</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
