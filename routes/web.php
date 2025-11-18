<?php

use App\Http\Controllers\NotasCompromisoController;
use Illuminate\Support\Facades\Route;

Route::get('/', [NotasCompromisoController::class, 'index']);
// Route::get('/notas', [NotasCompromisoController::class, 'index']);