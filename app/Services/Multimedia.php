<?php

namespace App\Services;

use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Illuminate\Support\Facades\Storage;

class Multimedia
{
    protected $rutasGuardado = [
        'juridico' => 'uploads/juridico'
    ];

    public function guardarImagen($image, $tipo)
    {
        try {
            if (!array_key_exists($tipo, $this->rutasGuardado)) {
                return false;
            }

            $nameImage = Str::uuid() . '.' . $image->extension();
            $serverImage = ImageManager::gd()->read($image);
            //$serverImage->cover(1200, 800);

            $targetPath = $this->rutasGuardado[$tipo];
            $encoded = $serverImage->encode();

            if (!$encoded) {
                return false;
            }

            $respuesta = Storage::disk('public')->put($targetPath . '/' . $nameImage, $encoded);

            return $respuesta ? $nameImage : false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function guardarArchivoPdf($archivo, $tipo, $cliente)
    {
        if ($archivo->getClientMimeType() !== 'application/pdf') {
            return false;
        }

        if (!array_key_exists($tipo, $this->rutasGuardado)) {
            return false;
        }

        $nameFile = Str::uuid() . '.pdf';
        $targetPath = $this->rutasGuardado[$tipo];
        $rutaCompleta = $targetPath . '/' . $cliente . '/' . $nameFile; 

        $respuesta = Storage::disk('public')->put($rutaCompleta, file_get_contents($archivo));

        return $respuesta ? $nameFile : false;
    }
}
