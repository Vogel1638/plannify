<?php

namespace Database\Factories;

use App\Models\BringItem;
use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;

class BringItemFactory extends Factory
{
    protected $model = BringItem::class;

    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'name' => $this->faker->randomElement(['Cola','Chips','Salat','Brot','Kohle']),
            'description' => $this->faker->sentence(),
            'quantity' => $this->faker->randomElement([1,2,4,6,10]),
            'is_optional' => $this->faker->boolean(20), // 20% chance of being optional
            'is_claimed' => false,
            'claimed_by' => null,
            'claimed_at' => null,
        ];
    }
}
