<?php
namespace App\Services;

use Illuminate\Support\Str;
use Illuminate\Support\Collection;

class ProductKnnService
{
    private float $wPrice = 0.40, $wCpu = 0.25, $wRam = 0.15, $wGpu = 0.20;

    public function recommend(Collection $all, array $target, int $k): Collection
    {
        $X  = $all->map(fn($p)=>$this->feat($p));
        $x0 = $this->feat((object)$target);

        $mins = [$X->min(fn($v)=>$v[0]), $X->min(fn($v)=>$v[1]), $X->min(fn($v)=>$v[2]), $X->min(fn($v)=>$v[3])];
        $maxs = [$X->max(fn($v)=>$v[0]), $X->max(fn($v)=>$v[1]), $X->max(fn($v)=>$v[2]), $X->max(fn($v)=>$v[3])];
        $norm = fn($v,$i)=>($maxs[$i]===$mins[$i])?0.0:($v-$mins[$i])/max(1e-9,($maxs[$i]-$mins[$i]));

        $x0n = array_map($norm, $x0, array_keys($x0));

        return $all->map(function ($p, $idx) use ($X, $norm, $x0n) {
                $xn = array_map($norm, $X[$idx], array_keys($X[$idx]));
                $d2 = $this->wPrice*($xn[0]-$x0n[0])**2
                    + $this->wCpu  *($xn[1]-$x0n[1])**2
                    + $this->wRam  *($xn[2]-$x0n[2])**2
                    + $this->wGpu  *($xn[3]-$x0n[3])**2;
                $p->knn_distance = sqrt($d2);
                return $p;
            })
            ->sortBy('knn_distance')
            ->values()
            ->take($k);
    }

    private function feat(object $p): array {
        return [
            $this->price($p->sale_price ?? null, $p->price ?? null),
            $this->cpuScore((string)($p->cpu ?? '')),
            $this->ramGb((string)($p->ram ?? '')),
            $this->gpuScore((string)($p->gpu ?? '')),
        ];
    }

    private function price($sale,$price): float {
        $v = is_numeric($sale) && $sale>0 ? (float)$sale : (float)($price ?? 0);
        return max(0.0, $v);
    }
    private function ramGb(string $ram): int {
        return preg_match('/(\d+)\s*gb/i',$ram,$m) ? (int)$m[1] : 8;
    }
    private function cpuScore(string $cpu): int {
        $c = Str::lower($cpu);
        if (str_contains($c,'m4')) return 240;
        if (str_contains($c,'m3')) return 220;
        if (preg_match('/i(\d)\D*?(\d{3,5})/i',$cpu,$m)){
            $tier=(int)$m[1]; $gen=(int)substr($m[2],0,2);
            $base=[3=>80,5=>120,7=>160,9=>190][$tier]??100; return $base+$gen;
        }
        if (preg_match('/ryzen\s*(\d)\D*?(\d{3,4})/i',$cpu,$m)){
            $tier=(int)$m[1]; $gen=(int)substr($m[2],0,1);
            $base=[3=>90,5=>130,7=>170,9=>195][$tier]??110; return $base+($gen*2);
        }
        return 120;
    }
    private function gpuScore(string $gpu): int {
        $g=strtoupper($gpu);
        foreach (['RTX 4090'=>300,'RTX 4080'=>290,'RTX 4070'=>270,'RTX 4060'=>250,'RTX 4050'=>230,'RTX 3060'=>210,'RTX 3050'=>190,'GTX 1650'=>150] as $k=>$s)
            if (str_contains($g,$k)) return $s;
        if (str_contains($g,'680M')) return 200;
        if (str_contains($g,'IRIS XE')) return 160;
        if (str_contains($g,'APPLE')) return 170;
        if (str_contains($g,'RADEON')) return 170;
        return 140;
    }
}
