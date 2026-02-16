<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CreateEventTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_event(): void
    {
        $response = $this->postJson('/api/v1/events', [
            'title' => 'Test Event',
            'visibility' => 'private',
            'starts_at' => '2025-09-12T18:30:00+02:00',
        ]);

        $response->assertStatus(401);
        $response->assertJsonStructure([
            'status',
            'error',
            'message',
            'request_id'
        ]);
    }

    public function test_validation_errors_are_returned(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/v1/events', [
            // Fehlende required Felder
            'description' => 'Test Description',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['title', 'visibility', 'starts_at']);
    }

    public function test_validation_errors_for_invalid_data(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/v1/events', [
            'title' => 'Test Event',
            'visibility' => 'invalid_visibility',
            'starts_at' => 'invalid-date',
            'ends_at' => '2025-09-12T16:30:00+02:00', // Vor starts_at
            'location_lat' => 100, // Out of range
            'location_lng' => 200, // Out of range
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'visibility',
            'starts_at',
            'ends_at',
            'location_lat',
            'location_lng'
        ]);
    }

    public function test_user_can_create_private_event_without_slug(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $eventData = [
            'title' => 'Private Test Event',
            'description' => 'Ein privates Event',
            'visibility' => 'private',
            'starts_at' => '2025-09-12T18:30:00+02:00',
            'ends_at' => '2025-09-12T23:00:00+02:00',
            'requires_approval' => true,
            'participant_limit' => 10,
        ];

        $response = $this->postJson('/api/v1/events', $eventData);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'title',
                'description',
                'visibility',
                'public_slug',
                'location',
                'starts_at',
                'ends_at',
                'requires_approval',
                'participant_limit',
                'host',
                'created_at',
                'updated_at'
            ]
        ]);

        $response->assertJson([
            'data' => [
                'title' => 'Private Test Event',
                'visibility' => 'private',
                'public_slug' => null,
                'requires_approval' => true,
                'participant_limit' => 10,
            ]
        ]);

        $response->assertHeader('Location');

        // Überprüfe, dass das Event in der Datenbank gespeichert wurde
        $this->assertDatabaseHas('events', [
            'title' => 'Private Test Event',
            'host_id' => $user->id,
            'visibility' => 'private',
            'public_slug' => null,
        ]);
    }

    public function test_user_can_create_public_event_with_unique_slug(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $eventData = [
            'title' => 'Public Test Event',
            'description' => 'Ein öffentliches Event',
            'visibility' => 'public',
            'location_name' => 'Test Location',
            'location_address' => 'Test Address 123',
            'location_lat' => 47.2265101,
            'location_lng' => 8.8167087,
            'starts_at' => '2025-09-12T18:30:00+02:00',
            'ends_at' => '2025-09-12T23:00:00+02:00',
            'requires_approval' => false,
            'participant_limit' => 20,
        ];

        $response = $this->postJson('/api/v1/events', $eventData);

        $response->assertStatus(201);
        $response->assertJson([
            'data' => [
                'title' => 'Public Test Event',
                'visibility' => 'public',
                'requires_approval' => false,
                'participant_limit' => 20,
                'location' => [
                    'name' => 'Test Location',
                    'address' => 'Test Address 123',
                    'lat' => 47.2265101,
                    'lng' => 8.8167087,
                ]
            ]
        ]);

        // Überprüfe, dass ein public_slug generiert wurde
        $responseData = $response->json('data');
        $this->assertNotNull($responseData['public_slug']);
        $this->assertStringStartsWith('public-test-event', $responseData['public_slug']);

        // Überprüfe, dass das Event in der Datenbank gespeichert wurde
        $this->assertDatabaseHas('events', [
            'title' => 'Public Test Event',
            'host_id' => $user->id,
            'visibility' => 'public',
            'public_slug' => $responseData['public_slug'],
        ]);
    }

    public function test_public_slug_uniqueness_is_ensured(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        // Erstelle das erste Event
        $firstEventData = [
            'title' => 'Duplicate Title Event',
            'visibility' => 'public',
            'starts_at' => '2025-09-12T18:30:00+02:00',
        ];

        $firstResponse = $this->postJson('/api/v1/events', $firstEventData);
        $firstResponse->assertStatus(201);
        $firstSlug = $firstResponse->json('data.public_slug');

        // Erstelle ein zweites Event mit dem gleichen Titel
        $secondEventData = [
            'title' => 'Duplicate Title Event',
            'visibility' => 'public',
            'starts_at' => '2025-09-13T18:30:00+02:00',
        ];

        $secondResponse = $this->postJson('/api/v1/events', $secondEventData);
        $secondResponse->assertStatus(201);
        $secondSlug = $secondResponse->json('data.public_slug');

        // Überprüfe, dass die Slugs unterschiedlich sind
        $this->assertNotEquals($firstSlug, $secondSlug);
        $this->assertStringStartsWith('duplicate-title-event', $secondSlug);
    }

    public function test_default_values_are_set_correctly(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $eventData = [
            'title' => 'Default Values Test',
            'visibility' => 'private',
            'starts_at' => '2025-09-12T18:30:00+02:00',
            // requires_approval wird nicht gesendet
        ];

        $response = $this->postJson('/api/v1/events', $eventData);

        $response->assertStatus(201);
        $response->assertJson([
            'data' => [
                'requires_approval' => false, // Sollte auf false gesetzt werden
            ]
        ]);
    }
}
