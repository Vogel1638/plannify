<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Wird im Controller geprüft
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'first_name' => 'sometimes|nullable|string|max:100',
            'last_name' => 'sometimes|nullable|string|max:100',
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('users')->ignore(auth()->id()),
            ],
            'phone' => 'sometimes|nullable|string|max:20',
            'date_of_birth' => 'sometimes|nullable|date|before:today',
            'bio' => 'sometimes|nullable|string|max:1000',
            'timezone' => 'sometimes|nullable|string|max:50',
            'language' => 'sometimes|nullable|string|in:de,en,fr,it',
            
            'notification_email' => 'sometimes|boolean',
            'notification_push' => 'sometimes|boolean',
            'notification_sms' => 'sometimes|boolean',
            'notification_event_updates' => 'sometimes|boolean',
            'notification_new_participants' => 'sometimes|boolean',
            'notification_comments' => 'sometimes|boolean',
            'notification_bring_items' => 'sometimes|boolean',
            
            'privacy_show_profile' => 'sometimes|boolean',
            'privacy_show_events' => 'sometimes|boolean',
            'privacy_show_participation' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Der Benutzername ist erforderlich.',
            'name.max' => 'Der Benutzername darf maximal 255 Zeichen haben.',
            'first_name.max' => 'Der Vorname darf maximal 100 Zeichen haben.',
            'last_name.max' => 'Der Nachname darf maximal 100 Zeichen haben.',
            'email.required' => 'Die E-Mail-Adresse ist erforderlich.',
            'email.email' => 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
            'email.unique' => 'Diese E-Mail-Adresse wird bereits verwendet.',
            'phone.max' => 'Die Telefonnummer darf maximal 20 Zeichen haben.',
            'date_of_birth.date' => 'Bitte geben Sie ein gültiges Geburtsdatum ein.',
            'date_of_birth.before' => 'Das Geburtsdatum muss in der Vergangenheit liegen.',
            'bio.max' => 'Die Biografie darf maximal 1000 Zeichen haben.',
            'timezone.max' => 'Die Zeitzone darf maximal 50 Zeichen haben.',
            'language.in' => 'Die Sprache muss einer der unterstützten Werte sein.',
            'notification_email.boolean' => 'Die E-Mail-Benachrichtigung muss true oder false sein.',
            'notification_push.boolean' => 'Die Push-Benachrichtigung muss true oder false sein.',
            'notification_sms.boolean' => 'Die SMS-Benachrichtigung muss true oder false sein.',
            'notification_event_updates.boolean' => 'Die Event-Updates-Benachrichtigung muss true oder false sein.',
            'notification_new_participants.boolean' => 'Die Neue-Teilnehmer-Benachrichtigung muss true oder false sein.',
            'notification_comments.boolean' => 'Die Kommentar-Benachrichtigung muss true oder false sein.',
            'notification_bring_items.boolean' => 'Die Mitbringliste-Benachrichtigung muss true oder false sein.',
            'privacy_show_profile.boolean' => 'Das Profil-Sichtbarkeitsflag muss true oder false sein.',
            'privacy_show_events.boolean' => 'Das Event-Sichtbarkeitsflag muss true oder false sein.',
            'privacy_show_participation.boolean' => 'Das Teilnahme-Sichtbarkeitsflag muss true oder false sein.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'first_name' => $this->first_name === '' ? null : $this->first_name,
            'last_name' => $this->last_name === '' ? null : $this->last_name,
            'phone' => $this->phone === '' ? null : $this->phone,
            'date_of_birth' => $this->date_of_birth === '' ? null : $this->date_of_birth,
            'bio' => $this->bio === '' ? null : $this->bio,
            'timezone' => $this->timezone === '' ? 'Europe/Zurich' : $this->timezone,
            'language' => $this->language === '' ? 'de' : $this->language,
        ]);
    }
}
