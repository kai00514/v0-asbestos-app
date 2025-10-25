import { getSupabaseServerClient } from "@/lib/supabase/server"
import { ArticleContent } from "@/components/article/article-content"
import { RelatedArticles } from "@/components/article/related-articles"
import { BottomNav } from "@/components/layout/bottom-nav"
import { WaveHeader } from "@/components/layout/wave-header"

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-gray-200 pb-20 md:pb-0">
      <WaveHeader title="記事" showLogo={false} showBackButton />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <ArticleContent articleId={params.id} />
        <RelatedArticles />
      </main>

      <BottomNav />
    </div>
  )
}
