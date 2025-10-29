-- Supabase Storageバケット作成スクリプト
-- 注意: このスクリプトはSupabaseダッシュボードのSQL Editorで実行してください

-- detection-imagesバケットが存在しない場合は作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('detection-images', 'detection-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLSポリシー: 認証済みユーザーは自社の画像のみアップロード可能
CREATE POLICY IF NOT EXISTS "Users can upload own company images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'detection-images' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM users WHERE id = auth.uid()
  )
);

-- RLSポリシー: 全員が画像を閲覧可能
CREATE POLICY IF NOT EXISTS "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'detection-images');

-- RLSポリシー: 認証済みユーザーは自社の画像のみ削除可能
CREATE POLICY IF NOT EXISTS "Users can delete own company images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'detection-images' AND
  (storage.foldername(name))[1] IN (
    SELECT company_id::text FROM users WHERE id = auth.uid()
  )
);
