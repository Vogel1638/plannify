<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        $public = $this->faker->boolean(40);
        return [
            'host_id' => User::factory(),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'visibility' => $public ? 'public' : 'private',
            'public_slug' => $public ? Str::slug($this->faker->unique()->sentence(3).'-'.Str::random(6)) : null,
            'location_name' => $this->faker->city(),
            'location_address' => $this->faker->address(),
            'starts_at' => $this->faker->dateTimeBetween('+1 days', '+30 days'),
            'ends_at' => null,
            'requires_approval' => $public ? $this->faker->boolean() : false,
            'participant_limit' => $public ? $this->faker->numberBetween(5, 30) : null,
        ];
    }
}
