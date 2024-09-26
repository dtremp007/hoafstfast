<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventRequest extends FormRequest
{
    public function rules()
    {
        return [
            'name' => ['required'],
            'description' => ['nullable'],
            'startTime' => ['required', 'date'],
            'duration' => ['required', 'integer'],
        ];
    }

    public function authorize()
    {
        return true;
    }
}
