<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PetController extends Controller
{
    public function index(Request $request)
    {
        $pets = $request->user()->pets;
        return response()->json($pets);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:kucing,anjing',
            'breed' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'gender' => 'nullable|in:jantan,betina',
            'allergy_notes' => 'nullable|string',
        ]);

        if ($request->hasFile('photo')) {
            $request->validate([
                'photo' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120',
            ]);
            $data['photo'] = $request->file('photo')->store(
                'pets/'.$request->user()->id,
                'public'
            );
        }

        $pet = $request->user()->pets()->create($data);

        return response()->json($pet, 201);
    }

    public function show(Request $request, Pet $pet)
    {
        if ($pet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($pet);
    }

    public function update(Request $request, Pet $pet)
    {
        if ($pet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:kucing,anjing',
            'breed' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric|min:0',
            'gender' => 'nullable|in:jantan,betina',
            'allergy_notes' => 'nullable|string',
        ]);

        $pet->update($data);

        return response()->json($pet);
    }

    public function uploadPhoto(Request $request, Pet $pet)
    {
        if ($pet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        $this->deletePetPhoto($pet->photo);

        $path = $request->file('photo')->store(
            'pets/'.$request->user()->id,
            'public'
        );

        $pet->update(['photo' => $path]);

        return response()->json($pet->fresh());
    }

    public function destroy(Request $request, Pet $pet)
    {
        if ($pet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->deletePetPhoto($pet->photo);
        $pet->delete();

        return response()->json(['message' => 'Pet berhasil dihapus']);
    }

    private function deletePetPhoto(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
