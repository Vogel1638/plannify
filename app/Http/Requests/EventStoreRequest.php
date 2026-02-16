<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;

class EventStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:160',
            'description' => 'required|string',
            'visibility' => 'required|in:private,public',
            'location_name' => 'required|string|max:160',
            'location_address' => 'required|string|max:255',
            'location_lat' => 'nullable|numeric|between:-90,90',
            'location_lng' => 'nullable|numeric|between:-180,180',
            'starts_at' => 'required|date_format:Y-m-d\TH:i:sP',
            'ends_at' => 'nullable|date_format:Y-m-d\TH:i:sP|after_or_equal:starts_at',
            'requires_approval' => 'sometimes|boolean',
            'participant_limit' => 'nullable|integer|min:1',
            'allow_comments' => 'sometimes|boolean', // Neue Einstellung für Kommentare
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Der Titel ist erforderlich.',
            'title.max' => 'Der Titel darf maximal 160 Zeichen lang sein.',
            'description.required' => 'Die Beschreibung ist erforderlich.',
            'visibility.required' => 'Die Sichtbarkeit ist erforderlich.',
            'visibility.in' => 'Die Sichtbarkeit muss entweder "private" oder "public" sein.',
            'location_name.required' => 'Der Standortname ist erforderlich.',
            'location_name.max' => 'Der Standortname darf maximal 160 Zeichen lang sein.',
            'location_address.required' => 'Die Standortadresse ist erforderlich.',
            'location_address.max' => 'Die Standortadresse darf maximal 255 Zeichen lang sein.',
            'location_lat.between' => 'Der Breitengrad muss zwischen -90 und 90 liegen.',
            'location_lng.between' => 'Der Längengrad muss zwischen -180 und 180 liegen.',
            'starts_at.required' => 'Der Startzeitpunkt ist erforderlich.',
            'starts_at.date_format' => 'Der Startzeitpunkt muss im Format YYYY-MM-DDTHH:MM:SS±HH:MM angegeben werden.',
            'ends_at.date_format' => 'Der Endzeitpunkt muss im Format YYYY-MM-DDTHH:MM:SS±HH:MM angegeben werden.',
            'ends_at.after_or_equal' => 'Der Endzeitpunkt muss nach oder gleich dem Startzeitpunkt sein.',
            'participant_limit.min' => 'Das Teilnehmerlimit muss mindestens 1 sein.',
            'allow_comments.boolean' => 'Die Kommentarfunktion muss true oder false sein.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Setze Standardwerte
        if (!$this->has('requires_approval')) {
            $this->merge(['requires_approval' => false]);
        }
        
        if (!$this->has('allow_comments')) {
            $this->merge(['allow_comments' => true]);
        }
    }

    /**
     * Handle a passed validation attempt.
     */
    protected function passedValidation(): void
    {
        if ($this->has('starts_at')) {
            $this->merge(['starts_at' => Carbon::parse($this->starts_at)]);
        }

        if ($this->has('ends_at')) {
            $this->merge(['ends_at' => Carbon::parse($this->ends_at)]);
        }
    }
}
