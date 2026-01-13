<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\UserProductInteraction; // Dùng cái này để tính lượt truy cập/xem
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminStatsController extends Controller
{
    public function index()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // 1. TÍNH DOANH THU (Revenue)
        $currentRevenue = Order::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->where('status', 'delivered') 
            ->sum('total_amount');
        
        $lastRevenue = Order::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->where('status', 'delivered')
            ->sum('total_amount');

        // 2. TÍNH ĐƠN HÀNG (Orders)
        $currentOrders = Order::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $lastOrders = Order::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

        // 3. TÍNH SẢN PHẨM MỚI (New Products)
        $currentProducts = Product::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $lastProducts = Product::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

        // 4. TÍNH LƯỢT TRUY CẬP (Dựa trên bảng interaction view hôm nay)
        $todayViews = UserProductInteraction::whereDate('created_at', Carbon::today())
            ->where('interaction_type', 'view')
            ->count();
        
        $yesterdayViews = UserProductInteraction::whereDate('created_at', Carbon::yesterday())
            ->where('interaction_type', 'view')
            ->count();

        return response()->json([
            'revenue' => [
                'value' => $currentRevenue,
                'growth' => $this->calculateGrowth($currentRevenue, $lastRevenue),
                'label' => 'Doanh thu tháng này'
            ],
            'orders' => [
                'value' => $currentOrders,
                'growth' => $this->calculateGrowth($currentOrders, $lastOrders),
                'label' => 'Đơn hàng mới'
            ],
            'products' => [
                'value' => $currentProducts,
                'growth' => $this->calculateGrowth($currentProducts, $lastProducts),
                'label' => 'Sản phẩm mới'
            ],
            'visitors' => [
                'value' => $todayViews, // Hoặc tổng User nếu muốn
                'growth' => $this->calculateGrowth($todayViews, $yesterdayViews),
                'label' => 'Lượt xem hôm nay'
            ]
        ]);
    }

    private function calculateGrowth($current, $previous)
    {
        if ($previous == 0) return 100; // Nếu tháng trước = 0 thì tăng trưởng 100%
        return round((($current - $previous) / $previous) * 100, 1);
    }
}