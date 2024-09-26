<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\Location;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    public function run()
    {
        // First, let's create some locations
        $locations = [
            Location::create(['name' => 'Main Stage']),
            Location::create(['name' => 'Food Court']),
            Location::create(['name' => 'Crafts Area']),
            Location::create(['name' => 'Kids Zone']),
            Location::create(['name' => 'Farmer\'s Market']),
        ];

        // Define some event types
        $eventTypes = [
            'Concert' => [60, 90, 120],
            'Workshop' => [45, 60],
            'Food Tasting' => [30, 45],
            'Kids Activity' => [30, 45, 60],
            'Market Opening' => [240],
            'Parade' => [60],
        ];

        // Get the start of the current week
        $startDate = Carbon::now()->startOfWeek();

        // Generate events for each day of the week
        for ($day = 0; $day < 3; $day++) {
            $date = $startDate->copy()->addDays($day);

            // Generate 5-10 events per day
            $numEvents = rand(5, 10);

            for ($i = 0; $i < $numEvents; $i++) {
                $eventType = array_rand($eventTypes);
                $duration = $eventTypes[$eventType][array_rand($eventTypes[$eventType])];
                $location = $locations[array_rand($locations)];

                $startTime = $date->copy()->setTime(rand(9, 20), rand(0, 3) * 15, 0);

                Event::create([
                    'name' => "Harvest Festival: $eventType",
                    'description' => "Join us for this exciting $eventType event at the Harvest Festival!",
                    'day' => $date->toDateString(),
                    'time' => $startTime->toTimeString(),
                    'duration' => $duration,
                    'location_id' => $location->id,
                ]);
            }
        }
    }
}
