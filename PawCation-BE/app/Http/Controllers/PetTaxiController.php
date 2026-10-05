<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\PetTaxiRequest;
use Illuminate\Http\Request;

class PetTaxiController extends Controller
{
    public function index(Request $request)
    {
        $requests = PetTaxiRequest::with('pet')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($requests);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pet_id' => 'required|exists:pets,id',
            'pickup_address' => 'required|string|max:500',
            'dropoff_address' => 'required|string|max:500',
            'pickup_time' => 'required',
        ]);

        $pet = Pet::findOrFail($validated['pet_id']);
        if ($pet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $taxi = PetTaxiRequest::create([
            'user_id' => $request->user()->id,
            'pet_id' => $validated['pet_id'],
            'pickup_address' => $validated['pickup_address'],
            'dropoff_address' => $validated['dropoff_address'],
            'pickup_time' => $validated['pickup_time'],
            'status' => 'on_the_way',
            'driver_name' => 'Kang Somad',
            'driver_vehicle' => 'Toyota Avanza · B 1234 XYZ',
        ]);

        return response()->json($taxi->load('pet'), 201);
    }

    public function cancel(Request $request, PetTaxiRequest $petTaxiRequest)
    {
        if ($petTaxiRequest->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($petTaxiRequest->status === 'completed') {
            return response()->json(['message' => 'Pesanan sudah selesai'], 422);
        }

        $petTaxiRequest->update(['status' => 'cancelled']);

        return response()->json($petTaxiRequest->load('pet'));
    }
}
