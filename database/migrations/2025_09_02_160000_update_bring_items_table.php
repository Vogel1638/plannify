<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('bring_items', function (Blueprint $table) {
            // Check if columns exist before dropping them
            if (Schema::hasColumn('bring_items', 'title')) {
                $table->dropColumn(['title', 'unit', 'quantity_total', 'notes', 'is_completed', 'completed_at', 'completed_by']);
            }
            
            // Add new columns only if they don't exist
            if (!Schema::hasColumn('bring_items', 'name')) {
                $table->string('name', 160)->after('event_id');
            }
            if (!Schema::hasColumn('bring_items', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
            if (!Schema::hasColumn('bring_items', 'quantity')) {
                $table->integer('quantity')->default(1)->after('description');
            }
            if (!Schema::hasColumn('bring_items', 'is_optional')) {
                $table->boolean('is_optional')->default(false)->after('quantity');
            }
            if (!Schema::hasColumn('bring_items', 'is_claimed')) {
                $table->boolean('is_claimed')->default(false)->after('is_optional');
            }
            if (!Schema::hasColumn('bring_items', 'claimed_by')) {
                $table->foreignId('claimed_by')->nullable()->after('is_claimed')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('bring_items', 'claimed_at')) {
                $table->timestamp('claimed_at')->nullable()->after('claimed_by');
            }
        });
    }

    public function down(): void {
        Schema::table('bring_items', function (Blueprint $table) {
            // Delete new columns
            $table->dropColumn(['name', 'description', 'quantity', 'is_optional', 'is_claimed', 'claimed_by', 'claimed_at']);
            
            // Add old columns
            $table->string('title')->after('event_id');
            $table->string('unit')->nullable()->after('title');
            $table->decimal('quantity_total', 8, 2)->default(1)->after('unit');
            $table->text('notes')->nullable()->after('quantity_total');
            $table->boolean('is_completed')->default(false)->after('notes');
            $table->timestamp('completed_at')->nullable()->after('is_completed');
            $table->foreignId('completed_by')->nullable()->after('completed_at')->constrained('users')->nullOnDelete();
        });
    }
};
