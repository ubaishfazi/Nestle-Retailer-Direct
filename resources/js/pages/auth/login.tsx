import { Form, Head, usePage, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { ArrowLeft } from 'lucide-react';

type Props = {
    status?: string;
    canRegister: boolean;
};

export default function Login({ status, canRegister }: Props) {
    const { errors, flash } = usePage().props;
    const displayStatus = status || flash?.status;
    const isPendingApproval = displayStatus?.includes('pending admin approval');
    const isAdminApproved = displayStatus?.includes('Admin approved success');
    const loginError = errors?.email;
    const isPendingLoginError = loginError?.includes('pending admin approval');

    // Handle proceeding to login form (clears approval status)
    const handleProceedToLogin = () => {
        router.post('/clear-approval-status');
    };

    // Handle refreshing the pending approval page (checks for status update)
    const handleRefreshPending = () => {
        window.location.reload();
    };

    // Show admin approved success page
    if (isAdminApproved) {
        return (
            <AuthLayout
                title="Account Approved!"
                description="Your account has been approved by admin"
            >
                <Head title="Account Approved" />
                <div className="flex flex-col items-center justify-center gap-6 py-8">
                    <div className="rounded-full bg-green-100 p-4 dark:bg-green-900">
                        <svg
                            className="h-12 w-12 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    <div className="space-y-2 text-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Account Approved Successfully!
                        </h2>
                        <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
                            {displayStatus}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            You can now log in with your credentials.
                        </p>
                    </div>

                    <Button onClick={handleProceedToLogin} className="gap-2">
                        Proceed to Login
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    // Show pending approval page
    if (isPendingApproval || isPendingLoginError) {
        return (
            <AuthLayout
                title="Account Pending Approval"
                description="Your account is waiting for admin approval"
            >
                <Head title="Pending Approval" />
                <div className="flex flex-col items-center justify-center gap-6 py-8">
                    <div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900">
                        <svg
                            className="h-12 w-12 text-yellow-600 dark:text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    <div className="space-y-2 text-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Account Pending Approval
                        </h2>
                        <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
                            {displayStatus || loginError}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Please wait for an administrator to approve your
                            account before logging in.
                        </p>
                    </div>

                    <Button
                        onClick={handleProceedToLogin}
                        className="gap-2"
                        variant="outline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go back to Login
                    </Button>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email and password below to log in"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors: formErrors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={formErrors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={formErrors.password} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {displayStatus && !isPendingApproval && !isAdminApproved && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {displayStatus}
                </div>
            )}
        </AuthLayout>
    );
}
