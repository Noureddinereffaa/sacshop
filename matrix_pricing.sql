-- =========================================================================
-- SAC SHOP - FULL DATABASE WITH MATRIX PRICING & VARIANT IMAGES
-- =========================================================================

DELETE FROM orders;
DELETE FROM products;

-- -------------------------------------------------------------------------
-- 1. SAC PAPIER RIGIDE OFFSET (صورة 1)
-- -------------------------------------------------------------------------
INSERT INTO products (
  name, description, short_description, price, category, sizes, colors, 
  quantity_tiers, printing_config, variant_images, image_url, gallery, is_published, is_featured, stock
) VALUES (
  'كيس ريجيد - طباعة أوفست',
  'أكياس ورقية صلبة مع طباعة أوفست عالية الجودة شاملة التصميم الملون بالكامل.',
  'طباعة ملونة كاملة جودة عالية (أوفست)',
  205, 'أكياس ورقية',
  '["14/16", "17/24", "19/23", "27/20", "25/37", "37/25", "28/32", "32/45", "50/35"]',
  '[]',
  '[
    {"size": "14/16", "tiers": [{"min_qty": 500, "unit_price": 105}, {"min_qty": 1000, "unit_price": 89.5}, {"min_qty": 2000, "unit_price": 88}, {"min_qty": 3000, "unit_price": 83}, {"min_qty": 5000, "unit_price": 80}]},
    {"size": "17/24", "tiers": [{"min_qty": 500, "unit_price": 125}, {"min_qty": 1000, "unit_price": 109.5}, {"min_qty": 2000, "unit_price": 108}, {"min_qty": 3000, "unit_price": 104}, {"min_qty": 5000, "unit_price": 100}]},
    {"size": "19/23", "tiers": [{"min_qty": 500, "unit_price": 128}, {"min_qty": 1000, "unit_price": 113.5}, {"min_qty": 2000, "unit_price": 112}, {"min_qty": 3000, "unit_price": 107}, {"min_qty": 5000, "unit_price": 102}]},
    {"size": "27/20", "tiers": [{"min_qty": 500, "unit_price": 131}, {"min_qty": 1000, "unit_price": 116.5}, {"min_qty": 2000, "unit_price": 115}, {"min_qty": 3000, "unit_price": 110}, {"min_qty": 5000, "unit_price": 106}]},
    {"size": "25/37", "tiers": [{"min_qty": 500, "unit_price": 145}, {"min_qty": 1000, "unit_price": 128.5}, {"min_qty": 2000, "unit_price": 127}, {"min_qty": 3000, "unit_price": 122}, {"min_qty": 5000, "unit_price": 119}]},
    {"size": "37/25", "tiers": [{"min_qty": 500, "unit_price": 150}, {"min_qty": 1000, "unit_price": 133.5}, {"min_qty": 2000, "unit_price": 132}, {"min_qty": 3000, "unit_price": 128}, {"min_qty": 5000, "unit_price": 125}]},
    {"size": "28/32", "tiers": [{"min_qty": 500, "unit_price": 142}, {"min_qty": 1000, "unit_price": 124.5}, {"min_qty": 2000, "unit_price": 123}, {"min_qty": 3000, "unit_price": 119}, {"min_qty": 5000, "unit_price": 116}]},
    {"size": "32/45", "tiers": [{"min_qty": 500, "unit_price": 185}, {"min_qty": 1000, "unit_price": 171.5}, {"min_qty": 2000, "unit_price": 170}, {"min_qty": 3000, "unit_price": 166}, {"min_qty": 5000, "unit_price": 163}]},
    {"size": "50/35", "tiers": [{"min_qty": 500, "unit_price": 205}, {"min_qty": 1000, "unit_price": 189.5}, {"min_qty": 2000, "unit_price": 188}, {"min_qty": 3000, "unit_price": 185}, {"min_qty": 5000, "unit_price": 181}]}
  ]',
  '{"extra_color_price": 0, "double_sided_price": 20}',
  '[]',
  'https://images.unsplash.com/photo-1622560840424-df3734b2ce43?w=800',
  '[]',
  true, true, 50000
);

