-- サンプルデータ投入スクリプト
-- 実行順序: 会社 → ユーザー → サブスクリプション → 現場タグ → 判定データ → 分析機関

-- 1. 会社データ
INSERT INTO companies (id, name, address, phone, created_at) VALUES
('00000000-0000-0000-0000-000000000001', '株式会社サンプル建設', '東京都渋谷区渋谷1-1-1', '03-1234-5678', NOW()),
('00000000-0000-0000-0000-000000000002', '山田解体工業', '大阪府大阪市北区梅田2-2-2', '06-9876-5432', NOW());

-- 2. ユーザーデータ（auth.usersと連携が必要なため、実際の認証後に作成される想定）
-- ここではサンプルUUIDを使用
INSERT INTO users (id, company_id, email, name, role, is_active, onboarding_completed, created_at) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner@sample.com', '田中太郎', 'owner', TRUE, TRUE, NOW()),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'member1@sample.com', '佐藤花子', 'member', TRUE, TRUE, NOW()),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'member2@sample.com', '鈴木一郎', 'member', TRUE, TRUE, NOW()),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'owner@yamada.com', '山田次郎', 'owner', TRUE, TRUE, NOW());

-- 3. ユーザー設定
INSERT INTO user_settings (user_id, onboarding_completed, onboarding_step, notification_email, notification_push) VALUES
('10000000-0000-0000-0000-000000000001', TRUE, 3, TRUE, TRUE),
('10000000-0000-0000-0000-000000000002', TRUE, 3, TRUE, FALSE),
('10000000-0000-0000-0000-000000000003', TRUE, 3, FALSE, TRUE),
('10000000-0000-0000-0000-000000000004', TRUE, 3, TRUE, TRUE);

-- 4. サブスクリプション
INSERT INTO subscriptions (company_id, plan_name, status, monthly_limit, current_period_start, current_period_end, trial_end, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'professional', 'active', 500, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', NULL, NOW() - INTERVAL '30 days'),
('00000000-0000-0000-0000-000000000002', 'trial', 'trialing', 30, NOW() - INTERVAL '5 days', NOW() + INTERVAL '9 days', NOW() + INTERVAL '9 days', NOW() - INTERVAL '5 days');

-- 5. 現場タグ
INSERT INTO site_tags (id, company_id, name, color, description, created_at) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '渋谷プロジェクト', '#10B981', '渋谷駅前再開発', NOW()),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '新宿ビル解体', '#3B82F6', '新宿区オフィスビル', NOW()),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '品川マンション', '#F59E0B', '品川区マンション改修', NOW()),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '梅田ビル', '#EF4444', '大阪梅田ビル解体', NOW());

-- 6. 判定データ
INSERT INTO detections (id, company_id, user_id, site_tag_id, detection_number, sample_name, site_name, result, confidence, address, notes, detection_date, created_at) VALUES
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 1, 'サンプル-001', '渋谷駅前ビル', TRUE, 0.95, '東京都渋谷区渋谷1-1-1', '天井材から検出', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 2, 'サンプル-002', '渋谷駅前ビル', FALSE, 0.88, '東京都渋谷区渋谷1-1-1', '壁材、検出なし', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 3, 'サンプル-003', '新宿オフィスビル', TRUE, 0.92, '東京都新宿区西新宿2-2-2', '配管保温材から検出', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', 4, 'サンプル-004', '品川マンション', FALSE, 0.91, '東京都品川区東品川3-3-3', '床材、検出なし', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 5, 'サンプル-005', '渋谷駅前ビル', TRUE, 0.97, '東京都渋谷区渋谷1-1-1', '屋根材から検出', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 1, 'サンプル-001', '梅田ビル', TRUE, 0.89, '大阪府大阪市北区梅田2-2-2', '外壁材から検出', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- 7. 判定画像（サンプル）
INSERT INTO detection_images (id, detection_id, original_url, bb_url, thumbnail_url, "order", created_at) VALUES
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '/placeholder.svg?height=800&width=600', '/placeholder.svg?height=800&width=600', '/placeholder.svg?height=200&width=150', 0, NOW() - INTERVAL '10 days'),
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', '/placeholder.svg?height=800&width=600', '/placeholder.svg?height=800&width=600', '/placeholder.svg?height=200&width=150', 0, NOW() - INTERVAL '8 days'),
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005', '/placeholder.svg?height=800&width=600', '/placeholder.svg?height=800&width=600', '/placeholder.svg?height=200&width=150', 0, NOW() - INTERVAL '3 days');

-- 8. 分析機関
INSERT INTO labs (id, name, address, phone, email, website, location, business_hours, certifications, created_at) VALUES
('50000000-0000-0000-0000-000000000001', '東京アスベスト分析センター', '東京都千代田区丸の内1-1-1', '03-1111-2222', 'info@tokyo-asbestos.jp', 'https://tokyo-asbestos.jp', ST_SetSRID(ST_MakePoint(139.7673, 35.6812), 4326), '平日 9:00-18:00', '厚生労働省認定', NOW()),
('50000000-0000-0000-0000-000000000002', '関西環境分析ラボ', '大阪府大阪市中央区本町2-2-2', '06-2222-3333', 'contact@kansai-lab.jp', 'https://kansai-lab.jp', ST_SetSRID(ST_MakePoint(135.5023, 34.6937), 4326), '平日 9:00-17:00', 'ISO/IEC 17025認定', NOW()),
('50000000-0000-0000-0000-000000000003', '横浜環境テクノロジー', '神奈川県横浜市西区みなとみらい3-3-3', '045-3333-4444', 'info@yokohama-tech.jp', 'https://yokohama-tech.jp', ST_SetSRID(ST_MakePoint(139.6380, 35.4437), 4326), '平日 8:30-17:30', '厚生労働省認定', NOW());

-- 9. 通知（サンプル）
INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at) VALUES
('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'detection_complete', '判定完了', 'サンプル-005の判定が完了しました。', FALSE, NOW() - INTERVAL '3 days'),
('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'usage_warning', '利用上限警告', '今月の判定回数が上限の80%に達しました。', FALSE, NOW() - INTERVAL '1 day'),
('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'subscription_renewal', 'サブスクリプション更新', 'プロフェッショナルプランが更新されました。', TRUE, NOW() - INTERVAL '15 days');

-- 10. 記事（サンプル）
INSERT INTO articles (id, company_id, author_id, title, slug, content, status, published_at, created_at) VALUES
('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'アスベスト判定の基礎知識', 'asbestos-basics', 'アスベスト（石綿）は、かつて建材として広く使用されていましたが、健康被害が明らかになり、現在は使用が禁止されています。本記事では、アスベスト判定の基本的な知識について解説します。', 'published', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'AI判定の精度向上のコツ', 'ai-detection-tips', 'AI判定の精度を向上させるためには、適切な撮影方法が重要です。本記事では、撮影時のポイントを解説します。', 'published', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days');
