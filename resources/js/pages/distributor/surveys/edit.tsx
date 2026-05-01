import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Question {
    id: number;
    question_text: string;
    question_type: 'text' | 'textarea' | 'product_suggestion';
    placeholder: string | null;
    is_required: boolean;
    order: number;
}

interface Survey {
    id: number;
    title: string;
    description: string | null;
    status: string;
    start_date: string | null;
    expiry_date: string | null;
    questions: Question[];
}

interface Props {
    survey: Survey;
}

export default function DistributorSurveysEdit({ survey }: Props) {
    const [questions, setQuestions] = useState<Question[]>(survey.questions);
    const [title, setTitle] = useState(survey.title);
    const [description, setDescription] = useState(survey.description || '');
    const [status, setStatus] = useState(survey.status);
    const [startDate, setStartDate] = useState(survey.start_date || '');
    const [expiryDate, setExpiryDate] = useState(survey.expiry_date || '');
    const [submitting, setSubmitting] = useState(false);
    const pageFlash = (usePage().props as any)?.flash;

    useEffect(() => {
        setQuestions(survey.questions);
        setTitle(survey.title);
        setDescription(survey.description || '');
        setStatus(survey.status);
        setStartDate(survey.start_date || '');
        setExpiryDate(survey.expiry_date || '');
    }, [survey]);

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now(),
            question_text: '',
            question_type: 'text',
            placeholder: '',
            is_required: true,
            order: questions.length,
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            const newQuestions = questions.filter((_, i) => i !== index);
            newQuestions.forEach((q, i) => {
                q.order = i;
            });
            setQuestions(newQuestions);
        }
    };

    const updateQuestion = (
        index: number,
        field: keyof Question,
        value: string | boolean,
    ) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question_text.trim()) {
                alert(`Please enter question ${i + 1}`);
                return;
            }
        }

        setSubmitting(true);

        try {
            const response = await fetch(`/distributor/surveys/${survey.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                body: JSON.stringify({
                    title,
                    description,
                    status,
                    start_date: startDate || null,
                    expiry_date: expiryDate || null,
                    questions: questions.map((q, index) => ({
                        id: q.id,
                        question_text: q.question_text,
                        question_type: q.question_type,
                        placeholder: q.placeholder,
                        is_required: q.is_required,
                        order: index,
                    })),
                }),
            });

            if (response.ok) {
                window.location.href = `/distributor/surveys/${survey.id}`;
            } else {
                const error = await response.json();
                console.error('Validation errors:', error);
                alert('Please fix the errors in the form');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to update survey. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Show success message
    useEffect(() => {
        const flash = pageFlash;
        if (flash?.success) {
            alert(`Success: ${flash.success}`);
        }
    }, [pageFlash]);

    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-3 py-4 md:py-8">
            <Head title="Edit Survey" />

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#00447C]/5 blur-3xl md:h-96 md:w-96"></div>
                <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl md:h-80 md:w-80"></div>
            </div>

            <div className="relative mx-auto w-full max-w-4xl">
                {/* Header */}
                <header className="relative rounded-t-2xl border border-slate-200/50 bg-white/80 backdrop-blur-xl">
                    <div className="px-4 py-4 md:px-6">
                        <div className="flex items-center justify-between">
                            <a
                                href={`/distributor/surveys/${survey.id}`}
                                className="flex items-center gap-2 text-slate-600 transition-colors hover:text-[#00447C]"
                            >
                                <svg
                                    className="h-4 w-4 rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                                <span className="text-sm font-medium">
                                    Back to Survey
                                </span>
                            </a>
                        </div>
                        <div className="mt-3">
                            <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                                Edit Survey
                            </h1>
                            <p className="text-xs font-medium text-slate-500">
                                Update your demand sensing survey questions and
                                settings
                            </p>
                        </div>
                    </div>
                </header>

                {/* Form Content */}
                <div className="rounded-b-2xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-sm md:p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Survey Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-900">
                                    Survey Title *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Product Demand Survey"
                                    className="w-full rounded-xl border border-slate-300 bg-white p-3 focus:border-[#00447C] focus:ring-2 focus:ring-[#00447C]"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-900">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Brief description of the survey purpose"
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3 focus:border-[#00447C] focus:ring-2 focus:ring-[#00447C]"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-900">
                                        Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white p-3 focus:border-[#00447C] focus:ring-2 focus:ring-[#00447C]"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="active">Active</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-900">
                                        Start Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) =>
                                            setStartDate(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white p-3 focus:border-[#00447C] focus:ring-2 focus:ring-[#00447C]"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-900">
                                        Expiry Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) =>
                                            setExpiryDate(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-300 bg-white p-3 focus:border-[#00447C] focus:ring-2 focus:ring-[#00447C]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Questions Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-semibold text-slate-900">
                                    Questions
                                </h2>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-200"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Question
                                </button>
                            </div>

                            <div className="space-y-4">
                                {questions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                                    >
                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-1 block text-sm font-medium text-slate-900">
                                                    Question {index + 1} *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={
                                                        question.question_text
                                                    }
                                                    onChange={(e) =>
                                                        updateQuestion(
                                                            index,
                                                            'question_text',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Enter your question"
                                                    className="w-full rounded-lg border border-slate-300 bg-white p-3 focus:border-[#00447C] focus:ring-2 focus:ring-[#00447C]"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-slate-900">
                                                        Input Type
                                                    </label>
                                                    <select
                                                        value={
                                                            question.question_type
                                                        }
                                                        onChange={(e) =>
                                                            updateQuestion(
                                                                index,
                                                                'question_type',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-lg border border-slate-300 bg-white p-3 focus:border-[#00447C] focus:ring-2 focus:ring-[#00447C]"
                                                    >
                                                        <option value="text">
                                                            Short Text
                                                        </option>
                                                        <option value="textarea">
                                                            Long Text
                                                        </option>
                                                        <option value="product_suggestion">
                                                            Product Suggestion
                                                        </option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-1 block text-sm font-medium text-slate-900">
                                                        Placeholder (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={
                                                            question.placeholder ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            updateQuestion(
                                                                index,
                                                                'placeholder',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Placeholder text"
                                                        className="w-full rounded-lg border border-slate-300 bg-white p-3 focus:border-[#00447C] focus:ring-2 focus:ring-[#00447C]"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            question.is_required
                                                        }
                                                        onChange={(e) =>
                                                            updateQuestion(
                                                                index,
                                                                'is_required',
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="rounded border-slate-300 text-[#00447C] focus:ring-[#00447C]"
                                                    />
                                                    <span className="text-sm text-slate-700">
                                                        Required field
                                                    </span>
                                                </label>

                                                {questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeQuestion(
                                                                index,
                                                            )
                                                        }
                                                        className="p-1 text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center justify-end gap-4 border-t border-slate-200 pt-4">
                            <Link
                                href={`/distributor/surveys/${survey.id}`}
                                className="rounded-lg border border-slate-300 px-4 py-2 transition-colors hover:bg-slate-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="rounded-lg bg-[#00447C] px-6 py-2 text-white transition-colors hover:bg-[#00447C]/90 disabled:opacity-50"
                            >
                                {submitting ? 'Updating...' : 'Update Survey'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
