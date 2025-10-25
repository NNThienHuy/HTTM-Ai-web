<?php
namespace App\Services;

use App\Models\ProductMetric;
use Illuminate\Support\Collection;

class ProductBanditService
{
    /** Posterior mean Beta cho CTR: alpha/(alpha+beta) */
    public function scores(Collection $ids): array
    {
        if ($ids->isEmpty()) return [];
        $metrics = ProductMetric::whereIn('product_id',$ids)->get()->keyBy('product_id');
        $out=[];
        foreach ($ids as $pid) {
            $m = $metrics->get($pid);
            $alpha = $m ? max(1.0,(float)$m->alpha_click) : 1.0;
            $beta  = $m ? max(1.0,(float)$m->beta_click)  : 1.0;
            $out[$pid] = $alpha / ($alpha + $beta); // 0..1
        }
        return $out;
    }
}
