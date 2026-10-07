<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Kolom category dibuat sebagai enum (varchar + CHECK constraint) di Postgres.
        // Longgarkan jadi string bebas agar kategori baru (Makanan Anjing, dll) diterima.
        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check');
            DB::statement("ALTER TABLE products ALTER COLUMN category SET DEFAULT 'All'");
        }
    }

    public function down(): void
    {
        // Tidak mengembalikan CHECK constraint lama agar data kategori baru tetap valid.
    }
};
