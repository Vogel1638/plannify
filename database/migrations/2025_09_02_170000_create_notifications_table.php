<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // Receiver
            
            $table->string('type');
            $table->string('title'); 
            $table->text('message'); 
            $table->json('data')->nullable(); 
            
            $table->boolean('is_read')->default(false); 
            $table->timestamp('read_at')->nullable(); 
            
            $table->foreignId('related_event_id')->nullable()->constrained('events')->cascadeOnDelete(); 
            $table->foreignId('related_user_id')->nullable()->constrained('users')->cascadeOnDelete(); 
            
            $table->string('action_url')->nullable(); 
            $table->string('action_text')->nullable(); 
            
            $table->timestamps();
            
            $table->index(['user_id', 'is_read']);
            $table->index(['user_id', 'created_at']);
            $table->index('type');
        });
    }

    public function down(): void {
        Schema::dropIfExists('notifications');
    }
};
