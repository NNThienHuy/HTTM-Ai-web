<?php

namespace App\Http\Controllers;

use App\Services\RecommendationService;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    protected $recService;

    public function __construct(RecommendationService $recService)
    {
        $this->recService = $recService;
    }

    public function getPersonalized(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->customer) {
            return response()->json(['success' => false, 'message' => 'Yêu cầu đăng nhập'], 401);
        }

        $recommendations = $this->recService->getRecommendations($user->customer->customer_id);

        return response()->json([
            'success' => true,
            'method' => 'Collaborative Filtering (KNN)',
            'data' => $recommendations
        ]);
    }
}