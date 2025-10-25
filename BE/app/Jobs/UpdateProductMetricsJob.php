<?php
namespace App\Jobs;

use App\Models\Product;
use App\Models\ProductEvent;
use App\Models\ProductImpression;
use App\Models\ProductMetric;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class UpdateProductMetricsJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    private int $halfLifeDays = 14;

    public function handle(): void
    {
        $since = now()->subDays(30);
        $pids  = Product::pluck('id');

        $imp = ProductImpression::where('created_at','>=',$since)->get(['product_id','created_at'])->groupBy('product_id');
        $clk = ProductEvent::where('created_at','>=',$since)->where('event','click')->get(['product_id','created_at'])->groupBy('product_id');

        foreach ($pids as $pid) {
            $i = $this->decayed($imp->get($pid));
            $c = $this->decayed($clk->get($pid));

            $m = ProductMetric::firstOrNew(['product_id'=>$pid]);
            $m->impressions_decay = $i;
            $m->clicks_decay      = $c;
            $m->alpha_click = max(1.0, $c + 1.0);
            $m->beta_click  = max(1.0, ($i - $c) + 1.0);
            $m->save();
        }
    }

    private function decayed($events): float
    {
        if (!$events) return 0.0;
        $sum=0.0;
        foreach ($events as $e) {
            $days = max(0.0, now()->diffInMinutes($e->created_at)/1440);
            $sum += pow(0.5, $days/$this->halfLifeDays);
        }
        return $sum;
    }
}
