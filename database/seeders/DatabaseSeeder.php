<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Event;
use App\Models\BringItem;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::factory()->count(8)->create();

        $events = Event::factory()->count(5)->create();

        // Participations
        foreach ($events as $event) {
            // Host already in events.host_id
            $guests = $users->random(5);
            foreach ($guests as $user) {
                $event->participants()->attach($user->id, [
                    'role' => 'guest',
                    'status' => fake()->randomElement(['going','maybe','invited']),
                ]);
            }

            // Bring-mit-Items
            BringItem::factory()->count(4)->create(['event_id' => $event->id]);
        }
    }
}
