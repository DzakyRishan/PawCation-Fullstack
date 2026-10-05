<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pet extends Model
{
    use HasFactory;

    protected $appends = ['photo_url'];

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'breed',
        'age',
        'weight',
        'gender',
        'allergy_notes',
        'photo',
    ];

    public function getPhotoUrlAttribute(): ?string
    {
        if (!$this->photo) {
            return null;
        }

        return url('storage/'.$this->photo);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function hotelBookings()
    {
    return $this->hasMany(HotelBooking::class);
    }

    public function ConsultBooking()
    {
    return $this->hasMany(ConsultBooking::class);
    }
}