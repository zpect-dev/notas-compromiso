<?php

use App\Http\Controllers\MovimientosCajaController;
use App\Http\Controllers\NotasCompromisoController;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/login', function (Request $request) {
//     $token = $request->query('token');
//     // dd($token);

//     $user = Usuario::find($token);
// });
Route::get('/notas', [NotasCompromisoController::class, 'index']);
Route::post('/nota/{nota:fact_num}', [NotasCompromisoController::class, 'store']);

Route::get('/movimientos', [MovimientosCajaController::class, 'index']);
Route::post('/movimiento/{movimiento:mov_num}', [MovimientosCajaController::class, 'store']);