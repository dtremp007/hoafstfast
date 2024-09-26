<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::with('location:id,name')
            ->orderBy('day')
            ->orderBy('time')
            ->get();

        return Inertia::render('Events/Index', [
            'events' => $events->load('media'),
        ]);
    }

    public function edit(Event $event)
    {
        $locations = Location::select('id', 'name')->get();

        return Inertia::render('Events/Edit', [
            'event' => $event->load('media'),
            'locations' => $locations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateEvent($request);

        $eventData = array_diff_key($validated, array_flip(['image']));
        $event = Event::create($eventData);

        if ($request->hasFile('image')) {
            $event->addMediaFromRequest('image')->toMediaCollection();
        }

        return redirect()->route('events.edit', $event)
            ->with('success', 'Event created successfully.');
    }

    private function validateEvent(Request $request)
    {
        return Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'location_id' => 'required|exists:locations,id',
            'day' => 'required|date',
            'time' => 'required|date_format:H:i',
            'duration' => 'required|integer|min:15|max:90',
            'image' => 'nullable|image|max:2048',
        ])->validate();
    }

    public function create()
    {
        $locations = Location::select('id', 'name')->get();

        return Inertia::render('Events/Edit', [
            'event' => new Event(),
            'locations' => $locations,
        ]);
    }

    public function update(Request $request, Event $event)
    {
        $validated = $this->validateEvent($request);

        $eventData = array_diff_key($validated, array_flip(['image']));
        $event->update($eventData);

        if ($request->hasFile('image')) {
            $event->clearMediaCollection();
            $event->addMediaFromRequest('image')->toMediaCollection();
        } elseif ($request->boolean('delete_image')) {
            $event->clearMediaCollection('event_image');
        }

        return redirect()->route('events.edit', $event)
            ->with('success', 'Event updated successfully.');
    }
}
