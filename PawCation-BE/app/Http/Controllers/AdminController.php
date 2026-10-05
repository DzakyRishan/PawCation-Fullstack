<?php

namespace App\Http\Controllers;

use App\Models\ConsultBooking;
use App\Models\HotelBooking;
use App\Models\Order;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats()
    {
        $today = now()->toDateString();

        $hotelToday = HotelBooking::whereDate('created_at', $today)->count();
        $consultToday = ConsultBooking::whereDate('created_at', $today)->count();
        $ordersToday = Order::whereDate('created_at', $today)->count();
        $activeHotel = HotelBooking::whereIn('status', ['confirmed', 'checked_in'])->count();

        return response()->json([
            'bookings_today' => $hotelToday + $consultToday,
            'orders_today' => $ordersToday,
            'rooms_occupied' => $activeHotel,
            'cctv_active' => $activeHotel,
        ]);
    }

    public function hotelBookings()
    {
        $bookings = HotelBooking::with(['pet', 'user'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($bookings);
    }

    public function updateHotelBooking(Request $request, HotelBooking $hotelBooking)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,checked_in,checked_out,cancelled',
        ]);

        $hotelBooking->update($validated);

        return response()->json($hotelBooking->load(['pet', 'user']));
    }

    public function consultBookings()
    {
        $bookings = ConsultBooking::with(['pet', 'user'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($bookings);
    }

    public function updateConsultBooking(Request $request, ConsultBooking $consultBooking)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
        ]);

        $consultBooking->update($validated);

        return response()->json($consultBooking->load(['pet', 'user']));
    }

    public function orders()
    {
        $orders = Order::with(['items.product', 'user'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders);
    }

    public function updateOrder(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,paid,cancelled',
        ]);

        $order->update($validated);

        return response()->json($order->load(['items.product', 'user']));
    }
}
