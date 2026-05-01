<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurveyAnswer extends Model
{
    protected $fillable = [
        'response_id',
        'question_id',
        'answer_text',
        'answer_value',
    ];

    protected $casts = [
        'answer_value' => 'array',
    ];

    /**
     * Get the response this answer belongs to.
     */
    public function response(): BelongsTo
    {
        return $this->belongsTo(SurveyResponse::class);
    }

    /**
     * Get the question this answer belongs to.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(SurveyQuestion::class);
    }
}
