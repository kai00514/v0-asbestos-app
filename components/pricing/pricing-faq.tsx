import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const faqs = [
  {
    question: "無料トライアル期間中に解約した場合、料金は発生しますか？",
    answer:
      "いいえ、14日間の無料トライアル期間中に解約された場合、一切料金は発生しません。トライアル終了後に自動的に有料プランへ移行しますので、ご継続されない場合はトライアル期間内にキャンセルをお願いいたします。",
  },
  {
    question: "プランの変更はいつ反映されますか？",
    answer:
      "アップグレード（上位プランへの変更）は即時反映されます。差額は日割りで計算されます。ダウングレード（下位プランへの変更）は、現在の課金期間終了後の次回更新日から適用されます。",
  },
  {
    question: "月間の判定回数上限を超えた場合はどうなりますか？",
    answer:
      "上限に達した場合、新規のAI判定は翌月の更新日まで一時停止されます。判定履歴の閲覧やPDF出力などの既存データに関する機能は引き続きご利用いただけます。判定回数を増やしたい場合は、上位プランへのアップグレードをご検討ください。",
  },
  {
    question: "AI判定の精度はどの程度ですか？",
    answer:
      "当社のAIモデル（AsbestosNet v2.1）は、学術研究および実地検証に基づき、適切な撮影条件下で高い検出精度を発揮します。ただし、最終的な含有判定は分析機関による定量分析をお勧めしております。AI判定はスクリーニング（事前選別）としてご活用ください。",
  },
  {
    question: "適格請求書（インボイス）は発行されますか？",
    answer:
      "はい、適格請求書発行事業者として登録済みです。請求書はアカウント設定の「請求管理」ページからPDF形式でダウンロードいただけます。登録番号などの詳細は請求書に記載されています。",
  },
  {
    question: "年額プランの途中解約で返金はできますか？",
    answer:
      "年額プランの途中解約の場合、残存期間分の返金は原則行っておりません。ただし、解約後も契約期間満了まではサービスを引き続きご利用いただけます。システム障害など当社の責任に起因する場合は、個別にご対応いたします。",
  },
  {
    question: "チームメンバーの追加・削除はいつでもできますか？",
    answer:
      "はい、プランの上限ユーザー数の範囲内であれば、いつでも追加・削除が可能です。オーナーまたは管理者権限を持つユーザーがアカウント設定から操作できます。",
  },
]

export function PricingFAQ() {
  return (
    <Card className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
      <CardHeader>
        <CardTitle className="text-lg">よくある質問</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-sm font-medium">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600 leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
