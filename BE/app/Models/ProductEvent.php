<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ProductEvent extends Model {
  protected $fillable = ['product_id','user_id','session_id','event','dwell_ms'];
}
