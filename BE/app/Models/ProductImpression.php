<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ProductImpression extends Model {
  protected $fillable = ['product_id','user_id','session_id','block','position'];
}