-- -------------------------------------------------------------------------
-- 2. SAC PAPIER RIGIDE BLANC AVEC SERIGRAPHIE (صورة 2) - مع صور الألوان
-- -------------------------------------------------------------------------
INSERT INTO products (
  name, description, short_description, price, category, sizes, colors, 
  quantity_tiers, printing_config, variant_images, image_url, gallery, is_published, is_featured, stock
) VALUES (
  'كيس ريجيد أبيض',
  'أكياس ورقية قوية مطبوعة بتقنية السيريغرافي. الكيس الأساسي هو أبيض ويمكن تغييره لألوان أخرى بتكلفة إضافية.',
  'الخيار المثالي لتغليف بوتيكات الملابس والمتاجر.',
  210, 'أكياس ورقية',
  '["11/17", "14/16", "17/24", "19/23", "27/20", "25/37", "37/25", "28/32", "32/45", "50/35", "58/45"]',
  '[
    {"name": "أبيض (أساسي)", "hex": "#ffffff", "extra_cost": 0}, 
    {"name": "أحمر", "hex": "#ff0000", "extra_cost": 20}, 
    {"name": "أسود", "hex": "#000000", "extra_cost": 20}, 
    {"name": "ذهبي", "hex": "#d4af37", "extra_cost": 20}
  ]',
  '[
    {"size": "11/17", "tiers": [{"min_qty": 200, "unit_price": 65}, {"min_qty": 400, "unit_price": 59.5}, {"min_qty": 600, "unit_price": 58}, {"min_qty": 1000, "unit_price": 55}, {"min_qty": 2000, "unit_price": 50}]},
    {"size": "14/16", "tiers": [{"min_qty": 200, "unit_price": 75}, {"min_qty": 400, "unit_price": 68.5}, {"min_qty": 600, "unit_price": 67}, {"min_qty": 1000, "unit_price": 63}, {"min_qty": 2000, "unit_price": 60}]},
    {"size": "17/24", "tiers": [{"min_qty": 200, "unit_price": 80}, {"min_qty": 400, "unit_price": 73.5}, {"min_qty": 600, "unit_price": 72}, {"min_qty": 1000, "unit_price": 68}, {"min_qty": 2000, "unit_price": 63}]},
    {"size": "19/23", "tiers": [{"min_qty": 200, "unit_price": 85}, {"min_qty": 400, "unit_price": 80.5}, {"min_qty": 600, "unit_price": 79}, {"min_qty": 1000, "unit_price": 75}, {"min_qty": 2000, "unit_price": 70}]},
    {"size": "27/20", "tiers": [{"min_qty": 200, "unit_price": 95}, {"min_qty": 400, "unit_price": 89.5}, {"min_qty": 600, "unit_price": 87}, {"min_qty": 1000, "unit_price": 84}, {"min_qty": 2000, "unit_price": 80}]},
    {"size": "25/37", "tiers": [{"min_qty": 200, "unit_price": 115}, {"min_qty": 400, "unit_price": 108.5}, {"min_qty": 600, "unit_price": 107}, {"min_qty": 1000, "unit_price": 102}, {"min_qty": 2000, "unit_price": 98}]},
    {"size": "37/25", "tiers": [{"min_qty": 200, "unit_price": 120}, {"min_qty": 400, "unit_price": 113.5}, {"min_qty": 600, "unit_price": 112}, {"min_qty": 1000, "unit_price": 108}, {"min_qty": 2000, "unit_price": 103}]},
    {"size": "28/32", "tiers": [{"min_qty": 200, "unit_price": 125}, {"min_qty": 400, "unit_price": 124.5}, {"min_qty": 600, "unit_price": 123}, {"min_qty": 1000, "unit_price": 119}, {"min_qty": 2000, "unit_price": 116}]},
    {"size": "32/45", "tiers": [{"min_qty": 200, "unit_price": 175}, {"min_qty": 400, "unit_price": 169.5}, {"min_qty": 600, "unit_price": 168}, {"min_qty": 1000, "unit_price": 164}, {"min_qty": 2000, "unit_price": 160}]},
    {"size": "50/35", "tiers": [{"min_qty": 200, "unit_price": 185}, {"min_qty": 400, "unit_price": 179.5}, {"min_qty": 600, "unit_price": 178}, {"min_qty": 1000, "unit_price": 174}, {"min_qty": 2000, "unit_price": 170}]},
    {"size": "58/45", "tiers": [{"min_qty": 200, "unit_price": 210}, {"min_qty": 400, "unit_price": 203.5}, {"min_qty": 600, "unit_price": 202}, {"min_qty": 1000, "unit_price": 197}, {"min_qty": 2000, "unit_price": 193}]}
  ]',
  '{"extra_color_price": 20, "double_sided_price": 20}',
  '[
    {"color": "أحمر", "image_url": "https://placehold.co/800x800/e74c3c/ffffff.png?text=Rigide+Rouge"},
    {"color": "أسود", "image_url": "https://placehold.co/800x800/1a1a1a/ffffff.png?text=Rigide+Noir"},
    {"color": "ذهبي", "image_url": "https://placehold.co/800x800/d4af37/ffffff.png?text=Rigide+Dor%C3%A9"},
    {"color": "أبيض (أساسي)", "image_url": "https://placehold.co/800x800/ffffff/000000.png?text=Rigide+Blanc"}
  ]',
  'https://placehold.co/800x800/ffffff/000000.png?text=Rigide+Blanc',
  '[]',
  true, true, 50000
);

