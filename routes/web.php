<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\LocationController;

Route::get('/', function () {
    $events = \App\Models\Event::with('location:id,name')
        ->select([
            DB::raw("date(day) as date"),
            DB::raw("CAST(strftime('%H', time) AS INTEGER) as hour"),
            'name',
            'description',
            'time',
            'duration',
            'location_id',
        ])
        ->orderBy('day')
        ->orderBy('time')
        ->get()
        ->groupBy('date')
        ->map(function ($dayEvents, $date) {
            return [
                'date' => date('l, F j, Y', strtotime($date)),
                'hourBlocks' => $dayEvents->groupBy('hour')
                    ->map(function ($hourEvents, $hour) {
                        return [
                            'hour' => date('g A', strtotime("$hour:00")),
                            'events' => $hourEvents->map(function ($event) {
                                return [
                                    'name' => $event->name,
                                    'description' => $event->description,
                                    'time' => date('g:i A', strtotime($event->time)),
                                    'duration' => $event->duration,
                                    'location' => $event->location->name,
                                ];
                            }),
                        ];
                    })->values(),
            ];
        })->values();

    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'eventsByDay' => $events,
    ]);
});

Route::group(['middleware' => 'auth'], function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/events', [EventController::class, 'index'])->name('events.index');
    Route::get('/events/create', [EventController::class, 'create'])->name('events.create');
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::get('/events/{event}/edit', [EventController::class, 'edit'])->name('events.edit');
    Route::post('/events/{event}', [EventController::class, 'update'])->name('events.update');

    Route::get('/locations', [LocationController::class, 'index'])->name('locations.index');
    Route::get('/locations/create', [LocationController::class, 'create'])->name('locations.create');
    Route::post('/locations', [LocationController::class, 'store'])->name('locations.store');
    Route::get('/locations/{location}/edit', [LocationController::class, 'edit'])->name('locations.edit');
    Route::post('/locations/{location}', [LocationController::class, 'update'])->name('locations.update');
});

Route::get('/attendees', function () {
    return "Events";
})->name('attendees.index');

Route::get('/analytics', function () {
    return "Events";
})->name('analytics');

// Settings
Route::get('/settings', function () {
    return "Settings";
})->name('settings');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
