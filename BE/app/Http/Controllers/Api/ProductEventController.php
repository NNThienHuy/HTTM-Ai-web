<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductEvent;
use Illuminate\Http\Request;

class ProductEventController extends Controller
{
  public function store(Request $req, int $id) {
    $data = $req->validate([
      'event' => 'required|in:view,click,add_to_cart,purchase',
      'dwell_ms' => 'nullable|integer|min:0'
    ]);
    ProductEvent::create([
      'product_id' => $id,
      'user_id'    => optional($req->user())->id,
      'session_id' => session()->getId(),
      'event'      => $data['event'],
      'dwell_ms'   => $data['dwell_ms'] ?? null,
    ]);
    return response()->json(['ok'=>true]);
  }
}
