<?php

namespace App\Http\Controllers;

use App\Models\HotelBooking;
use App\Models\Pet;
use Illuminate\Http\Request;

class HotelBookingController extends Controller
{
    // GET /api/hotel-bookings - list semua booking milik user yang login
    public function index(Request $request)
    {
        $bookings = HotelBooking::with('pet')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    // POST /api/hotel-bookings - buat booking baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'room_type' => 'required|in:standard,deluxe,vip',
            'addons' => 'nullable|array',
        ]);

        // Pastikan pet yang dipilih memang milik user ini
        $pet = Pet::findOrFail($validated['pet_id']);
        if ($pet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Hitung total harga
        $roomPrices = [
            'standard' => 100000,
            'deluxe' => 175000,
            'vip' => 250000,
        ];
        $addonPrices = [
            'grooming' => 50000,
            'pettaxi' => 40000,
            'vetcheck' => 75000,
        ];

        $nights = (new \DateTime($validated['check_in']))
            ->diff(new \DateTime($validated['check_out']))->days;

        $roomTotal = $roomPrices[$validated['room_type']] * $nights;
        $addonTotal = 0;
        foreach ($validated['addons'] ?? [] as $addon) {
            $addonTotal += $addonPrices[$addon] ?? 0;
        }

        $booking = HotelBooking::create([
            'user_id' => $request->user()->id,
            'pet_id' => $validated['pet_id'],
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'room_type' => $validated['room_type'],
            'addons' => $validated['addons'] ?? [],
            'total_price' => $roomTotal + $addonTotal,
            'status' => 'pending',
        ]);

        return response()->json($booking->load('pet'), 201);
    }

    // GET /api/hotel-bookings/{id} - detail satu booking
    public function show(Request $request, HotelBooking $hotelBooking)
    {
        if ($hotelBooking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($hotelBooking->load('pet'));
    }

    // PUT/PATCH /api/hotel-bookings/{id} - update status booking
    public function update(Request $request, HotelBooking $hotelBooking)
    {
        if ($hotelBooking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'sometimes|required|in:pending,confirmed,checked_in,checked_out,cancelled',
        ]);

        $hotelBooking->update($validated);

        return response()->json($hotelBooking->load('pet'));
    }

    // DELETE /api/hotel-bookings/{id} - batalkan/hapus booking
    public function destroy(Request $request, HotelBooking $hotelBooking)
    {
        if ($hotelBooking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $hotelBooking->delete();

        return response()->json(['message' => 'Booking berhasil dihapus']);
    }
}