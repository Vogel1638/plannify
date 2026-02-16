<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommentStoreRequest extends FormRequest
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
            'content' => 'required|string|min:1|max:2000',
            'parent_id' => 'nullable|exists:comments,id', // Für Antworten
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'content.required' => 'Der Kommentar darf nicht leer sein.',
            'content.min' => 'Der Kommentar muss mindestens 1 Zeichen lang sein.',
            'content.max' => 'Der Kommentar darf maximal 2000 Zeichen lang sein.',
            'parent_id.exists' => 'Der übergeordnete Kommentar existiert nicht.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Entferne Leerzeichen am Anfang und Ende
        if ($this->has('content')) {
            $this->merge([
                'content' => trim($this->content)
            ]);
        }
    }
}