-- -------------------------------------------------------------------------
-- 3. SAC PAPIER KRAFT AVEC SERIGRAPHIE (صورة 3) - مع صور الألوان الدقيقة
-- -------------------------------------------------------------------------
INSERT INTO products (
  name, description, short_description, price, category, sizes, colors, 
  quantity_tiers, printing_config, variant_images, image_url, gallery, is_published, is_featured, stock
) VALUES (
  'كيس كرافت طبيعي وملون',
  'أكياس الكرافت الطبيعية الأكثر طلباً للوجبات والمحلات. اللون البني هو الأساس، مع إمكانية تحويل الكيس للأبيض أو الملون (الأسود، الأحادي، الأزرق، الوردي) برسوم إضافية حسب نوع الاختيار.',
  'أكياس كرافت طبيعية صديقة للبيئة',
  110, 'أكياس ورقية',
  '["18/22", "25/20", "28/24", "28/33", "30/43", "45/33", "45/44"]',
  '[
    {"name": "كرافت بني (أساسي)", "hex": "#d2b48c", "extra_cost": 0}, 
    {"name": "أبيض", "hex": "#ffffff", "extra_cost": 5}, 
    {"name": "وردي", "hex": "#ffc0cb", "extra_cost": 10}, 
    {"name": "أحمر", "hex": "#ff0000", "extra_cost": 10}, 
    {"name": "أسود", "hex": "#000000", "extra_cost": 10}, 
    {"name": "أزرق", "hex": "#0000ff", "extra_cost": 10}
  ]',
  '[
    {"size": "18/22", "tiers": [{"min_qty": 200, "unit_price": 65}, {"min_qty": 400, "unit_price": 62}, {"min_qty": 600, "unit_price": 58}, {"min_qty": 1000, "unit_price": 52.5}, {"min_qty": 2000, "unit_price": 50}]},
    {"size": "25/20", "tiers": [{"min_qty": 200, "unit_price": 70}, {"min_qty": 400, "unit_price": 67}, {"min_qty": 600, "unit_price": 63}, {"min_qty": 1000, "unit_price": 59.5}, {"min_qty": 2000, "unit_price": 57}]},
    {"size": "28/24", "tiers": [{"min_qty": 200, "unit_price": 80}, {"min_qty": 400, "unit_price": 76}, {"min_qty": 600, "unit_price": 72}, {"min_qty": 1000, "unit_price": 67.5}, {"min_qty": 2000, "unit_price": 65}]},
    {"size": "28/33", "tiers": [{"min_qty": 200, "unit_price": 85}, {"min_qty": 400, "unit_price": 79}, {"min_qty": 600, "unit_price": 75}, {"min_qty": 1000, "unit_price": 69.5}, {"min_qty": 2000, "unit_price": 68}]},
    {"size": "30/43", "tiers": [{"min_qty": 200, "unit_price": 95}, {"min_qty": 400, "unit_price": 92}, {"min_qty": 600, "unit_price": 88}, {"min_qty": 1000, "unit_price": 81.5}, {"min_qty": 2000, "unit_price": 80}]},
    {"size": "45/33", "tiers": [{"min_qty": 200, "unit_price": 100}, {"min_qty": 400, "unit_price": 96}, {"min_qty": 600, "unit_price": 92}, {"min_qty": 1000, "unit_price": 86.5}, {"min_qty": 2000, "unit_price": 85}]},
    {"size": "45/44", "tiers": [{"min_qty": 200, "unit_price": 110}, {"min_qty": 400, "unit_price": 105}, {"min_qty": 600, "unit_price": 100}, {"min_qty": 1000, "unit_price": 93.5}, {"min_qty": 2000, "unit_price": 92}]}
  ]',
  '{"extra_color_price": 20, "double_sided_price": 20}',
  '[
    {"color": "كرافت بني (أساسي)", "image_url": "https://placehold.co/800x800/d2b48c/ffffff.png?text=Kraft+Bag"},
    {"color": "أبيض", "image_url": "https://placehold.co/800x800/ffffff/000000.png?text=White+Kraft"},
    {"color": "وردي", "image_url": "https://placehold.co/800x800/ffc0cb/000000.png?text=Pink+Kraft"},
    {"color": "أحمر", "image_url": "https://placehold.co/800x800/ff0000/ffffff.png?text=Red+Kraft"},
    {"color": "أسود", "image_url": "https://placehold.co/800x800/000000/ffffff.png?text=Black+Kraft"},
    {"color": "أزرق", "image_url": "https://placehold.co/800x800/0000ff/ffffff.png?text=Blue+Kraft"}
  ]',
  'https://placehold.co/800x800/d2b48c/ffffff.png?text=Kraft+Bag',
  '[]',
  true, true, 50000
);

