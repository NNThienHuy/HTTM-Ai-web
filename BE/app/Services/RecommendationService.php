<?php

namespace App\Services;

use App\Models\Product;
use App\Models\UserProductInteraction;
use App\Models\ProductCategory;
class RecommendationService
{
    protected $weights = [
        'view'     => 1.0,
        'cart'     => 3.0,
        'purchase' => 5.0,
    ];

    public function getRecommendations($customerId, $limit = 4)
    {
        $interactions = UserProductInteraction::all();
        $matrix = [];
        foreach ($interactions as $inter) {
            $score = $this->weights[$inter->interaction_type] ?? 1.0;
            $matrix[$inter->customer_id][$inter->product_id] = $score;
        }

        // --- TRƯỜNG HỢP 1: USER MỚI (CHƯA CÓ TƯƠNG TÁC) ---
        if (!isset($matrix[$customerId])) {
            return Product::with(['category', 'laptopFeature'])
                ->orderBy('views', 'desc')
                ->limit($limit)
                ->get();
        }

        // --- TRƯỜNG HỢP 2: TÍNH TOÁN KNN ---
        $similarities = [];
        $targetUser = $matrix[$customerId];

        foreach ($matrix as $otherId => $otherUser) {
            if ($otherId == $customerId) continue;

            $dotProduct = 0; $normA = 0; $normB = 0;
            $allProducts = array_unique(array_merge(array_keys($targetUser), array_keys($otherUser)));

            foreach ($allProducts as $pid) {
                $v1 = $targetUser[$pid] ?? 0;
                $v2 = $otherUser[$pid] ?? 0;
                $dotProduct += $v1 * $v2;
                $normA += $v1 ** 2;
                $normB += $v2 ** 2;
            }

            $sim = ($normA * $normB) == 0 ? 0 : $dotProduct / (sqrt($normA) * sqrt($normB));
            if ($sim > 0.1) $similarities[$otherId] = $sim; // Chỉ lấy người thực sự giống
        }

        arsort($similarities);
        $neighbors = array_slice($similarities, 0, 5, true);
        
        $predictions = [];
        foreach ($neighbors as $neighborId => $simScore) {
            foreach ($matrix[$neighborId] as $pid => $score) {
                // ĐỂ TEST: Tạm thời bỏ !isset($targetUser[$pid]) hoặc thêm sản phẩm mồi vào database
                if (!isset($targetUser[$pid])) {
                    $predictions[$pid] = ($predictions[$pid] ?? 0) + ($score * $simScore);
                }
            }
        }

        // --- TRƯỜNG HỢP 3: XỬ LÝ KẾT QUẢ ---
        if (empty($predictions)) {
            // Nếu không có sản phẩm mới từ láng giềng, gợi ý sản phẩm phổ biến nhưng loại trừ cái đã xem
            return Product::with(['category', 'laptopFeature'])
                ->whereNotIn('product_id', array_keys($targetUser))
                ->orderBy('views', 'desc')
                ->limit($limit)
                ->get();
        }

        arsort($predictions);
        $productIds = array_keys(array_slice($predictions, 0, $limit, true));
        $idsString = implode(',', $productIds);

        return Product::with(['category', 'laptopFeature'])
            ->whereIn('product_id', $productIds)
            ->orderByRaw("FIELD(product_id, {$idsString})")
            ->get();
    }
}