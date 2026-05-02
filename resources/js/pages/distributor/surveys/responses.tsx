import { Head, Link } from '@inertiajs/react';
import {
    ClipboardList,
    User,
    Calendar,
    MessageSquare,
    BarChart3,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

interface SurveyAnswer {
    question: string;
    answer_text: string;
    answer_value: any;
    product: {
        id: number;
        name: string;
        price: number;
        image_url: string | null;
    } | null;
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

function ProductGraph({
    questionId,
    questionText,
    getProductStats,
    getChartOptions,
}: {
    questionId: number;
    questionText: string;
    getProductStats: (questionId: number) => {
        labels: string[];
        counts: number[];
    };
    getChartOptions: (questionText: string) => any;
}) {
    const stats = getProductStats(questionId);

    if (!stats.labels.length) {
        return (
            <div className="flex items-center justify-center py-8 text-sm text-slate-500">
                No product data available for this question.
            </div>
        );
    }

    const data = {
        labels: stats.labels,
        datasets: [
            {
                label: 'Number of Retailers',
                data: stats.counts,
                backgroundColor: 'rgba(0, 68, 124, 0.7)',
                borderColor: 'rgba(0, 68, 124, 1)',
                borderWidth: 2,
                borderRadius: 6,
            },
        ],
    };

    const options = getChartOptions(questionText);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">
                    Product Response Summary
                </h4>
                <span className="text-xs text-slate-500">
                    {stats.labels.length} product(s) •{' '}
                    {stats.counts.reduce((a, b) => a + b, 0)} response(s)
                </span>
            </div>
            <div className="h-[300px]">
                <Bar data={data} options={options} />
            </div>
            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="px-3 py-2 text-left font-medium text-slate-600">
                                Product
                            </th>
                            <th className="px-3 py-2 text-right font-medium text-slate-600">
                                Retailers
                            </th>
                            <th className="px-3 py-2 text-right font-medium text-slate-600">
                                Percentage
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.labels.map((label, index) => {
                            const count = stats.counts[index];
                            const total = stats.counts.reduce(
                                (a, b) => a + b,
                                0,
                            );
                            const percentage =
                                total > 0
                                    ? ((count / total) * 100).toFixed(1)
                                    : '0';
                            return (
                                <tr
                                    key={label}
                                    className="border-b border-slate-100 last:border-0"
                                >
                                    <td className="px-3 py-2 text-slate-900">
                                        {label}
                                    </td>
                                    <td className="px-3 py-2 text-right text-slate-600">
                                        {count}
                                    </td>
                                    <td className="px-3 py-2 text-right text-slate-600">
                                        {percentage}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function DistributorSurveyResponses({
    survey,
    responses,
}: Props) {
    const [expandedGraphs, setExpandedGraphs] = useState<Set<number>>(
        new Set(),
    );

    const toggleGraph = (questionId: number) => {
        setExpandedGraphs((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const getProductStatsForQuestion = useMemo(() => {
        return (questionId: number) => {
            const productCounts: Record<string, number> = {};

            responses.forEach((response) => {
                response.answers.forEach((answer) => {
                    const question = survey.questions.find(
                        (q) => q.id === questionId,
                    );
                    if (
                        question &&
                        answer.question === question.question_text &&
                        answer.product
                    ) {
                        const productName = answer.product.name;
                        productCounts[productName] =
                            (productCounts[productName] || 0) + 1;
                    }
                });
            });

            const sortedProducts = Object.entries(productCounts).sort(
                (a, b) => b[1] - a[1],
            );

            return {
                labels: sortedProducts.map(([name]) => name),
                counts: sortedProducts.map(([, count]) => count),
            };
        };
    }, [responses, survey.questions]);

    const questionHasProductAnswers = useMemo(() => {
        return (questionId: number) => {
            const question = survey.questions.find((q) => q.id === questionId);
            if (!question) return false;

            return responses.some((response) =>
                response.answers.some(
                    (answer) =>
                        answer.question === question.question_text &&
                        answer.product !== null,
                ),
            );
        };
    }, [responses, survey.questions]);

    const getChartOptions = (questionText: string) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Product Responses: ${questionText}`,
                font: {
                    size: 14,
                    weight: 'bold' as const,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y;
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    callback: function (value: any) {
                        return Number.isInteger(value) ? value : null;
                    },
                },
                title: {
                    display: true,
                    text: 'Number of Retailers',
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Products',
                },
            },
        },
    });

    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-3 py-4 md:py-8">
            <Head title={`${survey.title} - Responses`} />

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#00447C]/5 blur-3xl md:h-96 md:w-96"></div>
                <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl md:h-80 md:w-80"></div>
            </div>

            <div className="relative mx-auto w-full max-w-5xl">
                <header className="relative rounded-t-2xl border border-slate-200/50 bg-white/80 backdrop-blur-xl">
                    <div className="px-4 py-4 md:px-6">
                        <Link
                            href="/distributor/surveys"
                            className="flex items-center gap-2 text-slate-600 transition-colors hover:text-[#00447C]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Back to Surveys
                            </span>
                        </Link>
                        <div className="mt-3">
                            <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                                {survey.title}
                            </h1>
                            {survey.description && (
                                <p className="mt-1 text-xs text-slate-500">
                                    {survey.description}
                                </p>
                            )}
                            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                <span>Created: {survey.created_at}</span>
                                {survey.start_date && (
                                    <span>• Starts: {survey.start_date}</span>
                                )}
                                {survey.expiry_date && (
                                    <span>• Expires: {survey.expiry_date}</span>
                                )}
                                <span>• {responses.length} response(s)</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="rounded-b-2xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-sm md:p-6">
                    {/* Questions with Graph Buttons */}
                    <div className="mb-6">
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                            <BarChart3 className="h-5 w-5 text-[#00447C]" />
                            Questions & Analytics
                        </h3>
                        <div className="space-y-4">
                            {survey.questions
                                .sort((a, b) => a.order - b.order)
                                .map((question, index) => {
                                    const hasProductAnswers =
                                        questionHasProductAnswers(question.id);
                                    const isExpanded = expandedGraphs.has(
                                        question.id,
                                    );

                                    return (
                                        <div
                                            key={question.id}
                                            className="rounded-xl bg-slate-50 p-3"
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#00447C]/10 text-xs font-medium text-[#00447C]">
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        {question.question_text}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        Type:{' '}
                                                        {question.question_type}{' '}
                                                        {question.is_required &&
                                                            '(Required)'}
                                                    </p>
                                                </div>
                                                {hasProductAnswers && (
                                                    <button
                                                        onClick={() =>
                                                            toggleGraph(
                                                                question.id,
                                                            )
                                                        }
                                                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-[#00447C]/50 hover:bg-[#00447C]/5"
                                                    >
                                                        <BarChart3 className="h-3.5 w-3.5" />
                                                        {isExpanded ? (
                                                            <>
                                                                <ChevronUp className="h-3 w-3" />
                                                                Hide Graph
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="h-3 w-3" />
                                                                View Graph
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            {isExpanded && hasProductAnswers && (
                                                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                                                    <ProductGraph
                                                        questionId={
                                                            question.id
                                                        }
                                                        questionText={
                                                            question.question_text
                                                        }
                                                        getProductStats={
                                                            getProductStatsForQuestion
                                                        }
                                                        getChartOptions={
                                                            getChartOptions
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Responses */}
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                            <ClipboardList className="h-5 w-5 text-[#00447C]" />
                            Responses ({responses.length})
                        </h3>

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
                                        <div className="mb-4 flex flex-wrap items-center gap-4 border-b border-slate-100 pb-4">
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
                                                        className="flex flex-col gap-1 md:flex-row"
                                                    >
                                                        <span className="w-full text-sm font-medium text-slate-500 md:w-1/3">
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

                <p className="mt-6 text-center text-sm text-slate-500">
                    Retailer survey responses and analytics
                </p>
            </div>
        </div>
    );
}
