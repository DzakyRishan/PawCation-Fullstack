<?php

namespace App\Http\Controllers;

use App\Models\ConsultBooking;
use App\Models\HotelBooking;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class OwnerController extends Controller
{
    public function stats()
    {
        $revenue = Order::sum('total_price')
            + HotelBooking::where('status', '!=', 'cancelled')->sum('total_price')
            + ConsultBooking::where('status', '!=', 'cancelled')->sum('total_price');

        return response()->json([
            'total_revenue' => (float) $revenue,
            'total_customers' => User::where('role', 'customer')->count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'active_branches' => 1,
        ]);
    }

    public function admins()
    {
        $admins = User::where('role', 'admin')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'created_at']);

        return response()->json($admins);
    }

    public function storeAdmin(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
        ]);

        return response()->json($admin, 201);
    }

    public function destroyAdmin(User $user)
    {
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Bukan akun admin'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Admin dihapus']);
    }
}
