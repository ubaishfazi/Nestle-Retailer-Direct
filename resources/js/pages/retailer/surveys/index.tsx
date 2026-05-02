import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clipboard, FileText, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Survey {
    id: number;
    title: string;
    description: string | null;
    questions_count: number;
    has_responded: boolean;
    created_at: string;
}

interface Props {
    surveys: Survey[];
}

export default function RetailerSurveyIndex({ surveys }: Props) {
    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-3 py-4 md:py-8">
            <Head title="Questionnaires" />

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#00447C]/5 blur-3xl md:h-96 md:w-96"></div>
                <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl md:h-80 md:w-80"></div>
            </div>

            <div className="relative mx-auto w-full max-w-3xl">
                <header className="relative rounded-t-2xl border border-slate-200/50 bg-white/80 backdrop-blur-xl">
                    <div className="px-4 py-4 md:px-6">
                        <div className="flex items-center justify-between">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-slate-600 transition-colors hover:text-[#00447C]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Back to Home
                                </span>
                            </Link>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00447C]/10">
                                <Clipboard className="h-5 w-5 text-[#00447C]" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                                    Questionnaires
                                </h1>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">
                                    {surveys.length} survey{surveys.length !== 1 ? 's' : ''} available
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="rounded-b-2xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-sm md:p-6">
                    {surveys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="mb-3 h-12 w-12 text-slate-300" />
                            <p className="text-sm font-medium text-slate-500">
                                No active surveys at the moment
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Check back later for new surveys
                            </p>
                        </div>
                    ) : (
                    <div className="space-y-3">
                            {surveys.map((survey) => {
                                const CardContent = (
                                    <div className={`group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all ${survey.has_responded ? 'opacity-60 cursor-default' : 'hover:border-[#00447C]/50 hover:bg-[#00447C]/5 hover:shadow-md'}`}>
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors ${!survey.has_responded && 'group-hover:bg-primary/20'}`}>
                                            <FileText className={`h-5 w-5 ${survey.has_responded ? 'text-slate-400' : 'text-[#00447C]'}`} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`text-sm font-semibold ${survey.has_responded ? 'text-slate-500' : 'text-slate-900 group-hover:text-[#00447C]'}`}>
                                                    {survey.title}
                                                </h3>
                                                {survey.has_responded && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                            {survey.description && (
                                                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                                    {survey.description}
                                                </p>
                                            )}
                                            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                                                <span>
                                                    {survey.questions_count} question{survey.questions_count !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                        {!survey.has_responded && (
                                            <div className="shrink-0">
                                                <svg
                                                    className="h-5 w-5 text-slate-300 transition-colors group-hover:text-[#00447C]"
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
                                            </div>
                                        )}
                                    </div>
                                );

                                if (survey.has_responded) {
                                    return <div key={survey.id}>{CardContent}</div>;
                                }

                                return (
                                    <Link
                                        key={survey.id}
                                        href={`/survey/${survey.id}`}
                                    >
                                        {CardContent}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Share your feedback to help us improve our products and services.
                </p>
            </div>
        </div>
    );
}
