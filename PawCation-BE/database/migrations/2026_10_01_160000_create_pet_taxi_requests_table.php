<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pet_taxi_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pet_id')->constrained()->cascadeOnDelete();
            $table->string('pickup_address');
            $table->string('dropoff_address');
            $table->time('pickup_time');
            $table->enum('status', ['pending', 'on_the_way', 'completed', 'cancelled'])->default('pending');
            $table->string('driver_name')->nullable();
            $table->string('driver_vehicle')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pet_taxi_requests');
    }
};
