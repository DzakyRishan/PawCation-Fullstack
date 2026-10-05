<?php

namespace App\Http\Controllers;

use App\Models\HotelBooking;
use Illuminate\Http\Request;

class CctvController extends Controller
{
    public function activeSessions(Request $request)
    {
        $sessions = HotelBooking::with('pet')
            ->where('user_id', $request->user()->id)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->orderByDesc('check_in')
            ->get();

        return response()->json($sessions);
    }
}
