<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('bring_item_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bring_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 8, 2)->default(1); // übernommene Menge
            $table->enum('status', ['claimed','completed'])->default('claimed');
            $table->timestamp('claimed_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->unique(['bring_item_id','user_id'], 'claim_unique_by_user'); 
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('bring_item_claims');
    }
};
