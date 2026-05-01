import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
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
    product_ids?: number[];
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    stock_quantity: number;
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

export default function AdminSurveysEdit({ survey }: Props) {
    const [questions, setQuestions] = useState<Question[]>(survey.questions);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [title, setTitle] = useState(survey.title);
    const [description, setDescription] = useState(survey.description || '');
    const [status, setStatus] = useState(survey.status);
    const [startDate, setStartDate] = useState(survey.start_date || '');
    const [expiryDate, setExpiryDate] = useState(survey.expiry_date || '');
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();
    const pageFlash = (usePage().props as any)?.flash;

    useEffect(() => {
        setQuestions(survey.questions);
        setTitle(survey.title);
        setDescription(survey.description || '');
        setStatus(survey.status);
        setStartDate(survey.start_date || '');
        setExpiryDate(survey.expiry_date || '');
    }, [survey]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const response = await fetch('/api/distributor/inventory');
                if (response.ok) {
                    const data = await response.json();
                    setAllProducts(data.products || []);
                } else {
                    console.warn('Could not fetch products from API');
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now(),
            question_text: '',
            question_type: 'text',
            placeholder: '',
            is_required: true,
            order: questions.length,
            product_ids: [],
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
        value: string | boolean | number[],
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
            const response = await fetch(`/surveys/${survey.id}`, {
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
                        ...(q.question_type === 'product_selection' && {
                            product_ids: q.product_ids || [],
                        }),
                    })),
                }),
            });

            if (response.ok) {
                window.location.href = `/surveys/${survey.id}`;
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
            toast({
                title: 'Success',
                description: flash.success,
            });
        }
    }, [pageFlash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Survey" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <Card className="mx-auto w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle>Edit Demand Sensing Survey</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Update the survey questions and settings.
                        </p>
                    </CardHeader>
                    <CardContent>
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
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
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
                                            <option value="active">
                                                Active
                                            </option>
                                            <option value="closed">
                                                Closed
                                            </option>
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
                                                                    e.target
                                                                        .value,
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
                                                                Product
                                                                Suggestion (Open
                                                                Text)
                                                            </option>
                                                            <option value="product_selection">
                                                                Product
                                                                Selection (Radio
                                                                Buttons)
                                                            </option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="mb-1 block text-sm font-medium text-slate-900">
                                                            Placeholder
                                                            (Optional)
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
                                                                    e.target
                                                                        .value,
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

                                                {question.question_type ===
                                                    'product_selection' && (
                                                    <div className="border-t border-slate-200 pt-4">
                                                        <label className="mb-3 block text-sm font-medium text-slate-900">
                                                            Select Products for
                                                            Radio Button Options
                                                        </label>
                                                        {loadingProducts ? (
                                                            <div className="text-sm text-slate-500">
                                                                Loading
                                                                products...
                                                            </div>
                                                        ) : (
                                                            <div className="grid max-h-60 grid-cols-2 gap-3 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 md:grid-cols-3">
                                                                {allProducts.length ===
                                                                0 ? (
                                                                    <div className="col-span-full text-sm text-slate-500">
                                                                        No
                                                                        products
                                                                        available
                                                                    </div>
                                                                ) : (
                                                                    allProducts.map(
                                                                        (
                                                                            product,
                                                                        ) => (
                                                                            <label
                                                                                key={
                                                                                    product.id
                                                                                }
                                                                                className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-2 transition-colors hover:border-[#00447C]/50 hover:bg-slate-50"
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={
                                                                                        question.product_ids?.includes(
                                                                                            product.id,
                                                                                        ) ||
                                                                                        false
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) => {
                                                                                        const newProductIds =
                                                                                            e
                                                                                                .target
                                                                                                .checked
                                                                                                ? [
                                                                                                      ...(question.product_ids ||
                                                                                                          []),
                                                                                                      product.id,
                                                                                                  ]
                                                                                                : (
                                                                                                      question.product_ids ||
                                                                                                      []
                                                                                                  ).filter(
                                                                                                      (
                                                                                                          id,
                                                                                                      ) =>
                                                                                                          id !==
                                                                                                          product.id,
                                                                                                  );
                                                                                        updateQuestion(
                                                                                            index,
                                                                                            'product_ids',
                                                                                            newProductIds,
                                                                                        );
                                                                                    }}
                                                                                    className="mt-0.5 rounded border-slate-300 text-[#00447C] focus:ring-[#00447C]"
                                                                                />
                                                                                <div className="min-w-0 flex-1">
                                                                                    <div className="truncate text-sm font-medium text-slate-900">
                                                                                        {
                                                                                            product.name
                                                                                        }
                                                                                    </div>
                                                                                    <div className="text-xs text-slate-500">
                                                                                        LKR {product.price.toLocaleString()}
                                                                                    </div>
                                                                                </div>
                                                                            </label>
                                                                        ),
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                        {question.product_ids
                                                            ?.length === 0 && (
                                                            <p className="mt-2 text-sm text-amber-600">
                                                                ⚠️ Please select
                                                                at least one
                                                                product for this
                                                                question
                                                            </p>
                                                        )}
                                                        {question.product_ids &&
                                                            question.product_ids
                                                                .length > 0 && (
                                                                <p className="mt-2 text-sm text-slate-500">
                                                                    {
                                                                        question
                                                                            .product_ids
                                                                            .length
                                                                    }{' '}
                                                                    product
                                                                    {question
                                                                        .product_ids
                                                                        .length >
                                                                    1
                                                                        ? 's'
                                                                        : ''}{' '}
                                                                    selected
                                                                </p>
                                                            )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end gap-4 border-t border-slate-200 pt-4">
                                <Link
                                    href={`/surveys/${survey.id}`}
                                    className="rounded-lg border border-slate-300 px-4 py-2 transition-colors hover:bg-slate-50"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="rounded-lg bg-[#00447C] px-6 py-2 text-white transition-colors hover:bg-[#00447C]/90 disabled:opacity-50"
                                >
                                    {submitting
                                        ? 'Updating...'
                                        : 'Update Survey'}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
