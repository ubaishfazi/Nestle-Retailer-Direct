import { Head, Link } from '@inertiajs/react';
import { ClipboardList, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Survey {
    id: number;
    title: string;
    description: string | null;
    status: string;
    start_date: string | null;
    expiry_date: string | null;
    is_active: boolean;
    responses_count: number;
    created_at: string;
}

interface Props {
    surveys: Survey[];
}

function getStatusBadge(survey: Survey) {
    if (survey.is_active) {
        return (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Active
            </Badge>
        );
    }
    if (survey.status === 'draft') {
        return <Badge variant="secondary">Draft</Badge>;
    }
    return <Badge variant="destructive">Inactive</Badge>;
}

export default function DistributorSurveysIndex({ surveys }: Props) {
    const { toast } = useToast();

    return (
        <div className="flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-3 py-4 md:py-8">
            <Head title="Demand Sensing Surveys" />

            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-[#00447C]/5 blur-3xl md:h-96 md:w-96"></div>
                <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl md:h-80 md:w-80"></div>
            </div>

            <div className="relative mx-auto w-full max-w-6xl">
                {/* Header */}
                <header className="relative rounded-t-2xl border border-slate-200/50 bg-white/80 backdrop-blur-xl">
                    <div className="px-4 py-4 md:px-6">
                        <div className="flex items-center justify-between">
                            <a
                                href="/distributor/home"
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
                        <div className="mt-3 flex items-center justify-between">
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-slate-900 md:text-xl">
                                    Demand Sensing Surveys
                                </h1>
                                <p className="text-xs font-medium text-slate-500">
                                    View retailer feedback questionnaires and
                                    responses
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="rounded-b-2xl border border-slate-200/50 bg-white/60 p-4 backdrop-blur-sm md:p-6">
                    {surveys.length === 0 ? (
                        <div className="py-12 text-center">
                            <ClipboardList className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                            <h3 className="mb-2 text-lg font-medium text-slate-900">
                                No surveys yet
                            </h3>
                            <p className="mb-6 text-sm text-slate-500">
                                Active surveys will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="px-2 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                            Title
                                        </th>
                                        <th className="px-2 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                            Status
                                        </th>
                                        <th className="hidden px-2 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase md:table-cell">
                                            Start Date
                                        </th>
                                        <th className="hidden px-2 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase lg:table-cell">
                                            Expiry Date
                                        </th>
                                        <th className="px-2 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                            Responses
                                        </th>
                                        <th className="px-2 py-3 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {surveys.map((survey) => (
                                        <tr
                                            key={survey.id}
                                            className="transition-colors hover:bg-slate-50/50"
                                        >
                                            <td className="px-2 py-4">
                                                <div>
                                                    <div className="font-medium text-slate-900">
                                                        {survey.title}
                                                    </div>
                                                    {survey.description && (
                                                        <div className="max-w-xs truncate text-sm text-slate-500">
                                                            {survey.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 py-4">
                                                {getStatusBadge(survey)}
                                            </td>
                                            <td className="hidden px-2 py-4 text-sm text-slate-600 md:table-cell">
                                                {survey.start_date || '-'}
                                            </td>
                                            <td className="hidden px-2 py-4 text-sm text-slate-600 lg:table-cell">
                                                {survey.expiry_date || '-'}
                                            </td>
                                            <td className="px-2 py-4">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                    {survey.responses_count}{' '}
                                                    response(s)
                                                </span>
                                            </td>
                                            <td className="px-2 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/distributor/surveys/${survey.id}`}
                                                        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#00447C]"
                                                        title="View Responses"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
