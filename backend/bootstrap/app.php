<?php

use Illuminate\Foundation\Application;
use App\Http\Middleware\NullMiddleware;
use App\Http\Middleware\PermissionMiddleware;
use App\Http\Middleware\ActivityLogMiddleware;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();
        $middleware->alias([
              'permission' => PermissionMiddleware::class,
              'request.null' => NullMiddleware::class,
              'activity.log' => ActivityLogMiddleware::class,
        ]);
        // Add activity log middleware globally to API routes
        $middleware->api([
            ActivityLogMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();