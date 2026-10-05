<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\HotelBookingController;
use App\Http\Controllers\ConsultBookingController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PetTaxiController;
use App\Http\Controllers\CctvController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\DashboardController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::get('/dashboard', [DashboardController::class, 'customer']);

    Route::apiResource('pets', PetController::class);
    Route::post('pets/{pet}/photo', [PetController::class, 'uploadPhoto']);
    Route::apiResource('hotel-bookings', HotelBookingController::class);
    Route::apiResource('consult-bookings', ConsultBookingController::class);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);

    Route::get('/pet-taxi', [PetTaxiController::class, 'index']);
    Route::post('/pet-taxi', [PetTaxiController::class, 'store']);
    Route::patch('/pet-taxi/{petTaxiRequest}/cancel', [PetTaxiController::class, 'cancel']);

    Route::get('/cctv/sessions', [CctvController::class, 'activeSessions']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/hotel-bookings', [AdminController::class, 'hotelBookings']);
        Route::patch('/hotel-bookings/{hotelBooking}', [AdminController::class, 'updateHotelBooking']);
        Route::get('/consult-bookings', [AdminController::class, 'consultBookings']);
        Route::patch('/consult-bookings/{consultBooking}', [AdminController::class, 'updateConsultBooking']);
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::patch('/orders/{order}', [AdminController::class, 'updateOrder']);
    });

    Route::middleware('role:owner')->prefix('owner')->group(function () {
        Route::get('/stats', [OwnerController::class, 'stats']);
        Route::get('/admins', [OwnerController::class, 'admins']);
        Route::post('/admins', [OwnerController::class, 'storeAdmin']);
        Route::delete('/admins/{user}', [OwnerController::class, 'destroyAdmin']);
    });
});
