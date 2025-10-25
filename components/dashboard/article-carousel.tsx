import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Plus } from "lucide-react"

const articles = [
  {
    id: 1,
    title: "アスベスト判定の精度向上について",
    thumbnail: "/asbestos-detection.jpg",
    tags: ["お知らせ", "機能更新"],
    date: "2025/10/20",
  },
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

export function ArticleCarousel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>お知らせ・記事</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4">
            {articles.map((article) => (
              <Link key={article.id} href={`/article/${article.id}`} className="inline-block w-64 flex-shrink-0">
                <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img
                    src={article.thumbnail || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{article.title}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{article.date}</p>
                  </div>
                </div>
              </Link>
            ))}
            <button className="inline-block w-64 flex-shrink-0 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
              <div className="h-full flex flex-col items-center justify-center p-8 text-gray-500 hover:text-emerald-600">
                <Plus className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">新規記事</span>
              </div>
            </button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
