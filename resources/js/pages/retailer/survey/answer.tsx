import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Clipboard, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Question {
    id: number;
    question_text: string;
    question_type:
        | 'text'
        | 'textarea'
        | 'product_suggestion'
        | 'product_selection';
    placeholder: string | null;
    is_required: boolean;
    order: number;
    products?: {
        id: number;
        name: string;
        price: number;
        image_url: string;
    }[];
}

interface Survey {
    id: number;
    title: string;
    description: string | null;
    questions: Question[];
}

interface Props {
    survey: Survey;
}

export default function RetailerSurveyAnswer({ survey }: Props) {
    const { toast } = useToast();
    const page = usePage();
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [additionalComments, setAdditionalComments] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleAnswerChange = (questionId: number, value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // Validate required questions
        for (const question of survey.questions) {
            if (question.is_required && !answers[question.id]?.trim()) {
                toast({
                    title: 'Required field missing',
                    description: `Please answer: "${question.question_text}"`,
                    variant: 'destructive',
                });
                setSubmitting(false);
                return;
            }
        }

        try {
            // Get CSRF token from Inertia shared data (always fresh)
            const csrfToken = (page.props.csrf_token as string) || 
                ((document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '');

            const response = await fetch(`/survey/${survey.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    answers: Object.entries(answers).map(
                        ([question_id, answer_text]) => {
                            const question = survey.questions.find(
                                (q) => q.id === parseInt(question_id),
                            );
                            return {
                                question_id: parseInt(question_id),
                                answer_text,
                                ...(question?.question_type ===
                                    'product_selection' && {
                                    product_id: parseInt(answer_text),
                                }),
                            };
                        },
                    ),
                    additional_comments: additionalComments,
                }),
            });

            // Handle non-JSON responses (e.g., HTML error pages from redirects)
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // If we get redirected to login page, the response will be HTML
                if (response.redirected || response.status === 401 || response.status === 403) {
                    toast({
                        title: 'Authentication Error',
                        description: 'Please log in again to submit your feedback.',
                        variant: 'destructive',
                    });
                    // Redirect to home page to refresh the session
                    router.visit('/');
                    return;
                }
                toast({
                    title: 'Error',
                    description: 'Server returned an invalid response. Please try again.',
                    variant: 'destructive',
                });
                return;
            }

            const data = await response.json();

            if (response.ok && data.success) {
                toast({
                    title: 'Success!',
                    description:
                        data.message || 'Your feedback has been submitted.',
                });
                router.visit('/');
            } else {
                toast({
                    title: 'Error',
                    description:
                        data.message ||
                        'Something went wrong. Please try again.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            // More specific error message
            let errorMessage = 'Failed to submit. Please try again.';
            if (error instanceof TypeError && error.message.includes('fetch')) {
                errorMessage = 'Network error. Please check your internet connection.';
            }
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const renderInput = (question: Question) => {
        switch (question.question_type) {
            case 'textarea':
                return (
                    <textarea
                        value={answers[question.id] || ''}
                        onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                        }
                        placeholder={
                            question.placeholder ||
                            `Enter your answer for: ${question.question_text}`
                        }
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3 focus:border-[#00447C] focus:ring-2 focus:ring-[#00447C]"
                        rows={4}
                    />
                );
            case 'product_selection':
                const products = question.products || [];
                return (
                    <div className="space-y-3">
                        {products.length === 0 ? (
                            <p className="text-slate-500 italic">
                                No products available
                            </p>
                        ) : (
                            products.map((product) => (
                                <label
                                    key={product.id}
                                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-all ${
                                        answers[question.id] ===
                                        String(product.id)
                                            ? 'border-[#00447C] bg-[#00447C]/5'
                                            : 'border-slate-200 hover:border-[#00447C]/30'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={product.id}
                                        checked={
                                            answers[question.id] ===
                                            String(product.id)
                                        }
                                        onChange={() =>
                                            handleAnswerChange(
                                                question.id,
                                                String(product.id),
                                            )
                                        }
                                        className="mt-0.5 rounded-full border-slate-300 text-[#00447C] focus:ring-[#00447C]"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-semibold text-slate-900">
                                            {product.name}
                                        </div>
                                        <div className="text-xs font-medium text-[#00447C]">
                                            LKR {product.price.toLocaleString()}
                                        </div>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                );
            case 'product_suggestion':
                return (
                    <input
                        type="text"
                        value={answers[question.id] || ''}
                        onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                        }
                        placeholder={
                            question.placeholder ||
                            'Type product name (e.g., Nestlé Cerelac)'
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 focus:border-[#00447C] focus:ring-2 focus:ring-[#00447C]"
                    />
                );
            default:
                return (
                    <input
                        type="text"
                        value={answers[question.id] || ''}
                        onChange={(e) =>
                            handleAnswerChange(question.id, e.target.value)
                        }
                        placeholder={
                            question.placeholder || 'Enter your answer'
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 focus:border-[#00447C] focus:ring-2 focus:ring-[#00447C]"
                    />
                );
        }
    };

    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-3 py-4 md:py-8">
            <Head title={survey.title} />

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#00447C]/5 blur-3xl md:h-96 md:w-96"></div>
                <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl md:h-80 md:w-80"></div>
            </div>

            <div className="relative mx-auto w-full max-w-3xl">
                {/* Header */}
                <header className="relative rounded-t-2xl border border-slate-200/50 bg-white/80 backdrop-blur-xl">
                    <div className="px-4 py-4 md:px-6">
                        <div className="flex items-center justify-between">
                            <a
                                href="/"
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
                                    Back to Home
                                </span>
                            </a>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00447C]/10">
                                <Clipboard className="h-5 w-5 text-[#00447C]" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                                    {survey.title}
                                </h1>
                                {survey.description && (
                                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                                        {survey.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Form Content */}
                <div className="rounded-b-2xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-sm md:p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {survey.questions
                            .sort((a, b) => a.order - b.order)
                            .map((question) => (
                                <div key={question.id} className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-900">
                                        {question.question_text}
                                        {question.is_required && (
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>
                                        )}
                                    </label>
                                    {renderInput(question)}
                                </div>
                            ))}

                        {/* Additional Comments */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-900">
                                Additional Comments (Optional)
                            </label>
                            <textarea
                                value={additionalComments}
                                onChange={(e) =>
                                    setAdditionalComments(e.target.value)
                                }
                                placeholder="Any other feedback or suggestions..."
                                className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3 focus:border-[#00447C] focus:ring-2 focus:ring-[#00447C]"
                                rows={3}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00447C] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#00447C]/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? (
                                'Submitting...'
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Thank you for helping us improve our products and services.
                </p>
            </div>
        </div>
    );
}