-- -------------------------------------------------------------------------
-- 4. SAC ZIP (SHEN) AVEC SERIGRAPHIE (صورة 4)
-- -------------------------------------------------------------------------
INSERT INTO products (
  name, description, short_description, price, category, sizes, colors, 
  quantity_tiers, printing_config, variant_images, image_url, gallery, is_published, is_featured, stock
) VALUES (
  'أكياس سحاب (ZIP SHEN)',
  'أكياس نصف شفافة (Frosted) مع قفل سحاب علوي، مناسبة لتغليف الملابس والإكسسوارات.',
  'أكياس شفافة بسحاب لإغلاق محكم.',
  75, 'أكياس بلاستيكية',
  '["20/30", "30/40", "35/45"]',
  '[{"name": "نصف شفاف (Frosted)", "hex": "#e0e0e0", "extra_cost": 0}]',
  '[
    {"size": "20/30", "tiers": [{"min_qty": 200, "unit_price": 65}, {"min_qty": 400, "unit_price": 62}, {"min_qty": 600, "unit_price": 55}, {"min_qty": 1000, "unit_price": 49.5}, {"min_qty": 2000, "unit_price": 48}]},
    {"size": "30/40", "tiers": [{"min_qty": 200, "unit_price": 70}, {"min_qty": 400, "unit_price": 67}, {"min_qty": 600, "unit_price": 59}, {"min_qty": 1000, "unit_price": 53.5}, {"min_qty": 2000, "unit_price": 52}]},
    {"size": "35/45", "tiers": [{"min_qty": 200, "unit_price": 75}, {"min_qty": 400, "unit_price": 72}, {"min_qty": 600, "unit_price": 65}, {"min_qty": 1000, "unit_price": 58.5}, {"min_qty": 2000, "unit_price": 57}]}
  ]',
  '{"extra_color_price": 20, "double_sided_price": 20}',
  '[]',
  'https://placehold.co/800x800/dbeafe/1e3a8a.png?text=Zip+Bags',
  '[]',
  true, true, 50000
);
