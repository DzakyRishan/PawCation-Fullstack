<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PetTaxiRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pet_id',
        'pickup_address',
        'dropoff_address',
        'pickup_time',
        'status',
        'driver_name',
        'driver_vehicle',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }
}
