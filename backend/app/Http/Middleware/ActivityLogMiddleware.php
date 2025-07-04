<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Facades\CauserResolver;

class ActivityLogMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Set the authenticated user as the causer for activity logs
        if (Auth::check()) {
            CauserResolver::setCauser(Auth::user());
        }

        return $next($request);
    }
}
