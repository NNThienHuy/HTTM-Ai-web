<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ProductMetric extends Model {
  protected $fillable = [
    'product_id','impressions_decay','clicks_decay','add_to_cart_decay','purchases_decay',
    'alpha_click','beta_click','alpha_cart','beta_cart','alpha_purchase','beta_purchase'
  ];
}
