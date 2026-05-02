<?php

namespace App\Http\Controllers;

use App\Models\Survey;
use App\Models\SurveyQuestion;
use App\Models\SurveyResponse;
use App\Models\SurveyAnswer;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SurveyController extends Controller
{
    /**
     * Display a listing of active surveys for retailers.
     */
    public function retailerIndex()
    {
        $retailerId = Auth::id();

        $surveys = Survey::where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('start_date')
                    ->orWhere('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>=', now());
            })
            ->withCount('questions')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($survey) use ($retailerId) {
                return [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'description' => $survey->description,
                    'questions_count' => $survey->questions_count,
                    'has_responded' => $survey->hasResponded($retailerId),
                    'created_at' => $survey->created_at->format('Y-m-d'),
                ];
            });

        return inertia('retailer/surveys/index', [
            'surveys' => $surveys,
        ]);
    }

    /**
     * Display a listing of surveys for distributors.
     */
    public function index()
    {
        $user = Auth::user();
        $surveys = Survey::where('distributor_id', $user->id)
            ->withCount('responses')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($survey) {
                return [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'description' => $survey->description,
                    'status' => $survey->status,
                    'start_date' => $survey->start_date?->format('Y-m-d'),
                    'expiry_date' => $survey->expiry_date?->format('Y-m-d'),
                    'is_active' => $survey->isActive(),
                    'responses_count' => $survey->responses_count,
                    'created_at' => $survey->created_at->format('Y-m-d H:i'),
                ];
            });

        return inertia('distributor/surveys/index', [
            'surveys' => $surveys,
        ]);
    }

    /**
     * Show the form for creating a new survey (admin only).
     */
    public function create()
    {
        return inertia('admin/surveys/create');
    }

    /**
     * Store a newly created survey in storage (admin only).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:draft,active,closed',
            'start_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after:start_date',
            'questions' => 'required|array|min:1',
            'questions.*.question_text' => 'required|string',
            'questions.*.question_type' => 'required|in:product_selection',
            'questions.*.placeholder' => 'nullable|string',
            'questions.*.is_required' => 'boolean',
            'questions.*.order' => 'integer',
            'questions.*.product_ids' => 'nullable|array',
            'questions.*.product_ids.*' => 'integer|exists:products,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Auto-assign to the first approved distributor
        $distributor = User::where('role', 'distributor')
            ->where('approval_status', 'approved')
            ->first();

        if (!$distributor) {
            return back()->withErrors(['distributor' => 'No approved distributor found. Please add a distributor first.'])->withInput();
        }

        $survey = Survey::create([
            'distributor_id' => $distributor->id,
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'start_date' => $request->start_date ? \Carbon\Carbon::parse($request->start_date) : null,
            'expiry_date' => $request->expiry_date ? \Carbon\Carbon::parse($request->expiry_date) : null,
        ]);

        foreach ($request->questions as $index => $questionData) {
            $options = null;
            if ($questionData['question_type'] === 'product_selection' && isset($questionData['product_ids'])) {
                $options = ['product_ids' => $questionData['product_ids']];
            }

            $survey->questions()->create([
                'question_text' => $questionData['question_text'],
                'question_type' => $questionData['question_type'],
                'placeholder' => $questionData['placeholder'] ?? null,
                'is_required' => $questionData['is_required'] ?? true,
                'order' => $questionData['order'] ?? $index,
                'options' => $options,
            ]);
        }

        return redirect()->route('admin.surveys.index')
            ->with('success', 'Survey created successfully.');
    }

    /**
     * Display the specified survey for distributor view.
     */
    public function show(Survey $survey)
    {
        $this->authorizeDistributor($survey);

        $survey->load('questions');

                $responses = SurveyResponse::where('survey_id', $survey->id)
            ->with(['retailer:id,name,email', 'answers.question'])
            ->orderBy('submitted_at', 'desc')
            ->get()
            ->map(function ($response) {
                return [
                    'id' => $response->id,
                    'retailer' => [
                        'id' => $response->retailer->id,
                        'name' => $response->retailer->name,
                        'email' => $response->retailer->email,
                    ],
                    'submitted_at' => $response->submitted_at?->format('Y-m-d H:i'),
                    'additional_comments' => $response->additional_comments,
                    'answers' => $response->answers->map(function ($answer) {
                        $answerValue = $answer->answer_value;
                        $productData = null;
                        $displayText = $answer->answer_text;
                        if (is_array($answerValue) && isset($answerValue['product_id'])) {
                            $product = Product::find($answerValue['product_id']);
                            if ($product) {
                                $productData = [
                                    'id' => $product->id,
                                    'name' => $product->name,
                                    'price' => (float) $product->price,
                                    'image_url' => $product->image_url ?? null,
                                ];
                                $displayText = $product->name;
                            }
                        }

                        return [
                            'question' => $answer->question->question_text,
                            'answer_text' => $displayText,
                            'answer_value' => $answerValue,
                            'product' => $productData,
                        ];
                    }),
                ];
            });

        return inertia('distributor/surveys/show', [
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'description' => $survey->description,
                'status' => $survey->status,
                'is_active' => $survey->isActive(),
                'start_date' => $survey->start_date?->format('Y-m-d'),
                'expiry_date' => $survey->expiry_date?->format('Y-m-d'),
                'questions' => $survey->questions->map(function ($q) {
                    return [
                        'id' => $q->id,
                        'question_text' => $q->question_text,
                        'question_type' => $q->question_type,
                        'order' => $q->order,
                        'is_required' => $q->is_required,
                    ];
                })->values()->all(),
                'created_at' => $survey->created_at->format('Y-m-d H:i'),
            ],
            'responses' => $responses,
        ]);
    }

    /**
     * Show the form for editing the specified survey.
     */
    public function edit(Survey $survey)
    {
        $this->authorizeDistributor($survey);
        $survey->load('questions');

        return inertia('distributor/surveys/edit', [
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'description' => $survey->description,
                'status' => $survey->status,
                'start_date' => $survey->start_date?->format('Y-m-d'),
                'expiry_date' => $survey->expiry_date?->format('Y-m-d'),
                'questions' => $survey->questions->map(function ($q) {
                    return [
                        'id' => $q->id,
                        'question_text' => $q->question_text,
                        'question_type' => $q->question_type,
                        'placeholder' => $q->placeholder,
                        'is_required' => $q->is_required,
                        'order' => $q->order,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Update the specified survey in storage.
     */
    public function update(Request $request, Survey $survey)
    {
        $this->authorizeDistributor($survey);

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:draft,active,closed',
            'start_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after:start_date',
            'questions' => 'required|array|min:1',
            'questions.*.id' => 'nullable|integer',
            'questions.*.question_text' => 'required|string',
            'questions.*.question_type' => 'required|in:text,textarea,product_suggestion',
            'questions.*.placeholder' => 'nullable|string',
            'questions.*.is_required' => 'boolean',
            'questions.*.order' => 'integer',
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson() || $request->isJson()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        $survey->update([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'start_date' => $request->start_date ? \Carbon\Carbon::parse($request->start_date) : null,
            'expiry_date' => $request->expiry_date ? \Carbon\Carbon::parse($request->expiry_date) : null,
        ]);

        // Sync questions - delete removed ones and update/add new ones
        $existingQuestionIds = [];
        foreach ($request->questions as $index => $questionData) {
            $options = null;
            if (isset($questionData['question_type']) && $questionData['question_type'] === 'product_selection' && isset($questionData['product_ids'])) {
                $options = ['product_ids' => $questionData['product_ids']];
            }

            $question = isset($questionData['id']) ? SurveyQuestion::find($questionData['id']) : null;
            if ($question && $question->survey_id === $survey->id) {
                $question->update([
                    'question_text' => $questionData['question_text'],
                    'question_type' => $questionData['question_type'],
                    'placeholder' => $questionData['placeholder'] ?? null,
                    'is_required' => $questionData['is_required'] ?? true,
                    'order' => $questionData['order'] ?? $index,
                    'options' => $options,
                ]);
                $existingQuestionIds[] = $question->id;
            } else {
                $newQuestion = $survey->questions()->create([
                    'question_text' => $questionData['question_text'],
                    'question_type' => $questionData['question_type'],
                    'placeholder' => $questionData['placeholder'] ?? null,
                    'is_required' => $questionData['is_required'] ?? true,
                    'order' => $questionData['order'] ?? $index,
                    'options' => $options,
                ]);
                $existingQuestionIds[] = $newQuestion->id;
            }
        }

        // Delete questions not in the update
        $survey->questions()->whereNotIn('id', $existingQuestionIds)->delete();

        if ($request->expectsJson() || $request->isJson()) {
            return response()->json(['success' => true, 'message' => 'Survey updated successfully.']);
        }

        return redirect()->route('distributor.surveys.index')
            ->with('success', 'Survey updated successfully.');
    }

    /**
     * Remove the specified survey from storage.
     */
    public function destroy(Survey $survey)
    {
        $this->authorizeDistributor($survey);
        $survey->delete();

        return redirect()->route('distributor.surveys.index')
            ->with('success', 'Survey deleted successfully.');
    }

    /**
     * Get active surveys for retailer homepage.
     */
    public function active()
    {
        $activeSurveys = Survey::where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('start_date')
                    ->orWhere('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>=', now());
            })
            ->with('questions')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($survey) {
                return [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'description' => $survey->description,
                    'questions' => $survey->questions->map(function ($q) {
                        return [
                            'id' => $q->id,
                            'question_text' => $q->question_text,
                            'question_type' => $q->question_type,
                            'placeholder' => $q->placeholder,
                            'is_required' => $q->is_required,
                            'order' => $q->order,
                        ];
                    })->sortBy('order')->values()->all(),
                ];
            });

        return response()->json([
            'surveys' => $activeSurveys,
        ]);
    }

    /**
     * Get survey stats for distributor home page.
     */
    public function stats()
    {
        $userId = Auth::id();

        $totalSurveys = Survey::where('distributor_id', $userId)->count();
        $activeSurveys = Survey::where('distributor_id', $userId)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('start_date')
                    ->orWhere('start_date', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('expiry_date')
                    ->orWhere('expiry_date', '>=', now());
            })
            ->count();
        $totalResponses = Survey::where('distributor_id', $userId)
            ->withCount('responses')
            ->get()
            ->sum('responses_count');

        $recentSurveys = Survey::where('distributor_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($survey) {
                return [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'status' => $survey->status,
                    'is_active' => $survey->isActive(),
                    'responses_count' => $survey->responses_count,
                ];
            });

        return response()->json([
            'total_surveys' => $totalSurveys,
            'active_surveys' => $activeSurveys,
            'total_responses' => $totalResponses,
            'recent_surveys' => $recentSurveys,
        ]);
    }

    /**
     * Display a listing of all surveys for admin.
     */
    public function adminIndex()
    {
        $surveys = Survey::with('distributor:id,name')
            ->withCount('responses')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($survey) {
                return [
                    'id' => $survey->id,
                    'title' => $survey->title,
                    'description' => $survey->description,
                    'status' => $survey->status,
                    'start_date' => $survey->start_date?->format('Y-m-d'),
                    'expiry_date' => $survey->expiry_date?->format('Y-m-d'),
                    'is_active' => $survey->isActive(),
                    'responses_count' => $survey->responses_count,
                    'created_at' => $survey->created_at->format('Y-m-d H:i'),
                    'distributor' => $survey->distributor ? [
                        'id' => $survey->distributor->id,
                        'name' => $survey->distributor->name,
                    ] : null,
                ];
            });

        return inertia('admin/surveys/index', [
            'surveys' => $surveys,
        ]);
    }

    /**
     * Display the specified survey for admin view.
     */
    public function adminShow(Survey $survey)
    {
        $survey->load(['distributor:id,name', 'questions']);

        $responses = SurveyResponse::where('survey_id', $survey->id)
            ->with(['retailer:id,name,email', 'answers.question'])
            ->orderBy('submitted_at', 'desc')
            ->get()
            ->map(function ($response) {
                return [
                    'id' => $response->id,
                    'retailer' => [
                        'id' => $response->retailer->id,
                        'name' => $response->retailer->name,
                        'email' => $response->retailer->email,
                    ],
                    'submitted_at' => $response->submitted_at?->format('Y-m-d H:i'),
                    'additional_comments' => $response->additional_comments,
                    'answers' => $response->answers->map(function ($answer) {
                        $answerValue = $answer->answer_value;
                        $productData = null;
                        $displayText = $answer->answer_text;
                        if (is_array($answerValue) && isset($answerValue['product_id'])) {
                            $product = Product::find($answerValue['product_id']);
                            if ($product) {
                                $productData = [
                                    'id' => $product->id,
                                    'name' => $product->name,
                                    'price' => (float) $product->price,
                                    'image_url' => $product->image_url ?? null,
                                ];
                                $displayText = $product->name;
                            }
                        }

                        return [
                            'question' => $answer->question->question_text,
                            'answer_text' => $displayText,
                            'answer_value' => $answerValue,
                            'product' => $productData,
                        ];
                    }),
                ];
            });

        return inertia('admin/surveys/show', [
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'description' => $survey->description,
                'status' => $survey->status,
                'is_active' => $survey->isActive(),
                'start_date' => $survey->start_date?->format('Y-m-d'),
                'expiry_date' => $survey->expiry_date?->format('Y-m-d'),
                'distributor' => $survey->distributor ? [
                    'id' => $survey->distributor->id,
                    'name' => $survey->distributor->name,
                ] : null,
                'questions' => $survey->questions->map(function ($q) {
                    $productIds = null;
                    if (is_array($q->options) && isset($q->options['product_ids'])) {
                        $productIds = $q->options['product_ids'];
                    } elseif (is_string($q->options)) {
                        $decoded = json_decode($q->options, true);
                        $productIds = $decoded['product_ids'] ?? null;
                    }

                    return [
                        'id' => $q->id,
                        'question_text' => $q->question_text,
                        'question_type' => $q->question_type,
                        'order' => $q->order,
                        'is_required' => $q->is_required,
                        'placeholder' => $q->placeholder,
                        'product_ids' => $productIds ?? [],
                    ];
                })->values()->all(),
                'created_at' => $survey->created_at->format('Y-m-d H:i'),
            ],
            'responses' => $responses,
        ]);
    }

    /**
     * Show the form for editing the specified survey (admin only).
     */
    public function adminEdit(Survey $survey)
    {
        $survey->load('questions');

        return inertia('admin/surveys/edit', [
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'description' => $survey->description,
                'status' => $survey->status,
                'start_date' => $survey->start_date?->format('Y-m-d'),
                'expiry_date' => $survey->expiry_date?->format('Y-m-d'),
                'questions' => $survey->questions->map(function ($q) {
                    // Extract product_ids from the JSON options field when present
                    $productIds = null;
                    if (is_array($q->options) && isset($q->options['product_ids'])) {
                        $productIds = $q->options['product_ids'];
                    } elseif (is_string($q->options)) {
                        // In case options is stored as JSON string
                        $decoded = json_decode($q->options, true);
                        $productIds = $decoded['product_ids'] ?? null;
                    }

                    return [
                        'id' => $q->id,
                        'question_text' => $q->question_text,
                        'question_type' => $q->question_type,
                        'placeholder' => $q->placeholder,
                        'is_required' => $q->is_required,
                        'order' => $q->order,
                        'product_ids' => $productIds ?? [],
                    ];
                })->values()->all(),
            ],
        ]);
    }

    /**
         * Update the specified survey in storage (admin only).
         */
        public function adminUpdate(Request $request, Survey $survey)
        {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'status' => 'required|in:draft,active,closed',
                'start_date' => 'nullable|date',
                'expiry_date' => 'nullable|date|after:start_date',
                'questions' => 'required|array|min:1',
                // IDs may be temporary on frontend for new questions; accept integers instead of strict exists
                'questions.*.id' => 'nullable|integer',
                'questions.*.question_text' => 'required|string',
                'questions.*.question_type' => 'required|in:product_selection',
                'questions.*.placeholder' => 'nullable|string',
                'questions.*.is_required' => 'boolean',
                'questions.*.order' => 'integer',
                // product_ids, when provided, must be valid product ids
                'questions.*.product_ids' => 'nullable|array',
                'questions.*.product_ids.*' => 'integer|exists:products,id',
            ]);

        if ($validator->fails()) {
            if ($request->expectsJson() || $request->isJson()) {
                return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        $survey->update([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status,
            'start_date' => $request->start_date ? \Carbon\Carbon::parse($request->start_date) : null,
            'expiry_date' => $request->expiry_date ? \Carbon\Carbon::parse($request->expiry_date) : null,
        ]);

        // Sync questions
        $existingQuestionIds = [];
        foreach ($request->questions as $index => $questionData) {
            $options = null;
            if ($questionData['question_type'] === 'product_selection' && isset($questionData['product_ids'])) {
                $options = ['product_ids' => $questionData['product_ids']];
            }

            if (isset($questionData['id'])) {
                $question = SurveyQuestion::find($questionData['id']);
                if ($question && $question->survey_id === $survey->id) {
                    $question->update([
                        'question_text' => $questionData['question_text'],
                        'question_type' => $questionData['question_type'],
                        'placeholder' => $questionData['placeholder'] ?? null,
                        'is_required' => $questionData['is_required'] ?? true,
                        'order' => $questionData['order'] ?? $index,
                        'options' => $options,
                    ]);
                    $existingQuestionIds[] = $question->id;
                }
            } else {
                $newQuestion = $survey->questions()->create([
                    'question_text' => $questionData['question_text'],
                    'question_type' => $questionData['question_type'],
                    'placeholder' => $questionData['placeholder'] ?? null,
                    'is_required' => $questionData['is_required'] ?? true,
                    'order' => $questionData['order'] ?? $index,
                    'options' => $options,
                ]);
                $existingQuestionIds[] = $newQuestion->id;
            }
        }

        $survey->questions()->whereNotIn('id', $existingQuestionIds)->delete();

        // If this was an AJAX/fetch request, return JSON so the frontend sees a 200 OK with JSON
        if ($request->expectsJson() || $request->isJson()) {
            return response()->json(['success' => true, 'message' => 'Survey updated successfully.']);
        }

        return redirect()->route('admin.surveys.index')
            ->with('success', 'Survey updated successfully.');
    }

    /**
     * Remove the specified survey from storage (admin only).
     */
    public function adminDestroy(Survey $survey)
    {
        $survey->delete();

        return redirect()->route('admin.surveys.index')
            ->with('success', 'Survey deleted successfully.');
    }

    /**
     * Show survey form for retailers to answer.
     */
    public function showSurvey(Survey $survey)
    {
        if (! $survey->isActive()) {
            return redirect()->route('home')->with('error', 'This survey is not active.');
        }

        $retailerId = Auth::id();


        $survey->load(['questions' => function ($query) {
            $query->orderBy('order', 'asc');
        }]);

        // For product_selection questions, load available products
        $questions = $survey->questions->map(function ($q) {
            $questionData = [
                'id' => $q->id,
                'question_text' => $q->question_text,
                'question_type' => $q->question_type,
                'placeholder' => $q->placeholder,
                'is_required' => $q->is_required,
            ];

            if ($q->question_type === 'product_selection' && $q->options && isset($q->options['product_ids'])) {
                $productIds = $q->options['product_ids'];
                $questionData['products'] = \App\Models\Product::whereIn('id', $productIds)
                    ->get()
                    ->map(function ($product) {
                        return [
                            'id' => $product->id,
                            'name' => $product->name,
                            'price' => (float) $product->price,
                            'image_url' => $product->image_url,
                        ];
                    })
                    ->values()
                    ->all();
            }

            return $questionData;
        })->values()->all();

        return inertia('retailer/survey/answer', [
            'survey' => [
                'id' => $survey->id,
                'title' => $survey->title,
                'description' => $survey->description,
                'questions' => $questions,
            ],
        ]);
    }

    /**
     * Store retailer's survey response.
     */
    public function submitResponse(Request $request, Survey $survey)
    {
        if (! $survey->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'This survey is not active.',
            ], 422);
        }

        $retailerId = Auth::id();

        $validator = Validator::make($request->all(), [
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:survey_questions,id',
            'answers.*.answer_text' => 'required_with:answers.*.question_id|string',
            'answers.*.product_id' => 'nullable|exists:products,id',
            'additional_comments' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Verify all required questions are answered
        $requiredQuestionIds = $survey->questions()->where('is_required', true)->pluck('id')->toArray();
        $answeredQuestionIds = array_column($request->answers, 'question_id');

        foreach ($requiredQuestionIds as $requiredId) {
            if (! in_array($requiredId, $answeredQuestionIds)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please answer all required questions.',
                ], 422);
            }
        }

        \DB::beginTransaction();

        try {
            $response = SurveyResponse::create([
                'survey_id' => $survey->id,
                'retailer_id' => $retailerId,
                'additional_comments' => $request->additional_comments,
                'submitted_at' => now(),
            ]);

            foreach ($request->answers as $answerData) {
                SurveyAnswer::create([
                    'response_id' => $response->id,
                    'question_id' => $answerData['question_id'],
                    'answer_text' => $answerData['answer_text'],
                    'answer_value' => isset($answerData['product_id']) ? ['product_id' => $answerData['product_id']] : null,
                ]);
            }

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Thank you for your feedback!',
            ]);
        } catch (\Exception $e) {
            \DB::rollBack();
            // Log the exception for diagnosis
            Log::error('Survey submitResponse failed: '.$e->getMessage(), [
                'survey_id' => $survey->id,
                'retailer_id' => $retailerId,
                'exception' => $e,
            ]);

            $message = 'Something went wrong. Please try again.';
            if (env('APP_DEBUG')) {
                $message = $e->getMessage();
            }

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 500);
        }
    }

    /**
     * Check if current user is the distributor of the survey.
     */
    private function authorizeDistributor(Survey $survey): void
    {
        if ($survey->distributor_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
    }
}
