import { Head, useForm, router } from '@inertiajs/react';
import { Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function ReLogin() {
    const form = useForm({
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/user/confirm-password', {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <>
            <Head title="Re-authenticate" />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
                <Card className="w-full max-w-md shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mb-4 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00447C]/10">
                                <Lock className="h-8 w-8 text-[#00447C]" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">
                            Re-authenticate Required
                        </CardTitle>
                        <CardDescription className="text-base">
                            For security reasons, please confirm your password
                            to continue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                            <p className="text-sm text-amber-800">
                                This action requires additional verification.
                                Your session will be restored after
                                confirmation.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={form.data.password}
                                    onChange={(e) =>
                                        form.setData('password', e.target.value)
                                    }
                                    className="h-12"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="h-12 w-full bg-gradient-to-r from-[#00447C] to-[#003d6f] hover:from-[#003d6f] hover:to-[#00284a]"
                                disabled={form.processing}
                            >
                                {form.processing
                                    ? 'Verifying...'
                                    : 'Confirm Password'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.post('/logout')}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Sign out instead
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
