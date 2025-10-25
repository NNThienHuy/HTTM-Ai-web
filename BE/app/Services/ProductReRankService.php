<?php
namespace App\Services;

use App\Models\ProductEvent;
use Illuminate\Support\Collection;

class ProductReRankService
{
    private array $wEvent = ['view'=>1,'click'=>3,'add_to_cart'=>6,'purchase'=>12];
    private float $wContent=0.55, $wUserOwn=0.20, $wUserCat=0.10, $wPopularity=0.05, $wBandit=0.10;
    private int $halfLifeDays = 14;

    public function reRank(Collection $candidates, ?int $userId, array $bandit): Collection
    {
        if ($candidates->isEmpty()) return $candidates;
        $ids = $candidates->pluck('id')->all();
        $now = now();

        // ===== Popularity (30 ngày, decay) - prefix bảng rõ ràng
        $pop = [];
        ProductEvent::whereIn('product_events.product_id', $ids)
            ->where('product_events.created_at', '>=', $now->copy()->subDays(30))
            ->get([
                'product_events.product_id',
                'product_events.event',
                'product_events.created_at',
            ])
            ->each(fn($e) =>
                $pop[$e->product_id] = ($pop[$e->product_id] ?? 0)
                    + ($this->wEvent[$e->event] ?? 0) * $this->decay($e->created_at)
            );
        $popNorm = $this->minmaxMap($pop, $ids);

        // ===== Affinity trực tiếp (user → product) + theo category
        $own = array_fill_keys($ids, 0.0);
        $cat = array_fill_keys($ids, 0.0);

        if ($userId) {
            // --- user-own (90 ngày)
            $ownRaw = [];
            ProductEvent::where('product_events.user_id', $userId)
                ->where('product_events.created_at', '>=', $now->copy()->subDays(90))
                ->whereIn('product_events.product_id', $ids)
                ->get([
                    'product_events.product_id',
                    'product_events.event',
                    'product_events.created_at',
                ])
                ->each(fn($e) =>
                    $ownRaw[$e->product_id] = ($ownRaw[$e->product_id] ?? 0)
                        + ($this->wEvent[$e->event] ?? 0) * $this->decay($e->created_at)
                );
            $own = $this->minmax($ownRaw);

            // --- user-category (90 ngày) + JOIN products
            $catAff = [];
            ProductEvent::where('product_events.user_id', $userId)
                ->where('product_events.created_at', '>=', $now->copy()->subDays(90))
                ->join('products', 'products.id', '=', 'product_events.product_id')
                ->get([
                    'products.category_id',
                    'product_events.event',
                    'product_events.created_at',
                ])
                ->each(function ($e) use (&$catAff) {
                    if ($e->category_id) {
                        $catAff[$e->category_id] = ($catAff[$e->category_id] ?? 0)
                            + ($this->wEvent[$e->event] ?? 0) * $this->decay($e->created_at);
                    }
                });

            $catNormVals = $this->minmax($catAff);
            $catOf = $candidates->mapWithKeys(fn($p) => [$p->id => $p->category_id])->all();
            foreach ($ids as $pid) {
                $cid = $catOf[$pid] ?? null;
                $cat[$pid] = ($cid && isset($catNormVals[$cid])) ? $catNormVals[$cid] : 0.0;
            }
        }

        // ===== Tổng hợp điểm
        foreach ($candidates as $p) {
            $content = isset($p->knn_distance) ? 1.0 / (1.0 + max($p->knn_distance, 0)) : 0.0;
            $final =
                $this->wContent    * $content +
                $this->wUserOwn    * ($own[$p->id] ?? 0) +
                $this->wUserCat    * ($cat[$p->id] ?? 0) +
                $this->wPopularity * ($popNorm[$p->id] ?? 0) +
                $this->wBandit     * ($bandit[$p->id] ?? 0);

            $p->final_score = round($final, 6);
        }

        return $candidates->sortByDesc('final_score')->values();
    }

    private function decay($ts): float
    {
        $days = max(0.0, now()->diffInMinutes($ts) / 1440);
        return pow(0.5, $days / $this->halfLifeDays);
    }

    private function minmaxMap(array $map, array $ids): array
    {
        $vals = $this->minmax($map);
        $out = [];
        foreach ($ids as $id) $out[$id] = $vals[$id] ?? 0.0;
        return $out;
    }

    private function minmax(array $map): array
    {
        if (empty($map)) return [];
        $min = min($map); $max = max($map);
        if ($max == $min) return array_map(fn () => 1.0, $map);
        $o = [];
        foreach ($map as $k => $v) $o[$k] = ($v - $min) / max(1e-9, $max - $min);
        return $o;
    }
}
