<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // delete if exists
        Schema::dropIfExists('bring_items');
        
        Schema::create('bring_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            
            $table->string('name', 160);             
            $table->text('description')->nullable(); 
            $table->integer('quantity')->default(1); 
            $table->boolean('is_optional')->default(false);
            
            $table->boolean('is_claimed')->default(false);
            $table->foreignId('claimed_by')->nullable()->constrained('users')->nullOnDelete(); 
            $table->timestamp('claimed_at')->nullable(); 

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('bring_items');
    }
};
