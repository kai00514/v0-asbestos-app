-- ============================================
-- get_current_usage関数の作成
-- ============================================
-- 企業の月次判定使用状況を取得する関数

CREATE OR REPLACE FUNCTION get_current_usage(p_company_id UUID)
RETURNS TABLE (
  current_count INTEGER,
  monthly_limit INTEGER
) AS $$
DECLARE
  v_current_month CHAR(7);
  v_monthly_limit INTEGER;
  v_current_count INTEGER;
BEGIN
  -- 現在の年月を取得 (YYYY-MM形式)
  v_current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- 企業のサブスクリプションから月次上限を取得
  SELECT s.monthly_limit INTO v_monthly_limit
  FROM subscriptions s
  WHERE s.company_id = p_company_id
  LIMIT 1;
  
  -- 月次上限が見つからない場合はデフォルト値を使用
  IF v_monthly_limit IS NULL THEN
    v_monthly_limit := 10; -- デフォルト: 10回/月
  END IF;
  
  -- 今月の使用回数を取得
  SELECT COUNT(*) INTO v_current_count
  FROM usage_logs
  WHERE company_id = p_company_id
    AND year_month = v_current_month
    AND action = 'detection_created';
  
  -- 結果を返す
  RETURN QUERY SELECT v_current_count, v_monthly_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 関数の実行権限を設定
GRANT EXECUTE ON FUNCTION get_current_usage(UUID) TO authenticated;

-- コメント追加
COMMENT ON FUNCTION get_current_usage IS '企業の月次判定使用状況を取得する関数';
