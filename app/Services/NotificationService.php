<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

class NotificationService
{
    /**
     * Create a notification when a participant joins an event (only for hosts)
     */
    public static function participantJoined(Event $event, User $participant): void
    {
        try {
            if (!\Schema::hasTable('notifications')) {
                \Log::warning('Notifications-Tabelle existiert nicht. Benachrichtigung wird nicht erstellt.');
                return;
            }

            // Notification to the Host
            Notification::create([
                'user_id' => $event->host_id,
                'type' => Notification::TYPE_PARTICIPANT_JOINED,
                'title' => 'Neuer Teilnehmer!',
                'message' => "{$participant->name} hat sich für dein Event '{$event->title}' angemeldet.",
                'data' => [
                    'participant_name' => $participant->name,
                    'participant_id' => $participant->id,
                    'event_title' => $event->title,
                    'status' => $event->requires_approval ? 'pending' : 'going',
                ],
                'related_event_id' => $event->id,
                'related_user_id' => $participant->id,
                'action_url' => "/api/v1/events/{$event->id}",
                'action_text' => 'Event anzeigen',
            ]);
        } catch (\Exception $e) {
            \Log::error('Fehler beim Erstellen der Notification: ' . $e->getMessage());
        }
    }

    /**
     * Create a notification about the host's decision (only for the participant)
     */
    public static function hostDecision(Event $event, User $participant, string $decision): void
    {
        try {
            if (!Schema::hasTable('notifications')) {
                \Log::warning('Notifications-Tabelle existiert nicht. Benachrichtigung wird nicht erstellt.');
                return;
            }

            $statusText = $decision === 'approve' ? 'genehmigt' : 'abgelehnt';
            $title = $decision === 'approve' ? 'Teilnahme genehmigt!' : 'Teilnahme abgelehnt';
            
            // Notification to the participant
            Notification::create([
                'user_id' => $participant->id,
                'type' => Notification::TYPE_HOST_DECISION,
                'title' => $title,
                'message' => "Deine Teilnahme am Event '{$event->title}' wurde {$statusText}.",
                'data' => [
                    'event_title' => $event->title,
                    'host_name' => $event->host->name,
                    'decision' => $decision,
                    'status' => $decision === 'approve' ? 'going' : 'declined',
                ],
                'related_event_id' => $event->id,
                'related_user_id' => $event->host_id,
                'action_url' => "/api/v1/events/{$event->id}",
                'action_text' => 'Event anzeigen',
            ]);
        } catch (\Exception $e) {
            \Log::error('Fehler beim Erstellen der Notification: ' . $e->getMessage());
        }
    }

    /**
     * Create a notification when an event is updated (for all participants)
     */
    public static function eventUpdated(Event $event, array $changes): void
    {
        // Create a list of changes
        $changeDescriptions = [];
        foreach ($changes as $field => $change) {
            switch ($field) {
                case 'title':
                    $changeDescriptions[] = "Titel von '{$change['old']}' zu '{$change['new']}' geändert";
                    break;
                case 'starts_at':
                    $changeDescriptions[] = "Startzeit von {$change['old']} zu {$change['new']} geändert";
                    break;
                case 'ends_at':
                    $changeDescriptions[] = "Endzeit von {$change['old']} zu {$change['new']} geändert";
                    break;
                case 'location_name':
                    $changeDescriptions[] = "Ort von '{$change['old']}' zu '{$change['new']}' geändert";
                    break;
                case 'description':
                    $changeDescriptions[] = "Beschreibung aktualisiert";
                    break;
                default:
                    $changeDescriptions[] = "Feld '{$field}' geändert";
            }
        }

        $changesText = implode(', ', $changeDescriptions);

        // Notification to all confirmed participants
        $participants = $event->participants()
            ->where('status', 'going')
            ->get();

        foreach ($participants as $participant) {
            Notification::create([
                'user_id' => $participant->id,
                'type' => Notification::TYPE_EVENT_UPDATED,
                'title' => 'Event wurde aktualisiert!',
                'message' => "Das Event '{$event->title}' wurde aktualisiert: {$changesText}",
                'data' => [
                    'event_title' => $event->title,
                    'host_name' => $event->host->name,
                    'changes' => $changes,
                    'changes_text' => $changesText,
                ],
                'related_event_id' => $event->id,
                'related_user_id' => $event->host_id,
                'action_url' => "/api/v1/events/{$event->id}",
                'action_text' => 'Event anzeigen',
            ]);
        }
    }

