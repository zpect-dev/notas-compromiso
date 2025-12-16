<?php

use App\Http\Controllers\JuridicoController;
use App\Http\Controllers\MovimientosCajaController;
use App\Http\Controllers\NotasCompromisoController;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;


// Mostrar formulario de login o permitir login por token
Route::get('/login', function (Request $request) {
    return Inertia::render('Login');
});

// Procesar formulario de login (usuario + clave)
Route::post('/login', function (Request $request) {
    $request->validate([
        'usuario' => 'required|string',
        'clave' => 'required|string',
    ]);

    $user = Usuario::where('usuario', $request->input('usuario'))->first();
    if (! $user) {
        return back()->withErrors(['usuario' => 'Usuario no encontrado'])->withInput();
    }

    $password = $request->input('clave');
    $valid = false;

    // Si la contraseña en DB está hasheada, Hash::check funcionará.
    if (Hash::check($password, $user->clave)) {
        $valid = true;
    }

    // Soporte temporal para contraseñas en texto claro: verificamos igualdad
    // y migramos a hash en el primer login exitoso.
    if (! $valid && $user->clave === $password) {
        $user->clave = Hash::make($password);
        $user->save();
        $valid = true;
    }

    if (! $valid) {
        return back()->withErrors(['clave' => 'Clave incorrecta'])->withInput();
    }

    $request->session()->put('usuario', ['id' => $user->id_u ?? $user->getKey(), 'usuario' => $user->usuario]);
    return redirect()->intended('/movimientos');
});

// Logout simple
Route::get('/logout', function (Request $request) {
    $request->session()->forget('usuario');
    $request->session()->regenerate(true);
    return redirect('/login');
});

Route::get('/denied', function () {
    return 'Acceso denegado. Por favor, inicie sesión.';
})->name('volver');

// Rutas de la aplicación: los controladores validarán la sesión al inicio
Route::get('/notas', [NotasCompromisoController::class, 'index']);
Route::post('/nota/{nota:fact_num}', [NotasCompromisoController::class, 'store']);

Route::get('/movimientos', [MovimientosCajaController::class, 'index']);
Route::post('/movimiento/{movimiento:mov_num}', [MovimientosCajaController::class, 'store']);

Route::get('/juridico', [JuridicoController::class, 'index'])->name('juridico.index');
Route::get('/juridico/{cliente}', [JuridicoController::class, 'show'])->name('juridico.show');
Route::post('/juridico/{cliente}/archivo', [JuridicoController::class, 'subirArchivo'])->name('juridico.archivo');