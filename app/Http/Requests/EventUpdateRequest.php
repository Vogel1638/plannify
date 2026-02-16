<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EventUpdateRequest extends FormRequest
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
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string|max:1000',
            'visibility' => ['sometimes', 'required', Rule::in(['public', 'private'])],
            'location_name' => 'sometimes|required|string|max:255',
            'location_address' => 'sometimes|required|string|max:500',
            'location_lat' => 'sometimes|nullable|numeric|between:-90,90',
            'location_lng' => 'sometimes|nullable|numeric|between:-180,180',
            'starts_at' => 'sometimes|required|date_format:Y-m-d H:i:s',
            'ends_at' => 'sometimes|required|date_format:Y-m-d H:i:s|after:starts_at',
            'requires_approval' => 'sometimes|boolean',
            'participant_limit' => 'sometimes|nullable|integer|min:1|max:1000',
            'allow_comments' => 'sometimes|boolean', // Neue Einstellung für Kommentare
            'is_archived' => 'sometimes|boolean',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Der Titel ist erforderlich.',
            'title.max' => 'Der Titel darf maximal 255 Zeichen haben.',
            'description.required' => 'Die Beschreibung ist erforderlich.',
            'description.max' => 'Die Beschreibung darf maximal 1000 Zeichen haben.',
            'visibility.required' => 'Die Sichtbarkeit ist erforderlich.',
            'visibility.in' => 'Die Sichtbarkeit muss entweder "public" oder "private" sein.',
            'location_name.required' => 'Der Ortsname ist erforderlich.',
            'location_name.max' => 'Der Ortsname darf maximal 255 Zeichen haben.',
            'location_address.required' => 'Die Adresse ist erforderlich.',
            'location_address.max' => 'Die Adresse darf maximal 500 Zeichen haben.',
            'location_lat.numeric' => 'Der Breitengrad muss eine Zahl sein.',
            'location_lat.between' => 'Der Breitengrad muss zwischen -90 und 90 liegen.',
            'location_lng.numeric' => 'Der Längengrad muss eine Zahl sein.',
            'location_lng.between' => 'Der Längengrad muss zwischen -180 und 180 liegen.',
            'starts_at.required' => 'Der Startzeitpunkt ist erforderlich.',
            'starts_at.date_format' => 'Das Startdatum muss im Format Y-m-d H:i:s sein.',
            'ends_at.required' => 'Der Endzeitpunkt ist erforderlich.',
            'ends_at.date_format' => 'Das Enddatum muss im Format Y-m-d H:i:s sein.',
            'ends_at.after' => 'Das Enddatum muss nach dem Startdatum liegen.',
            'requires_approval.boolean' => 'Die Genehmigungspflicht muss true oder false sein.',
            'participant_limit.integer' => 'Das Teilnehmerlimit muss eine ganze Zahl sein.',
            'participant_limit.min' => 'Das Teilnehmerlimit muss mindestens 1 sein.',
            'participant_limit.max' => 'Das Teilnehmerlimit darf maximal 1000 sein.',
            'allow_comments.boolean' => 'Die Kommentarfunktion muss true oder false sein.',
            'is_archived.boolean' => 'Das Archivierungsflag muss true oder false sein.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'location_lat' => $this->location_lat === '' ? null : $this->location_lat,
            'location_lng' => $this->location_lng === '' ? null : $this->location_lng,
            'participant_limit' => $this->participant_limit === '' ? null : $this->participant_limit,
        ]);
    }

    /**
     * Handle a passed validation attempt.
     */
    protected function passedValidation(): void
    {
        if ($this->visibility === 'private') {
            $this->merge([
                'requires_approval' => true,
                'participant_limit' => null,
            ]);
        }

        // Generate a new public_slug if the title has changed
        if ($this->has('title') && $this->visibility === 'public') {
            $baseSlug = \Illuminate\Support\Str::slug($this->title);
            $slug = $baseSlug;
            
            $counter = 1;
            while (\App\Models\Event::where('public_slug', $slug)
                ->where('id', '!=', $this->route('event'))
                ->exists()) {
                $slug = $baseSlug . '-' . \Illuminate\Support\Str::lower(\Illuminate\Support\Str::random(6));
                $counter++;
                
                if ($counter > 100) {
                    $slug = $baseSlug . '-' . \Illuminate\Support\Str::ulid();
                    break;
                }
            }
            
            $this->merge(['public_slug' => $slug]);
        }
    }
}