    /**
     * Create a notification when an item is claimed (for the host)
     */
    public static function itemClaimed(Event $event, User $claimer, string $itemName): void
    {
        // Notification to the host
        Notification::create([
            'user_id' => $event->host_id,
            'type' => Notification::TYPE_ITEM_CLAIMED,
            'title' => 'Item beansprucht!',
            'message' => "{$claimer->name} hat das Item '{$itemName}' für dein Event '{$event->title}' beansprucht.",
            'data' => [
                'claimer_name' => $claimer->name,
                'claimer_id' => $claimer->id,
                'item_name' => $itemName,
                'event_title' => $event->title,
            ],
            'related_event_id' => $event->id,
            'related_user_id' => $claimer->id,
            'action_url' => "/api/v1/events/{$event->id}/bring-items",
            'action_text' => 'Mitbringliste anzeigen',
        ]);
    }

    /**
     * Create a notification when an item is unclaimed (for the host)
     */
    public static function itemUnclaimed(Event $event, User $unclaimer, string $itemName): void
    {
        Notification::create([
            'user_id' => $event->host_id,
            'type' => Notification::TYPE_ITEM_UNCLAIMED,
            'title' => 'Item freigegeben!',
            'message' => "{$unclaimer->name} hat das Item '{$itemName}' für dein Event '{$event->title}' freigegeben.",
            'data' => [
                'unclaimer_name' => $unclaimer->name,
                'unclaimer_id' => $unclaimer->id,
                'item_name' => $itemName,
                'event_title' => $event->title,
            ],
            'related_event_id' => $event->id,
            'related_user_id' => $unclaimer->id,
            'action_url' => "/api/v1/events/{$event->id}/bring-items",
            'action_text' => 'Mitbringliste anzeigen',
        ]);
    }

    /**
     * Create a notification when a new item is added (for all participants)
     */
    public static function itemAdded(Event $event, string $itemName): void
    {
        $participants = $event->participants()
            ->where('status', 'going')
            ->get();

        foreach ($participants as $participant) {
            Notification::create([
                'user_id' => $participant->id,
                'type' => Notification::TYPE_ITEM_CLAIMED, // Wiederverwendung des Typs
                'title' => 'Neues Item in der Mitbringliste!',
                'message' => "Ein neues Item '{$itemName}' wurde zur Mitbringliste des Events '{$event->title}' hinzugefügt.",
                'data' => [
                    'item_name' => $itemName,
                    'event_title' => $event->title,
                    'host_name' => $event->host->name,
                ],
                'related_event_id' => $event->id,
                'related_user_id' => $event->host_id,
                'action_url' => "/api/v1/events/{$event->id}/bring-items",
                'action_text' => 'Mitbringliste anzeigen',
            ]);
        }
    }

    /**
     * Notification when a new comment is added.
     */
    public static function commentAdded(Event $event, User $commenter, Comment $comment): void
    {
        if (!Schema::hasTable('notifications')) {
            \Log::warning('Notifications table does not exist. Skipping notification creation.');
            return;
        }

        try {
            // Notification to the host (except for own comments)
            if ($event->host_id !== $commenter->id) {
                Notification::create([
                    'user_id' => $event->host_id,
                    'type' => Notification::TYPE_COMMENT_ADDED,
                    'title' => 'Neuer Kommentar',
                    'message' => "{$commenter->name} hat einen Kommentar zu '{$event->title}' hinzugefügt",
                    'data' => [
                        'event_id' => $event->id,
                        'event_title' => $event->title,
                        'commenter_id' => $commenter->id,
                        'commenter_name' => $commenter->name,
                        'comment_content' => substr($comment->content, 0, 100) . (strlen($comment->content) > 100 ? '...' : ''),
                    ],
                    'related_event_id' => $event->id,
                    'related_user_id' => $commenter->id,
                    'action_url' => "/events/{$event->id}/comments",
                    'action_text' => 'Kommentare anzeigen',
                ]);
            }

            // Notification to all other confirmed participants (except the commenter)
            $participants = $event->participants()
                ->where('status', 'going')
                ->where('user_id', '!=', $commenter->id)
                ->get();

            foreach ($participants as $participant) {
                Notification::create([
                    'user_id' => $participant->id,
                    'type' => Notification::TYPE_COMMENT_ADDED,
                    'title' => 'Neuer Kommentar',
                    'message' => "{$commenter->name} hat einen Kommentar zu '{$event->title}' hinzugefügt",
                    'data' => [
                        'event_id' => $event->id,
                        'event_title' => $event->title,
                        'commenter_id' => $commenter->id,
                        'commenter_name' => $commenter->name,
                        'comment_content' => substr($comment->content, 0, 100) . (strlen($comment->content) > 100 ? '...' : ''),
                    ],
                    'related_event_id' => $event->id,
                    'related_user_id' => $commenter->id,
                    'action_url' => "/events/{$event->id}/comments",
                    'action_text' => 'Kommentare anzeigen',
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to create comment added notification: ' . $e->getMessage());
        }
    }
}
