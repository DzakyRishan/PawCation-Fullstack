<?php

namespace App\Http\Controllers;

use App\Models\ConsultBooking;
use App\Models\Pet;
use Illuminate\Http\Request;

class ConsultBookingController extends Controller
{
    // GET /api/consult-bookings - list semua booking milik user yang login
    public function index(Request $request)
    {
        $bookings = ConsultBooking::with('pet')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    // POST /api/consult-bookings - buat booking konsultasi baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'package' => 'required|in:basic,vaccine,dental,full_body',
            'doctor' => 'required|string|max:255',
            'consult_date' => 'required|date|after_or_equal:today',
            'consult_time' => 'required',
            'notes' => 'nullable|string',
        ]);

        // Pastikan pet yang dipilih memang milik user ini
        $pet = Pet::findOrFail($validated['pet_id']);
        if ($pet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Hitung total harga berdasarkan paket
$packagePrices = [
    'basic' => 60000,
    'vaccine' => 150000,
    'dental' => 200000,
    'full_body' => 350000,
];

$consultFee = 50000; // biaya konsultasi flat per booking

$booking = ConsultBooking::create([
    'user_id' => $request->user()->id,
    'pet_id' => $validated['pet_id'],
    'package' => $validated['package'],
    'doctor' => $validated['doctor'],
    'consult_date' => $validated['consult_date'],
    'consult_time' => $validated['consult_time'],
    'notes' => $validated['notes'] ?? null,
    'total_price' => $packagePrices[$validated['package']] + $consultFee,
    'status' => 'pending',
]);

        return response()->json($booking->load('pet'), 201);
    }

    // GET /api/consult-bookings/{id} - detail satu booking
    public function show(Request $request, ConsultBooking $consultBooking)
    {
        if ($consultBooking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($consultBooking->load('pet'));
    }

    // PUT/PATCH /api/consult-bookings/{id} - update status booking
    public function update(Request $request, ConsultBooking $consultBooking)
    {
        if ($consultBooking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'sometimes|required|in:pending,confirmed,completed,cancelled',
        ]);

        $consultBooking->update($validated);

        return response()->json($consultBooking->load('pet'));
    }

    // DELETE /api/consult-bookings/{id} - batalkan booking
    public function destroy(Request $request, ConsultBooking $consultBooking)
    {
        if ($consultBooking->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $consultBooking->delete();

        return response()->json(['message' => 'Booking konsultasi berhasil dihapus']);
    }
}