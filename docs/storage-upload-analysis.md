# Supabase Storage アップロード処理の分析

## 現在のエラー状況

### エラー1: RLSポリシーエラー
\`\`\`
permission denied for table users
\`\`\`
- **発生箇所**: detection_number自動採番時
- **原因**: usersテーブルのRLSポリシーが無限再帰を引き起こしている

### エラー2: カラム不存在エラー
\`\`\`
Could not find the 'model_version' column of 'detections' in the schema cache
\`\`\`
- **発生箇所**: detectionsテーブルへのINSERT時
- **原因**: コードで`model_version`カラムを使用しているが、DBスキーマでは`ai_model_version`

---

## 関係するファイル一覧

### フロントエンド
1. **`components/ai/ai-detection-form.tsx`**
   - AI判定フォームのUIコンポーネント
   - 画像選択、サンプル名、現場名の入力
   - `/api/detections`へのPOSTリクエスト送信

2. **`components/ai/image-upload.tsx`**
   - 画像アップロードコンポーネント
   - 最大6枚の画像選択
   - ファイルサイズとMIMEタイプのバリデーション

### バックエンド
3. **`app/api/detections/route.ts`**
   - AI判定APIエンドポイント
   - 画像アップロード、AI推論、DB保存の統合処理

4. **`lib/ai/client.ts`**
   - Roboflow API連携クライアント
   - 画像URLを受け取りAI推論を実行

5. **`lib/supabase/server.ts`**
   - Supabaseサーバークライアント作成
   - 認証済みユーザー用のクライアント

### データベース
6. **`user_read_only_context/project_sources/db_spec_new.md`**
   - データベーススキーマ定義
   - テーブル構造、カラム定義、RLSポリシー

7. **`scripts/create-storage-bucket.sql`**
   - Storageバケット作成とRLSポリシー設定

8. **`scripts/fix-users-rls-policy.sql`**
   - usersテーブルのRLSポリシー修正

---

## 現在のアップロード前の処理フロー

### 1. クライアント側（`components/ai/ai-detection-form.tsx`）

\`\`\`
[ユーザー操作]
  ↓
[画像選択] (最大6枚)
  ↓
[サンプル名・現場名入力]
  ↓
[AI判定ボタンクリック]
  ↓
[handleSubmit関数実行]
  ↓
[画像をBase64に変換] ← File[] → Base64[]
  ↓
[/api/detectionsにPOSTリクエスト]
  - sample_name
  - site_name
  - address
  - location (緯度経度)
  - images (Base64配列)
\`\`\`

### 2. サーバー側（`app/api/detections/route.ts`）

\`\`\`
[POST /api/detections]
  ↓
[1. 認証チェック] (requireAuth)
  - ユーザーID取得
  - 会社ID取得
  ↓
[2. リクエストボディ受信]
  - images配列を取得
  ↓
[3. バリデーション] (createDetectionSchema)
  - 画像枚数チェック (1-6枚)
  - 画像サイズチェック (10MB以下)
  - 必須項目チェック
  ↓
[4. Supabaseクライアント作成]
  - 通常クライアント (認証済み)
  - 管理者クライアント (サービスロールキー)
  ↓
[5. 月次上限チェック] ← ❌ get_current_usage関数が存在しない
  - 現在の使用回数を取得
  - 上限と比較
  ↓
[6. detection_number自動採番] ← ❌ RLSポリシーによるアクセス拒否
  - 最新のdetection_numberを取得
  - +1して次の番号を生成
  ↓
[7. detectionsテーブルにINSERT] ← ❌ model_versionカラムが存在しない
  - company_id
  - user_id
  - detection_number
  - sample_name
  - site_name
  - location (POINT)
  - address
  - result (仮: false)
  - confidence (仮: 0)
  - model_version ← ❌ 正しくは ai_model_version
  ↓
[8. 画像アップロード処理] ← ここに到達していない
  ...
\`\`\`

---

## 問題点の詳細

### 問題1: RLSポリシーによるアクセス拒否

**場所**: `app/api/detections/route.ts` 全体

**問題**:
- サービスロールクライアント（`supabaseAdmin`）を作成しているが、実際のDB操作には通常の`supabase`クライアントを使用している
- 通常クライアントではRLSポリシーが適用され、`users`テーブルへのアクセスが拒否される

**影響**:
- detection_number自動採番時に`permission denied for table users`エラーが発生
- detectionsテーブルへのINSERTが失敗
- 画像アップロード処理に到達しない

**解決策**:
- すべてのデータベース操作で`supabase`を`supabaseAdmin`に変更
- サービスロールキーを使用することでRLSをバイパス

### 問題2: RLSポリシーの無限再帰

**場所**: `db_spec_new.md` L409-411

\`\`\`sql
CREATE POLICY "users_view_team_members" ON users FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
\`\`\`

**問題**:
- ポリシー内で`users`テーブルを参照している
- `SELECT company_id FROM users WHERE id = auth.uid()`が再度RLSポリシーをトリガー
- 無限ループが発生

**影響**:
- detection_number自動採番時に`users`テーブルにアクセスできない
- `permission denied for table users`エラーが発生

**解決策**:
- `auth.users`テーブルから直接`company_id`を取得
- または、サブクエリを使用しない方法に変更

### 問題3: カラム名の不一致

**場所**: `app/api/detections/route.ts` L157

\`\`\`typescript
model_version: "unknown", // ← 間違ったカラム名
\`\`\`

**DBスキーマ**: `db_spec_new.md` L149
\`\`\`sql
ai_model_version VARCHAR(50),  -- ← 正しいカラム名
\`\`\`

**問題**:
- コードでは`model_version`を使用
- DBスキーマでは`ai_model_version`

**影響**:
- detectionsテーブルへのINSERTが失敗
- `Could not find the 'model_version' column`エラーが発生

**解決策**:
- コードを`ai_model_version`に修正

### 問題4: get_current_usage関数が存在しない

**場所**: `app/api/detections/route.ts` L106-108

\`\`\`typescript
const { data: usage } = await supabase.rpc("get_current_usage", {
  p_company_id: user.company_id,
})
\`\`\`

**問題**:
- `get_current_usage`関数がデータベースに存在しない
- 404エラーが発生

**影響**:
- 月次上限チェックが機能しない
- ただし、`usage`が`undefined`になるだけで処理は続行される

**解決策**:
- `scripts/create-usage-function.sql`を実行して関数を作成

---

## Storageアップロード処理（到達していない）

### 予定されている処理フロー

\`\`\`
[8. 画像アップロード処理]
  ↓
  FOR EACH 画像 (i = 0 to images.length - 1)
    ↓
    [Base64 → Buffer変換]
      - Base64文字列からBufferを生成
      - サイズチェック (10MB以下)
    ↓
    [ファイル名生成]
      - original_{index}_{timestamp}.{ext}
    ↓
    [ファイルパス生成]
      - {company_id}/{detection_id}/{filename}
    ↓
    [Content-Type設定]
      - image/jpeg, image/png, image/webp
    ↓
    [Supabase Storageにアップロード]
      - バケット: detection-images
      - パス: {company_id}/{detection_id}/{filename}
      - upsert: false
    ↓
    [公開URLを取得]
      - getPublicUrl()
    ↓
    [imageUrls配列に追加]
  END FOR
  ↓
[9. AI推論処理]
  - Roboflow APIに画像URLを送信
  - 検出結果を取得
  ↓
[10. detectionsテーブルを更新]
  - result, confidence, ai_model_version
  ↓
[11. detection_imagesテーブルに保存]
  - original_url, bb_url=null, thumbnail_url=null
  ↓
[12. bounding_boxesテーブルに保存]
  - 検出された矩形情報
  ↓
[13. 完了レスポンスを返す]
\`\`\`

---

## 修正が必要な項目

### 優先度: 高（完了）

1. **✅ すべてのDB操作をsupabaseAdminに変更**
   - `app/api/detections/route.ts`
   - L152: detection_number取得
   - L157: detectionsテーブルinsert
   - L186: detection_imagesテーブルinsert
   - L203: bounding_boxesテーブルinsert
   - L215: 判定結果の再取得

2. **✅ カラム名の修正**
   - `app/api/detections/route.ts` L157
   - `model_version` → `ai_model_version`（既に修正済み）

### 優先度: 中

4. **Storageバケットの確認**
   - `detection-images`バケットが存在するか確認
   - RLSポリシーが正しく設定されているか確認

5. **環境変数の確認**
   - `SUPABASE_SERVICE_ROLE_KEY`が正しく設定されているか
   - `ROBOFLOW_API_KEY`が正しく設定されているか
   - `ROBOFLOW_WORKFLOW_URL`が正しく設定されているか

---

## 次のステップ

1. RLSポリシーを修正
2. カラム名を修正
3. get_current_usage関数を作成
4. 動作確認
5. Storageアップロードが成功することを確認
6. AI推論が成功することを確認
7. DB保存が成功することを確認

---

## 参考情報

### Supabase Storage RLSポリシー

\`\`\`sql
-- サービスロールキーを許可
CREATE POLICY "Users can upload own company images"
ON storage.objects FOR INSERT
TO authenticated, service_role
WITH CHECK (
  bucket_id = 'detection-images' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM users WHERE id = auth.uid()
  )
);
\`\`\`

### ファイルパス構造

\`\`\`
detection-images/
├── {company_id}/
│   ├── {detection_id}/
│   │   ├── original_000_1234567890.jpg
│   │   ├── original_001_1234567891.jpg
│   │   └── ...
\`\`\`

### 環境変数

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://erppwxvwrkljhkymdvvv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ROBOFLOW_API_KEY=wqIalPUEPICBR6TjbU35
ROBOFLOW_WORKFLOW_URL=https://serverless.roboflow.com/asbestos-aokhx/workflows/detect-count-and-visualize
