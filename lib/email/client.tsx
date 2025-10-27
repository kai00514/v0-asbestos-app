// 簡易的なメール通知機能（後でSendGridに置き換え）

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // TODO: SendGrid統合時に実装
  console.log("[v0] Email would be sent:", {
    to: options.to,
    subject: options.subject,
    preview: options.html.substring(0, 100),
  })

  // 開発環境では console.log のみ
  // 本番環境では SendGrid API を使用
  if (process.env.NODE_ENV === "production" && process.env.SENDGRID_API_KEY) {
    // SendGrid実装予定
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // await sgMail.send({
    //   to: options.to,
    //   from: process.env.SENDGRID_FROM_EMAIL,
    //   subject: options.subject,
    //   html: options.html,
    // })
  }
}

export async function sendDetectionCompleteEmail(userEmail: string, detectionId: string, sampleName: string) {
  await sendEmail({
    to: userEmail,
    subject: "【VizyAs】判定が完了しました",
    html: `
      <h2>判定が完了しました</h2>
      <p>サンプル「${sampleName}」の判定が完了しました。</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/detection/${detectionId}">判定結果を確認する</a></p>
    `,
  })
}

export async function sendUsageLimitWarningEmail(userEmail: string, currentUsage: number, limit: number) {
  const percentage = Math.round((currentUsage / limit) * 100)

  await sendEmail({
    to: userEmail,
    subject: "【VizyAs】利用上限警告",
    html: `
      <h2>利用上限に近づいています</h2>
      <p>今月の判定回数が上限の${percentage}%に達しました。</p>
      <p>現在の利用状況: ${currentUsage} / ${limit}回</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/pricing">プランをアップグレードする</a></p>
    `,
  })
}

export async function sendSubscriptionRenewalEmail(userEmail: string, planName: string, amount: number) {
  await sendEmail({
    to: userEmail,
    subject: "【VizyAs】サブスクリプション更新のお知らせ",
    html: `
      <h2>サブスクリプションが更新されました</h2>
      <p>プラン: ${planName}</p>
      <p>金額: ¥${amount.toLocaleString()}</p>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/account">請求情報を確認する</a></p>
    `,
  })
}
