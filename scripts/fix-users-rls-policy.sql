-- usersテーブルのRLSポリシーを修正して無限再帰を回避

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "users_view_team_members" ON users;

-- 新しいポリシーを作成（無限再帰を回避）
-- サービスロールキーまたは自分自身のレコードを閲覧可能
CREATE POLICY "users_view_own_record" 
ON users FOR SELECT 
TO authenticated
USING (id = auth.uid());

-- 同じ会社のユーザーを閲覧可能（サブクエリを使わない）
CREATE POLICY "users_view_company_members" 
ON users FOR SELECT 
TO authenticated
USING (
  company_id = (
    SELECT company_id 
    FROM auth.users 
    WHERE id = auth.uid()
  )
);

-- サービスロールキーは全てのレコードにアクセス可能
CREATE POLICY "service_role_full_access" 
ON users FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);
