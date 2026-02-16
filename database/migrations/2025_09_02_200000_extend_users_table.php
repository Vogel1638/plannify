<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            // Personal Information
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('phone')->nullable()->after('email');
            $table->date('date_of_birth')->nullable()->after('phone');
            $table->text('bio')->nullable()->after('date_of_birth');
            $table->string('avatar_path')->nullable()->after('bio');
            $table->string('timezone')->default('Europe/Zurich')->after('avatar_path');
            $table->string('language')->default('de')->after('timezone');

            // Notification Settings
            $table->boolean('notification_email')->default(true)->after('language');
            $table->boolean('notification_push')->default(true)->after('notification_email');
            $table->boolean('notification_sms')->default(false)->after('notification_push');
            $table->boolean('notification_event_updates')->default(true)->after('notification_sms');
            $table->boolean('notification_new_participants')->default(true)->after('notification_event_updates');
            $table->boolean('notification_comments')->default(true)->after('notification_new_participants');
            $table->boolean('notification_bring_items')->default(true)->after('notification_comments');

            // Privacy Settings
            $table->boolean('privacy_show_profile')->default(true)->after('notification_bring_items');
            $table->boolean('privacy_show_events')->default(true)->after('privacy_show_profile');
            $table->boolean('privacy_show_participation')->default(true)->after('privacy_show_events');
        });
    }

    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name', 'last_name', 'phone', 'date_of_birth', 'bio', 'avatar_path',
                'timezone', 'language', 'notification_email', 'notification_push', 'notification_sms',
                'notification_event_updates', 'notification_new_participants', 'notification_comments',
                'notification_bring_items', 'privacy_show_profile', 'privacy_show_events', 'privacy_show_participation'
            ]);
        });
    }
};
