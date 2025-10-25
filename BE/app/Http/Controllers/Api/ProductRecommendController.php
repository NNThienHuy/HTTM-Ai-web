<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImpression;
use App\Services\ProductKnnService;
use App\Services\ProductReRankService;
use App\Services\ProductBanditService;
use Illuminate\Http\Request;

class ProductRecommendController extends Controller
{
    public function __construct(
        private ProductKnnService $knn,
        private ProductReRankService $ranker,
        private ProductBanditService $bandit
    ) {}

    public function similar(Request $req, int $id)
    {
        $k = (int)$req->query('k', 8);
        $target = Product::findOrFail($id);

        $pool = Product::query()
            ->when($target->category_id, fn($q)=>$q->where('category_id',$target->category_id))
            ->where('status','!=','inactive')
            ->where('id','!=',$target->id)
            ->select(['id','name','price','sale_price','thumbnail_url','cpu','ram','gpu','category_id'])
            ->get();

        if ($pool->isEmpty()) {
            return response()->json(['product_id'=>$id,'similar'=>[]]);
        }

        $price = $target->sale_price ?? $target->price ?? 0;
        if ($price > 0) {
            $pool = $pool->filter(fn($x) => (($x->sale_price ?? $x->price ?? 0) >= $price*0.75)
                                        && (($x->sale_price ?? $x->price ?? 0) <= $price*1.25))
                         ->values() ?: $pool;
        }

        $scored = $this->knn->recommend(
            all: $pool,
            target: $target->only(['price','sale_price','cpu','ram','gpu']),
            k: $pool->count()
        );

        $bandit = $this->bandit->scores($scored->pluck('id'));
        $reranked = $this->ranker->reRank($scored, optional($req->user())->id, $bandit)->take($k);

        foreach ($reranked as $i => $p) {
            ProductImpression::create([
                'product_id' => $p->id,
                'user_id'    => optional($req->user())->id,
                'session_id' => session()->getId(),
                'block'      => 'similar',
                'position'   => $i + 1,
            ]);
        }

        return response()->json([
            'product_id' => $target->id,
            'similar' => $reranked->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'price' => $p->price,
                'sale_price' => $p->sale_price,
                'thumbnail_url' => $p->thumbnail_url,
                'cpu' => $p->cpu, 'ram' => $p->ram, 'gpu' => $p->gpu,
                'distance' => round($p->knn_distance, 5),
                'final_score' => $p->final_score,
            ])->values()
        ]);
    }
}
