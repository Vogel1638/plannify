<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('users')->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            // public/private visibility + public slug
            $table->enum('visibility', ['private', 'public'])->default('private');
            $table->string('public_slug')->unique()->nullable();

            // Location & Time
            $table->string('location_name')->nullable();
            $table->string('location_address')->nullable();
            $table->decimal('location_lat', 10, 7)->nullable();
            $table->decimal('location_lng', 10, 7)->nullable();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at')->nullable();

            // Participation Options
            $table->boolean('requires_approval')->default(false); 
            $table->unsignedInteger('participant_limit')->nullable(); 

            $table->boolean('is_archived')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('events');
    }
};
