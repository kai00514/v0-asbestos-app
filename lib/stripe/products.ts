export interface StripeProduct {
  id: string
  name: string
  description: string
  priceId: string // Stripe Price ID
  priceInCents: number
  interval?: "month" | "year"
  features: string[]
}

// 料金プラン定義（サーバー側で管理）
export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: "trial",
    name: "トライアル",
    description: "14日間無料トライアル",
    priceId: "price_trial", // TODO: 実際のStripe Price IDに置き換え
    priceInCents: 0,
    interval: "month",
    features: ["月10回まで判定可能", "基本的なAI判定機能", "PDF出力", "メールサポート"],
  },
  {
    id: "basic",
    name: "ベーシック",
    description: "個人・小規模事業者向け",
    priceId: "price_basic", // TODO: 実際のStripe Price IDに置き換え
    priceInCents: 980000, // ¥9,800
    interval: "month",
    features: ["月50回まで判定可能", "高精度AI判定", "PDF一括出力", "チームメンバー3名まで", "メールサポート"],
  },
  {
    id: "professional",
    name: "プロフェッショナル",
    description: "中規模事業者向け",
    priceId: "price_professional", // TODO: 実際のStripe Price IDに置き換え
    priceInCents: 2980000, // ¥29,800
    interval: "month",
    features: [
      "月200回まで判定可能",
      "最高精度AI判定",
      "PDF一括出力",
      "チームメンバー10名まで",
      "優先メールサポート",
      "API連携",
    ],
  },
  {
    id: "enterprise",
    name: "エンタープライズ",
    description: "大規模事業者向け",
    priceId: "price_enterprise", // TODO: 実際のStripe Price IDに置き換え
    priceInCents: 9980000, // ¥99,800
    interval: "month",
    features: [
      "無制限判定",
      "最高精度AI判定",
      "PDF一括出力",
      "チームメンバー無制限",
      "24時間電話サポート",
      "API連携",
      "専任サポート担当",
      "カスタマイズ対応",
    ],
  },
]

// 年間プラン（20%割引）
export const STRIPE_PRODUCTS_YEARLY: StripeProduct[] = STRIPE_PRODUCTS.map((product) => ({
  ...product,
  id: `${product.id}_yearly`,
  priceId: `${product.priceId}_yearly`, // TODO: 実際のStripe Price IDに置き換え
  priceInCents: Math.floor(product.priceInCents * 12 * 0.8), // 20%割引
  interval: "year" as const,
}))

export function getProductById(productId: string): StripeProduct | undefined {
  return [...STRIPE_PRODUCTS, ...STRIPE_PRODUCTS_YEARLY].find((p) => p.id === productId)
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return [...STRIPE_PRODUCTS, ...STRIPE_PRODUCTS_YEARLY].find((p) => p.priceId === priceId)
}
