<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\JuridicoUser;
use Illuminate\Support\Facades\Hash;

class JuridicoAuthController extends Controller
{
    public function showLoginForm()
    {
        return Inertia::render('Juridico/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = JuridicoUser::where('username', $request->username)->first();

        if ($user && Hash::check($request->password, $user->password)) {
            $request->session()->put('juridico_user', $user);
            return redirect()->intended(route('juridico.index'));
        }

        return back()->withErrors([
            'username' => 'Las credenciales proporcionadas no coinciden con nuestros registros.',
        ]);
    }

    public function logout(Request $request)
    {
        $request->session()->forget('juridico_user');
        return redirect()->route('juridico.login');
    }
}
