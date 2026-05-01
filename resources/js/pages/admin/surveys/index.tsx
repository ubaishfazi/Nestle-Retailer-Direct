import { Head, router, Link } from '@inertiajs/react';
import { Plus, ClipboardList, Eye, Pencil, Trash2, Store } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'Surveys',
        href: '/surveys',
    },
];

function getStatusBadge(status: string) {
    switch (status) {
        case 'active':
            return (
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    Active
                </Badge>
            );
        case 'draft':
            return <Badge variant="secondary">Draft</Badge>;
        case 'closed':
            return <Badge variant="destructive">Closed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

export default function AdminSurveysIndex({ surveys = [] }: Props) {
    const { toast } = useToast();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

    const handleDeleteClick = (survey: Survey) => {
        setSelectedSurvey(survey);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedSurvey) return;

        router.delete(`/surveys/${selectedSurvey.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: 'Survey deleted',
                    description: 'The survey has been successfully deleted.',
                });
                setDeleteDialogOpen(false);
                setSelectedSurvey(null);
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to delete the survey.',
                    variant: 'destructive',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Survey Management" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Demand Sensing Surveys
                        </h1>
                        <p className="text-muted-foreground">
                            Manage surveys
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/surveys/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Survey
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Surveys
                            </CardTitle>
                            <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {surveys.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active
                            </CardTitle>
                            <Badge className="bg-emerald-100 text-emerald-800">
                                Active
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">
                                {
                                    surveys.filter(
                                        (s) =>
                                            s.status === 'active' &&
                                            s.is_active,
                                    ).length
                                }
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Responses
                            </CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {surveys.reduce(
                                    (sum, s) => sum + (s.responses_count || 0),
                                    0,
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Surveys Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Surveys</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {surveys.length === 0 ? (
                            <div className="py-12 text-center">
                                <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">
                                    No surveys yet
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Create your first demand sensing survey to
                                    get started.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/surveys/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Survey
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-4 py-3 text-left font-medium">
                                                Title
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Status
                                            </th>
                                            <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                                                Start Date
                                            </th>
                                            <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">
                                                Expiry Date
                                            </th>
                                            <th className="px-4 py-3 text-left font-medium">
                                                Responses
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {surveys.map((survey) => (
                                            <tr
                                                key={survey.id}
                                                className="border-b hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">
                                                        {survey.title}
                                                    </div>
                                                    {survey.description && (
                                                        <div className="max-w-xs truncate text-xs text-muted-foreground">
                                                            {survey.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(
                                                        survey.status,
                                                    )}
                                                </td>
                                                <td className="hidden px-4 py-3 text-sm md:table-cell">
                                                    {survey.start_date || '-'}
                                                </td>
                                                <td className="hidden px-4 py-3 text-sm lg:table-cell">
                                                    {survey.expiry_date || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                        {survey.responses_count}{' '}
                                                        response(s)
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                            title="View Details"
                                                        >
                                                            <Link
                                                                href={`/surveys/${survey.id}`}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            asChild
                                                            title="Edit"
                                                        >
                                                            <Link
                                                                href={`/surveys/${survey.id}/edit`}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    survey,
                                                                )
                                                            }
                                                            title="Delete"
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Survey</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the survey "
                            {selectedSurvey?.title}"? This action cannot be
                            undone and all associated responses will be
                            permanently removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
