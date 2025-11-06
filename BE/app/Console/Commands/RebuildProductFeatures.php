<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Product;

class RebuildProductFeatures extends Command
{
    protected $signature = 'recs:rebuild-features';
    protected $description = 'Tính lại dữ liệu product_features cho hệ gợi ý KNN';

    public function handle()
    {
        $this->info('Đang tính lại product_features...');

        $products = Product::with('reviews')->where('status', 'active')->get();

        if ($products->isEmpty()) {
            $this->warn('Không có sản phẩm nào!');
            return;
        }

        $minPrice = $products->min(fn($p) => $p->sale_price ?: $p->price);
        $maxPrice = $products->max(fn($p) => $p->sale_price ?: $p->price);

        foreach ($products as $product) {
            $price = $product->sale_price ?: $product->price;
            $rating = $product->avg_rating ?? $product->reviews->avg('rating') ?? 0;

            // Tính hiệu năng giả định dựa trên rating (có thể cộng thêm yếu tố RAM, CPU,...)
            $perfScore = min(100, max(0, $rating * 20));

            // Chuẩn hóa giá 0..1
            $x = ($maxPrice - $minPrice) == 0 ? 0 : ($price - $minPrice) / ($maxPrice - $minPrice);
            $y = $perfScore / 100;

            DB::table('product_features')->updateOrInsert(
                ['product_id' => $product->id],
                [
                    'price_final' => $price,
                    'perf_score'  => $perfScore,
                    'x_price'     => $x,
                    'y_perf'      => $y,
                    'updated_at'  => now(),
                    'created_at'  => now(),
                ]
            );
        }

        $this->info(' Đã tạo/ cập nhật bảng product_features thành công!');
    }
}
