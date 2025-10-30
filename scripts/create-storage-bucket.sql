-- Supabase Storageバケット作成スクリプト
-- 注意: このスクリプトはSupabaseダッシュボードのSQL Editorで実行してください

-- detection-imagesバケットが存在しない場合は作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('detection-images', 'detection-images', true)
ON CONFLICT (id) DO NOTHING;

-- 既存のポリシーを削除してから作成（冪等性を保証）

-- サービスロールキーでもアップロード可能にするため、TO service_roleを追加
-- RLSポリシー: 認証済みユーザーまたはサービスロールは自社の画像をアップロード可能
DROP POLICY IF EXISTS "Users can upload own company images" ON storage.objects;
CREATE POLICY "Users can upload own company images"
ON storage.objects FOR INSERT
TO authenticated, service_role
WITH CHECK (
  bucket_id = 'detection-images' AND
  (
    -- サービスロールは全てのフォルダにアップロード可能
    auth.role() = 'service_role' OR
    -- 認証済みユーザーは自社のフォルダのみアップロード可能
    (storage.foldername(name))[1] IN (
      SELECT company_id::text FROM users WHERE id = auth.uid()
    )
  )
);

-- RLSポリシー: 全員が画像を閲覧可能
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'detection-images');

-- サービスロールキーでも削除可能にするため、TO service_roleを追加
-- RLSポリシー: 認証済みユーザーまたはサービスロールは自社の画像を削除可能
DROP POLICY IF EXISTS "Users can delete own company images" ON storage.objects;
CREATE POLICY "Users can delete own company images"
ON storage.objects FOR DELETE
TO authenticated, service_role
USING (
  bucket_id = 'detection-images' AND
  (
    -- サービスロールは全てのファイルを削除可能
    auth.role() = 'service_role' OR
    -- 認証済みユーザーは自社のフォルダのみ削除可能
    (storage.foldername(name))[1] IN (
      SELECT company_id::text FROM users WHERE id = auth.uid()
    )
  )
);
