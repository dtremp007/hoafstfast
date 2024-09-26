<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::withCount('events')
            ->orderBy('name')
            ->get();

        return Inertia::render('Locations/Index', [
            'locations' => $locations,
        ]);
    }

    public function edit(Location $location)
    {
        return Inertia::render('Locations/Edit', [
            'location' => $location->load('media'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateLocation($request);

        $locationData = array_diff_key($validated, array_flip(['image']));
        $location = Location::create($locationData);

        if ($request->hasFile('image')) {
            $location->addMediaFromRequest('image')->toMediaCollection();
        }

        return redirect()->route('locations.edit', $location)
            ->with('success', 'Location created successfully.');
    }

    private function validateLocation(Request $request)
    {
        return Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
        ])->validate();
    }

    public function create()
    {
        return Inertia::render('Locations/Edit', [
            'location' => new Location(),
        ]);
    }

    public function update(Request $request, Location $location)
    {
        $validated = $this->validateLocation($request);

        $locationData = array_diff_key($validated, array_flip(['image']));
        $location->update($locationData);

        if ($request->hasFile('image')) {
            $location->clearMediaCollection();
            $location->addMediaFromRequest('image')->toMediaCollection();
        } elseif ($request->boolean('delete_image')) {
            $location->clearMediaCollection();
        }

        return redirect()->route('locations.edit', $location)
            ->with('success', 'Location updated successfully.');
    }

    public function destroy(Location $location)
    {
        $location->delete();

        return redirect()->route('locations.index')
            ->with('success', 'Location deleted successfully.');
    }
}
