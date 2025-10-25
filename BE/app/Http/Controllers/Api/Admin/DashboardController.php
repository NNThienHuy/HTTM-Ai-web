<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Parse range ?from=YYYY-MM-DD&to=YYYY-MM-DD
     * Mặc định: 30 ngày gần nhất (today - 29 -> today)
     */
    private function parseRange(Request $request): array
    {
        $to = $request->query('to')
            ? Carbon::parse($request->query('to'))->endOfDay()
            : now()->endOfDay();

        $from = $request->query('from')
            ? Carbon::parse($request->query('from'))->startOfDay()
            : (clone $to)->subDays(29)->startOfDay();

        return [$from, $to];
    }

    /**
     * Tổng quan KPI: doanh thu hôm nay / tháng, tổng đơn, pending, người dùng mới, AOV.
     */
    public function general(Request $request)
    {
        $today = Carbon::today();
        $monthStart = now()->copy()->startOfMonth();
        $year = now()->year;

        $todayRevenue = Order::where('payment_status', 'paid')
            ->whereDate('created_at', $today)
            ->sum('total_amount');

        $monthRevenue = Order::where('payment_status', 'paid')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', now()->month)
            ->sum('total_amount');

        $totalOrders     = Order::count();
        $pendingOrders   = Order::where('status', 'pending')->count();
        $newUsersToday   = User::whereDate('created_at', $today)->count();

        // AOV (Average Order Value) trong tháng hiện tại (chỉ đơn paid)
        $monthPaidOrders = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$monthStart, now()->endOfDay()])
            ->count();
        $aov = $monthPaidOrders > 0 ? round($monthRevenue / $monthPaidOrders, 2) : 0;

        return response()->json([
            'today_revenue'   => (float)$todayRevenue,
            'month_revenue'   => (float)$monthRevenue,
            'total_orders'    => (int)$totalOrders,
            'pending_orders'  => (int)$pendingOrders,
            'new_users_today' => (int)$newUsersToday,
            'aov_month'       => (float)$aov,
        ]);
    }

    /**
     * Doanh thu theo ngày trong khoảng (mặc định 30 ngày gần nhất)
     * GET /admin/stats/revenue-trend?from=2025-10-01&to=2025-10-25
     */
    public function revenueTrend(Request $request)
    {
        [$from, $to] = $this->parseRange($request);

        $rows = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as d, SUM(total_amount) as revenue')
            ->groupBy('d')
            ->orderBy('d')
            ->get();

        // Bơm các ngày thiếu về 0 để vẽ chart mượt
        $cursor = $from->copy();
        $series = [];
        while ($cursor->lte($to)) {
            $dateStr = $cursor->toDateString();
            $value = (float) ($rows->firstWhere('d', $dateStr)->revenue ?? 0);
            $series[] = ['date' => $dateStr, 'revenue' => $value];
            $cursor->addDay();
        }

        return response()->json($series);
    }

    /**
     * Số đơn theo trạng thái trong khoảng
     * Trả tổng mỗi trạng thái để render pie/donut.
     */
    public function ordersByStatus(Request $request)
    {
        [$from, $to] = $this->parseRange($request);

        $rows = Order::whereBetween('created_at', [$from, $to])
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->orderByDesc('total')
            ->get();

        return response()->json($rows);
    }

    /**
     * Top sản phẩm bán chạy (số lượng & doanh thu) trong khoảng
     * GET /admin/stats/top-products?limit=5&from=&to=
     */
    public function topProducts(Request $request)
    {
        [$from, $to] = $this->parseRange($request);
        $limit = (int)($request->query('limit', 5));

        $rows = OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$from, $to])
            ->select([
                'order_items.product_id',
                'products.name as product_name',
                'products.thumbnail_url',
                DB::raw('SUM(order_items.quantity) as total_qty'),
                DB::raw('SUM(order_items.quantity * order_items.price) as revenue'),
            ])
            ->groupBy('order_items.product_id', 'products.name', 'products.thumbnail_url')
            ->orderByDesc('total_qty')
            ->limit($limit)
            ->get();

        return response()->json($rows);
    }

    /**
     * Doanh thu theo danh mục (sum quantity*price) trong khoảng
     * GET /admin/stats/sales-by-category?limit=8
     */
    public function salesByCategory(Request $request)
    {
        [$from, $to] = $this->parseRange($request);
        $limit = (int)($request->query('limit', 8));

        $rows = OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$from, $to])
            ->select([
                DB::raw('COALESCE(categories.name, "Uncategorized") as category_name'),
                DB::raw('SUM(order_items.quantity) as total_qty'),
                DB::raw('SUM(order_items.quantity * order_items.price) as revenue'),
            ])
            ->groupBy('category_name')
            ->orderByDesc('revenue')
            ->limit($limit)
            ->get();

        return response()->json($rows);
    }

    /**
     * Top khách hàng theo chi tiêu (paid) trong khoảng
     * GET /admin/stats/top-customers?limit=5
     */
    public function topCustomers(Request $request)
    {
        [$from, $to] = $this->parseRange($request);
        $limit = (int)($request->query('limit', 5));

        $rows = Order::query()
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$from, $to])
            ->select([
                'users.id as user_id',
                'users.name as user_name',
                'users.email',
                DB::raw('COUNT(orders.id) as orders_count'),
                DB::raw('SUM(orders.total_amount) as total_spent'),
            ])
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('total_spent')
            ->limit($limit)
            ->get();

        return response()->json($rows);
    }

    /**
     * Doanh thu theo giờ trong ngày hôm nay (để vẽ line/area chart)
     */
    public function hourlyToday()
    {
        $todayStart = Carbon::today();
        $todayEnd   = Carbon::today()->endOfDay();

        $rows = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$todayStart, $todayEnd])
            ->selectRaw('HOUR(created_at) as h, SUM(total_amount) as revenue')
            ->groupBy('h')
            ->orderBy('h')
            ->get()
            ->keyBy('h');

        $series = [];
        for ($h = 0; $h < 24; $h++) {
            $series[] = [
                'hour'    => sprintf('%02d:00', $h),
                'revenue' => (float) ($rows[$h]->revenue ?? 0),
            ];
        }

        return response()->json($series);
    }

    /**
     * Doanh thu theo tháng trong năm hiện tại (12 cột)
     */
    public function monthlyRevenue()
    {
        $year = now()->year;

        $rows = Order::where('payment_status', 'paid')
            ->whereYear('created_at', $year)
            ->selectRaw('MONTH(created_at) as m, SUM(total_amount) as revenue')
            ->groupBy('m')
            ->orderBy('m')
            ->get()
            ->keyBy('m');

        $series = [];
        for ($m = 1; $m <= 12; $m++) {
            $series[] = [
                'month'   => $m,
                'revenue' => (float) ($rows[$m]->revenue ?? 0),
            ];
        }

        return response()->json($series);
    }
}
