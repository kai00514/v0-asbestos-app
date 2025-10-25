import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const relatedArticles = [
  {
    id: 2,
    title: "新しい分析機関との提携を開始しました",
    thumbnail: "/laboratory-partnership.jpg",
    tags: ["お知らせ"],
    date: "2025/10/15",
  },
  {
    id: 3,
    title: "撮影のコツ：より正確な判定のために",
    thumbnail: "/photography-tips.png",
    tags: ["使い方", "ヒント"],
    date: "2025/10/10",
  },
]

export function RelatedArticles() {
  return (
    <div className="mt-12 pt-8 border-t">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">関連記事</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatedArticles.map((article) => (
          <Link key={article.id} href={`/article/${article.id}`}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <img
                src={article.thumbnail || "/placeholder.svg"}
                alt={article.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">{article.date}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
