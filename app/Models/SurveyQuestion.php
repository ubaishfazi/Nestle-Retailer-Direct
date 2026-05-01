<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurveyQuestion extends Model
{
    protected $fillable = [
        'survey_id',
        'question_text',
        'question_type',
        'placeholder',
        'is_required',
        'order',
        'options',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'order' => 'integer',
        'options' => 'array',
    ];

    /**
     * Get the survey this question belongs to.
     */
    public function survey(): BelongsTo
    {
        return $this->belongsTo(Survey::class);
    }

    /**
     * Get the answers for this question.
     */
    public function answers()
    {
        return $this->hasMany(SurveyAnswer::class);
    }
}
