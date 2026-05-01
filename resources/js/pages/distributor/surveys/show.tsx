import { Head, Link } from '@inertiajs/react';
import { ClipboardList, User, Calendar, MessageSquare } from 'lucide-react';

interface SurveyAnswer {
    question: string;
    answer_text: string;
}

interface SurveyResponse {
    id: number;
    retailer: {
        id: number;
        name: string;
        email: string;
    };
    submitted_at: string | null;
    additional_comments: string | null;
    answers: SurveyAnswer[];
}

interface Survey {
    id: number;
    title: string;
    description: string | null;
    status: string;
    is_active: boolean;
    start_date: string | null;
    expiry_date: string | null;
    questions: Array<{
        id: number;
        question_text: string;
        question_type: string;
        order: number;
        is_required: boolean;
    }>;
    created_at: string;
}

interface Props {
    survey: Survey;
    responses: SurveyResponse[];
}

export default function DistributorSurveysShow({ survey, responses }: Props) {
    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-3 py-4 md:py-8">
            <Head title={survey.title} />

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#00447C]/5 blur-3xl md:h-96 md:w-96"></div>
                <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl md:h-80 md:w-80"></div>
            </div>

            <div className="relative mx-auto w-full max-w-5xl">
                {/* Header */}
                <header className="relative rounded-t-2xl border border-slate-200/50 bg-white/80 backdrop-blur-xl">
                    <div className="px-4 py-4 md:px-6">
                        <div className="flex items-center justify-between">
                            <a
                                href="/distributor/surveys"
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
                                    Back to Surveys
                                </span>
                            </a>
                        </div>
                        <div className="mt-3 flex items-start justify-between">
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                                    {survey.title}
                                </h1>
                                {survey.description && (
                                    <p className="mt-1 text-xs font-medium text-slate-500">
                                        {survey.description}
                                    </p>
                                )}
                                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                                    <span>Created: {survey.created_at}</span>
                                    {survey.start_date && (
                                        <span>
                                            • Starts: {survey.start_date}
                                        </span>
                                    )}
                                    {survey.expiry_date && (
                                        <span>
                                            • Expires: {survey.expiry_date}
                                        </span>
                                    )}
                                    <span>
                                        • {responses.length} response(s)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="space-y-6 rounded-b-2xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-sm md:p-6">
                    {/* Questions */}
                    <div>
                        <h2 className="mb-4 text-base font-semibold text-slate-900">
                            Questions
                        </h2>
                        <div className="space-y-3">
                            {survey.questions
                                .sort((a, b) => a.order - b.order)
                                .map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
                                    >
                                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#00447C]/10 text-xs font-medium text-[#00447C]">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm text-slate-900">
                                                {question.question_text}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Type: {question.question_type}{' '}
                                                {question.is_required &&
                                                    '(Required)'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Responses */}
                    <div>
                        <h2 className="mb-4 text-base font-semibold text-slate-900">
                            Responses ({responses.length})
                        </h2>

                        {responses.length === 0 ? (
                            <div className="rounded-xl bg-slate-50 py-12 text-center">
                                <ClipboardList className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                <p className="text-sm text-slate-500">
                                    No responses yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {responses.map((response) => (
                                    <div
                                        key={response.id}
                                        className="rounded-xl border border-slate-200 bg-white p-4"
                                    >
                                        <div className="mb-4 flex items-center gap-4 border-b border-slate-100 pb-4">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-slate-500" />
                                                <span className="font-medium text-slate-900">
                                                    {response.retailer.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Calendar className="h-4 w-4" />
                                                {response.submitted_at}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {response.answers.map(
                                                (answer, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex gap-3"
                                                    >
                                                        <span className="w-1/3 text-sm text-slate-500">
                                                            {answer.question}
                                                        </span>
                                                        <span className="flex-1 text-sm text-slate-900">
                                                            {answer.answer_text}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                            {response.additional_comments && (
                                                <div className="mt-4 border-t border-slate-100 pt-4">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <MessageSquare className="h-4 w-4 text-slate-500" />
                                                        <span className="text-sm font-medium text-slate-900">
                                                            Additional Comments
                                                        </span>
                                                    </div>
                                                    <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                                                        {
                                                            response.additional_comments
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
