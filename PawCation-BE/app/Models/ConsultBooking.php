<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsultBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'pet_id',
        'package',
        'doctor',
        'consult_date',
        'consult_time',
        'notes',
        'total_price',
        'status',
    ];

    protected $casts = [
        'consult_date' => 'date',
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