<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Laravel con Inertia y React</title>

    @viteReactRefresh

    @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])

    @inertiaHead
</head>

<body>
    @inertia
</body>

</html>