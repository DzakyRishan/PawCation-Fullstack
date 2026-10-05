<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * Mengembalikan semua produk, bisa difilter lewat ?category=Dog
     */
    public function index(Request $request)
    {
        $query = Product::query();

        if ($request->has('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $query->where('name', 'ILIKE', '%' . $request->search . '%');
        }

        $products = $query->orderBy('id')->get();

        return response()->json($products);
    }

    /**
     * GET /api/products/{id}
     * Mengembalikan detail satu produk
     */
    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }

        return response()->json($product);
    }
}