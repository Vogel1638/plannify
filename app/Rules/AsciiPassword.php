<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class AsciiPassword implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Prüfe Länge (12-64 Zeichen)
        if (strlen($value) < 12 || strlen($value) > 64) {
            $fail('Das Passwort muss zwischen 12 und 64 Zeichen lang sein.');
            return;
        }

        // Prüfe nur ASCII-Zeichen (A-Z, a-z, 0-9)
        if (!preg_match('/^[A-Za-z0-9]+$/', $value)) {
            $fail('Das Passwort darf nur Buchstaben (A-Z, a-z) und Zahlen (0-9) enthalten.');
            return;
        }

        // Prüfe mindestens einen Großbuchstaben
        if (!preg_match('/[A-Z]/', $value)) {
            $fail('Das Passwort muss mindestens einen Großbuchstaben enthalten.');
            return;
        }

        // Prüfe mindestens eine Zahl
        if (!preg_match('/[0-9]/', $value)) {
            $fail('Das Passwort muss mindestens eine Zahl enthalten.');
            return;
        }
    }
}
