import { Badge } from "@/components/ui/badge"

export function ArticleContent({ articleId }: { articleId: string }) {
  return (
    <article className="prose prose-gray max-w-none">
      <img
        src="/asbestos-detection.jpg"
        alt="記事のメイン画像"
        className="w-full aspect-video object-cover rounded-lg mb-6"
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">アスベスト判定の精度向上について</h1>
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
          <time>2025/10/20</time>
          <span>•</span>
          <span>更新: 2025/10/22</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">お知らせ</Badge>
          <Badge variant="secondary">機能更新</Badge>
        </div>
      </div>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p>
          この度、AIモデルのアップデートにより、アスベスト判定の精度が大幅に向上しました。新しいバージョン2.1では、以下の改善が行われています。
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">主な改善点</h2>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. 検出精度の向上</h3>
        <p>
          従来モデルと比較して、検出精度が15%向上しました。特に、劣化した建材や複雑な背景を持つ画像での判定精度が大幅に改善されています。
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. 処理速度の改善</h3>
        <p>
          AI処理の最適化により、判定にかかる時間が平均30%短縮されました。より迅速な判定結果の取得が可能になっています。
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. 新しい建材タイプへの対応</h3>
        <p>以下の建材タイプが新たに判定可能になりました：</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>波形スレート（大波・小波）</li>
          <li>フレキシブル板</li>
          <li>ケイ酸カルシウム板第1種</li>
          <li>パルプセメント板</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">今後の展開</h2>
        <p>
          今後も継続的にモデルの改善を行い、より高精度な判定を提供してまいります。ユーザーの皆様からのフィードバックを基に、さらなる機能向上に取り組んでまいります。
        </p>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-emerald-900 mb-2">ご不明な点がございましたら</h3>
          <p className="text-emerald-800">
            カスタマーサポートまでお気軽にお問い合わせください。平日9:00〜18:00にて対応しております。
          </p>
        </div>
      </div>
    </article>
  )
}
