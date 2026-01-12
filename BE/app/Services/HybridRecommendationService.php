<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;

class HybridRecommendationService
{
    protected $contentService;
    protected $behaviorService;

    // CẤU HÌNH TRỌNG SỐ (Tổng = 1.0)
    protected $wCollaborative = 0.5; // 50% - Collaborative (Hành vi)
    protected $wContent = 0.4;       // 40% - Content (Nội dung)
    protected $wPopularity = 0.1;    // 10% - Popularity (Phổ biến)

    public function __construct(
        ContentBasedRecommendationService $contentService,
        RecommendationService $behaviorService
    ) {
        $this->contentService = $contentService;
        $this->behaviorService = $behaviorService;
    }

    /**
     * Tính điểm Hybrid: (Content * 0.4) + (Collaborative * 0.5) + (Popularity * 0.1)
     */
    public function getHybridRecommendations($targetProduct, $customerId, $limit = 6)
    {
        $candidates = [];

        // --- BƯỚC 1: LẤY ĐIỂM CONTENT-BASED (40%) ---
        $contentResults = $this->contentService->getSimilarProducts($targetProduct, 20);
        foreach ($contentResults as $item) {
            $pid = $item['product']->product_id;
            $this->initCandidate($candidates, $pid, $item['product']);
            
            // Content Service đã trả về điểm 0-100 (similarity_score)
            $candidates[$pid]['content_score'] = $item['similarity_score'];
        }

        // --- BƯỚC 2: LẤY ĐIỂM COLLABORATIVE (50%) ---
        if ($customerId > 0) {
            // Gọi service cũ của bạn
            $behaviorResults = $this->behaviorService->getRecommendations($customerId, 20);
            foreach ($behaviorResults as $index => $product) {
                $pid = $product->product_id;
                $this->initCandidate($candidates, $pid, $product);

                // Giả lập điểm dựa trên thứ hạng (Rank): Top 1 = 100đ, mỗi bậc giảm 5đ
                $score = max(50, 100 - ($index * 5)); 
                $candidates[$pid]['collab_score'] = $score;
            }
        }

        // --- BƯỚC 3: LẤY ĐIỂM POPULARITY (10%) ---
        // Lấy top 20 sản phẩm view cao nhất hệ thống
        $popularProducts = Product::where('product_id', '!=', $targetProduct->product_id)
            ->with(['category', 'laptopFeature', 'reviews'])
            ->orderBy('views', 'desc')
            ->take(20)
            ->get();

        if ($popularProducts->isNotEmpty()) {
            $maxView = $popularProducts->first()->views; // Lấy mốc view cao nhất
            foreach ($popularProducts as $product) {
                $pid = $product->product_id;
                $this->initCandidate($candidates, $pid, $product);

                // Chuẩn hóa View về thang điểm 100
                $score = ($maxView > 0) ? ($product->views / $maxView) * 100 : 0;
                $candidates[$pid]['pop_score'] = $score;
            }
        }

        // --- BƯỚC 4: TÍNH TỔNG ĐIỂM & SẮP XẾP ---
        $finalResults = [];
        foreach ($candidates as $pid => $data) {
            // CÔNG THỨC HYBRID
            $hybridScore = 
                ($data['content_score'] * $this->wContent) + 
                ($data['collab_score'] * $this->wCollaborative) + 
                ($data['pop_score'] * $this->wPopularity);

            if ($hybridScore > 0) {
                $finalResults[] = [
                    'product' => $data['product'],
                    'score' => round($hybridScore, 1),
                    // Debug breakdown để xem điểm thành phần
                    'breakdown' => [
                        'content' => $data['content_score'],
                        'collab' => $data['collab_score'],
                        'pop' => $data['pop_score']
                    ]
                ];
            }
        }

        // Trả về danh sách đã sắp xếp giảm dần theo điểm
        return collect($finalResults)
            ->sortByDesc('score')
            ->take($limit)
            ->values();
    }

    private function initCandidate(&$candidates, $pid, $product)
    {
        if (!isset($candidates[$pid])) {
            $candidates[$pid] = [
                'product' => $product,
                'content_score' => 0,
                'collab_score' => 0,
                'pop_score' => 0
            ];
        }
    }
}