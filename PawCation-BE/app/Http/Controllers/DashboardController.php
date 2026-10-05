<?php

namespace App\Http\Controllers;

use App\Models\ConsultBooking;
use App\Models\HotelBooking;
use App\Models\Order;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function customer(Request $request)
    {
        $user = $request->user()->load('pets');
        $userId = $user->id;
        $today = now()->toDateString();

        $upcomingHotel = HotelBooking::with('pet')
            ->where('user_id', $userId)
            ->whereNotIn('status', ['cancelled', 'checked_out'])
            ->where('check_out', '>=', $today)
            ->orderBy('check_in')
            ->limit(3)
            ->get();

        $upcomingConsult = ConsultBooking::with('pet')
            ->where('user_id', $userId)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->where('consult_date', '>=', $today)
            ->orderBy('consult_date')
            ->limit(3)
            ->get();

        $ordersCount = Order::where('user_id', $userId)->count();
        $activeHotel = HotelBooking::where('user_id', $userId)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->count();

        return response()->json([
            'user' => $user,
            'stats' => [
                'pets' => $user->pets->count(),
                'orders' => $ordersCount,
                'active_hotel_sessions' => $activeHotel,
            ],
            'upcoming_hotel' => $upcomingHotel,
            'upcoming_consult' => $upcomingConsult,
        ]);
    }
}
