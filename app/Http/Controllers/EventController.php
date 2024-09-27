<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use League\Csv\Reader;
use League\Csv\Writer;

class EventController extends Controller
{
    public function index()
    {
        $events = Event::with('location:id,name')
            ->orderBy('day')
            ->orderBy('time')
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'description' => $event->description,
                    'day' => $event->day,
                    'time' => $event->time,
                    'duration' => $event->duration,
                    'location' => $event->location->name,
                ];
            });

        return Inertia::render('Events/Index', [
            'events' => $events,
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
            'description' => 'nullable|string',
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

    public function destroy(Event $event)
    {
        $event->delete();

        return redirect()->route('events.index')
            ->with('success', 'Event deleted successfully.');
    }

    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        if ($validator->fails()) {
            return redirect()->route('events.index')
                ->with('error', $validator->errors()->first());
        }

        $file = $request->file('file');

        try {
            $csv = Reader::createFromPath($file->getPathname(), 'r');
            $csv->setHeaderOffset(0);

            $records = $csv->getRecords();
        } catch (\Exception $e) {
            return redirect()->route('events.index')
                ->with('error', 'Error reading CSV file: ' . $e->getMessage());
        }

        $createdCount = 0;
        $updatedCount = 0;
        $errors = [];

        foreach ($records as $offset => $record) {
            try {
                $location = Location::firstOrCreate(['name' => $record['location']]);

                $eventData = [
                    'name' => $record['name'],
                    'description' => $record['description'],
                    'day' => $record['day'],
                    'time' => $record['time'],
                    'duration' => $record['duration'],
                    'location_id' => $location->id,
                ];

                if (isset($record['id']) && $record['id']) {
                    $event = Event::find($record['id']);
                    if ($event) {
                        $event->update($eventData);
                        $updatedCount++;
                    } else {
                        throw new \Exception("Event with ID {$record['id']} not found.");
                    }
                } else {
                    Event::create($eventData);
                    $createdCount++;
                }
            } catch (\Exception $e) {
                $errors[] = "Row {$offset}: " . $e->getMessage();
            }
        }

        $message = "{$createdCount} events created, {$updatedCount} events updated successfully.";
        if ($errors) {
            return redirect()->route('events.index')
                ->with('error', $message . "\nErrors occurred:\n" . implode("\n", $errors));
        }

        return redirect()->route('events.index')
            ->with('success', $message);
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

    public function export()
    {
        // Fetch all events with their associated locations
        $events = Event::with('location')->get();

        // Create a new CSV Writer object
        $csv = Writer::createFromString('');

        // Insert the header row
        $csv->insertOne(['id', 'name', 'description', 'day', 'time', 'duration', 'location']);

        // Insert event data
        foreach ($events as $event) {
            $csv->insertOne([
                $event->id,
                $event->name,
                $event->description,
                $event->day,
                $event->time,
                $event->duration,
                $event->location->name,
            ]);
        }

        // Set headers for download
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="events.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        // Return the CSV file as a download
        return response($csv->getContent(), 200, $headers);
    }
}
