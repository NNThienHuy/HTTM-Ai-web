<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;

class ContentBasedRecommendationService
{
    // Cấu hình chuẩn hóa (Normalization)
    protected $maxPrice = 150000000; // 150 triệu
    protected $maxRam = 128;         // 128 GB
    protected $maxStorage = 4096;    // 4 TB
    protected $maxScreen = 20.0;     // 20 inch

    // Trọng số cho từng đặc trưng (Tổng = 1.0)
    protected $weights = [
        'price' => 0.25,      // 25%
        'ram' => 0.25,        // 25%
        'purpose' => 0.30,    // 30% - Quan trọng nhất
        'storage' => 0.10,    // 10%
        'screen' => 0.10      // 10%
    ];

    /**
     * Lấy sản phẩm tương tự (Phiên bản tối ưu)
     * Trả về mảng gồm: Product, Distance, SimilarityScore
     */
    public function getSimilarProducts($targetProduct, $limit = 20): Collection
    {
        // 1. Tiền xử lý sản phẩm đích
        $targetVector = $this->preprocess($targetProduct);

        if (!$targetVector) {
            return collect([]);
        }

        // 2. Lấy ứng viên + Tính distance (Eager Loading để tối ưu query)
        $recommendations = Product::with(['category', 'laptopFeature'])
            ->where('product_id', '!=', $targetProduct->product_id) // Trừ chính nó
            ->where('category_id', $targetProduct->category_id)     // Cùng danh mục
            ->whereHas('laptopFeature')                             // Phải có thông số
            ->get()
            ->map(function ($candidate) use ($targetVector) {
                $candidateVector = $this->preprocess($candidate);
                
                if (!$candidateVector) {
                    return null;
                }

                // Tính khoảng cách có trọng số
                $distance = $this->calculateWeightedDistance($targetVector, $candidateVector);

                return [
                    'product' => $candidate,
                    'distance' => $distance,
                    'similarity_score' => $this->convertToSimilarityScore($distance)
                ];
            })
            ->filter()           // Loại bỏ null
            ->sortBy('distance') // Sắp xếp: Khoảng cách càng nhỏ càng tốt
            ->take($limit)       // Lấy top K
            ->values();          // Reset key mảng

        return $recommendations;
    }

    /**
     * Vector hóa + Chuẩn hóa sản phẩm
     */
    private function preprocess($product): ?array
    {
        $f = $product->laptopFeature;
        if (!$f) {
            return null;
        }

        // Vector hóa Purpose với thang điểm chi tiết
        $purposeScore = match (strtolower(trim($f->purpose ?? ''))) {
            'office', 'văn phòng', 'van phong' => 0.2,
            'student', 'sinh viên', 'sinh vien' => 0.4,
            'business', 'doanh nghiệp' => 0.5,
            'coding', 'lập trình', 'lap trinh', 'developer' => 0.7,
            'graphic', 'đồ họa', 'do hoa', 'design' => 0.85,
            'gaming', 'chơi game', 'choi game' => 1.0,
            default => 0.5
        };

        // Chuẩn hóa Min-Max
        return [
            'price' => min(1.0, max(0.0, (float)$product->price / $this->maxPrice)),
            'ram' => min(1.0, max(0.0, ($f->ram ?? 8) / $this->maxRam)),
            'purpose' => $purposeScore,
            'storage' => min(1.0, max(0.0, ($f->storage ?? 256) / $this->maxStorage)),
            'screen' => min(1.0, max(0.0, ($f->screen_size ?? 14) / $this->maxScreen))
        ];
    }

    /**
     * Tính khoảng cách Euclidean có trọng số
     */
    private function calculateWeightedDistance(array $vectorA, array $vectorB): float
    {
        $sum = 0;
        $features = ['price', 'ram', 'purpose', 'storage', 'screen'];

        foreach ($features as $feature) {
            $diff = $vectorA[$feature] - $vectorB[$feature];
            $sum += $this->weights[$feature] * pow($diff, 2);
        }

        return sqrt($sum);
    }

    /**
     * Chuyển đổi Distance thành Similarity Score (0-100%)
     */
    private function convertToSimilarityScore(float $distance): float
    {
        // Distance max lý thuyết ≈ 2.236 (căn bậc 2 của 5)
        $maxDistance = sqrt(5); 
        $similarity = (1 - ($distance / $maxDistance)) * 100;
        
        return round(max(0, min(100, $similarity)), 1);
    }
}