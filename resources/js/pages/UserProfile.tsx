import { Head, useForm, usePage } from '@inertiajs/react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Save,
    ArrowLeft,
    Camera,
    Lock,
    Eye,
    EyeOff,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string | null;
        address?: string | null;
        city?: string | null;
        shopName?: string | null;
        companyName?: string | null;
        created_at: string;
    };
}

export default function UserProfile({ user }: Props) {
    const { toast } = useToast();
    const page = usePage();
    const authUser = (page.props.auth as any)?.user;
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const passwordSectionRef = useRef<HTMLDivElement>(null);

    // Scroll to password section when it becomes visible
    useEffect(() => {
        if (showPasswordForm && passwordSectionRef.current) {
            passwordSectionRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [showPasswordForm]);

    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        profileForm.put('/user/profile-information', {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: 'Profile updated',
                    description:
                        'Your profile information has been saved successfully.',
                });
            },
            onError: (errors) => {
                toast({
                    title: 'Update failed',
                    description:
                        Object.values(errors)[0] ||
                        'There was an error updating your profile.',
                    variant: 'destructive',
                });
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        passwordForm.put('/user/password', {
            onSuccess: () => {
                toast({
                    title: 'Password updated',
                    description: 'Your password has been changed successfully.',
                });
                passwordForm.reset();
                setShowPasswordForm(false);
            },
            onError: (errors) => {
                toast({
                    title: 'Update failed',
                    description:
                        Object.values(errors)[0] ||
                        'There was an error changing your password.',
                    variant: 'destructive',
                });
            },
        });
    };

    return (
        <>
            <Head title="My Profile" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#00447C] via-[#003d6f] to-[#00284a] text-white">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="rounded-full p-2 transition-colors hover:bg-white/10"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">
                                    My Profile
                                </h1>
                                <p className="text-sm text-white/70">
                                    Manage your account information
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="container mx-auto max-w-4xl px-4 py-8">
                    {/* Profile Card */}
                    <Card className="mb-6 border-white/50 bg-white/90 backdrop-blur-sm dark:bg-white/10">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center gap-6 sm:flex-row">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#00447C] to-[#003d6f] text-3xl font-bold text-white shadow-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute right-0 bottom-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-500 transition-colors hover:bg-blue-600">
                                        <Camera className="h-4 w-4 text-white" />
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="flex-1 text-center sm:text-left">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {user.name}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {user.email}
                                    </p>
                                    <div className="mt-3 flex flex-wrap justify-center gap-3 sm:justify-start">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                Member since{' '}
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit Profile Form */}
                    <Card className="border-white/50 bg-white/90 backdrop-blur-sm dark:bg-white/10">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">
                                    Profile Information
                                </CardTitle>
                                <CardDescription>
                                    Update your personal details and contact
                                    information
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setShowPasswordForm(!showPasswordForm)
                                }
                                className="border-gray-300"
                            >
                                <Lock className="mr-2 h-4 w-4" />
                                {showPasswordForm
                                    ? 'Cancel'
                                    : 'Change Password'}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleProfileSubmit}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="name"
                                            className="flex items-center gap-2"
                                        >
                                            <User className="h-4 w-4" />
                                            Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={profileForm.data.name}
                                            onChange={(e) =>
                                                profileForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-white/50 dark:bg-white/5"
                                        />
                                        {profileForm.errors.name && (
                                            <p className="text-sm text-red-500">
                                                {profileForm.errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Shop Name / Company Name */}
                                    {user.shopName && (
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="shopName"
                                                className="flex items-center gap-2"
                                            >
                                                <User className="h-4 w-4" />
                                                Shop Name
                                            </Label>
                                            <Input
                                                id="shopName"
                                                value={user.shopName}
                                                disabled
                                                className="cursor-not-allowed bg-slate-100 dark:bg-slate-800"
                                            />
                                            <p className="text-xs text-slate-500">
                                                Shop name cannot be changed
                                            </p>
                                        </div>
                                    )}

                                    {user.companyName && (
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="companyName"
                                                className="flex items-center gap-2"
                                            >
                                                <User className="h-4 w-4" />
                                                Company Name
                                            </Label>
                                            <Input
                                                id="companyName"
                                                value={user.companyName}
                                                disabled
                                                className="cursor-not-allowed bg-slate-100 dark:bg-slate-800"
                                            />
                                            <p className="text-xs text-slate-500">
                                                Company name cannot be changed
                                            </p>
                                        </div>
                                    )}

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="email"
                                            className="flex items-center gap-2"
                                        >
                                            <Mail className="h-4 w-4" />
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profileForm.data.email}
                                            disabled
                                            className="cursor-not-allowed bg-slate-100 dark:bg-slate-800"
                                        />
                                        <p className="text-xs text-slate-500">
                                            Email cannot be changed
                                        </p>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="phone"
                                            className="flex items-center gap-2"
                                        >
                                            <Phone className="h-4 w-4" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            value={profileForm.data.phone || ''}
                                            onChange={(e) =>
                                                profileForm.setData(
                                                    'phone',
                                                    e.target.value,
                                                )
                                            }
                                            className="bg-white/50 dark:bg-white/5"
                                        />
                                        {profileForm.errors.phone && (
                                            <p className="text-sm text-red-500">
                                                {profileForm.errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="address"
                                            className="flex items-center gap-2"
                                        >
                                            <MapPin className="h-4 w-4" />
                                            Address
                                        </Label>
                                        <Input
                                            id="address"
                                            value={
                                                profileForm.data.address || ''
                                            }
                                            disabled
                                            className="cursor-not-allowed bg-slate-100 dark:bg-slate-800"
                                        />
                                        <p className="text-xs text-slate-500">
                                            Address cannot be changed
                                        </p>
                                    </div>

                                    {/* City */}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="city"
                                            className="flex items-center gap-2"
                                        >
                                            <MapPin className="h-4 w-4" />
                                            City
                                        </Label>
                                        <Input
                                            id="city"
                                            value={profileForm.data.city || ''}
                                            disabled
                                            className="cursor-not-allowed bg-slate-100 dark:bg-slate-800"
                                        />
                                        <p className="text-xs text-slate-500">
                                            City cannot be changed
                                        </p>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end border-t pt-4">
                                    <Button
                                        type="submit"
                                        disabled={profileForm.processing}
                                        className="bg-gradient-to-r from-[#00447C] to-[#003d6f] hover:from-[#003d6f] hover:to-[#00284a]"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {profileForm.processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>

                            {/* Change Password Form */}
                            {showPasswordForm && (
                                <div ref={passwordSectionRef}>
                                    <div className="my-6 border-t"></div>
                                    <div className="mb-4 space-y-2">
                                        <h3 className="flex items-center gap-2 text-base font-semibold">
                                            <Lock className="h-4 w-4" />
                                            Change Password
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Update your password to keep your
                                            account secure
                                        </p>
                                    </div>
                                    <form
                                        onSubmit={handlePasswordSubmit}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {/* Current Password */}
                                            <div className="space-y-2">
                                                <Label htmlFor="current_password">
                                                    Current Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="current_password"
                                                        type={
                                                            showCurrentPassword
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        value={
                                                            passwordForm.data
                                                                .current_password
                                                        }
                                                        onChange={(e) =>
                                                            passwordForm.setData(
                                                                'current_password',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Enter current password"
                                                        className="bg-white/50 pr-10 dark:bg-white/5"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                                                        onClick={() =>
                                                            setShowCurrentPassword(
                                                                !showCurrentPassword,
                                                            )
                                                        }
                                                    >
                                                        {showCurrentPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {passwordForm.errors
                                                    .current_password && (
                                                    <p className="text-sm text-red-500">
                                                        {
                                                            passwordForm.errors
                                                                .current_password
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {/* New Password */}
                                            <div className="space-y-2">
                                                <Label htmlFor="password">
                                                    New Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={
                                                            showNewPassword
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        value={
                                                            passwordForm.data
                                                                .password
                                                        }
                                                        onChange={(e) =>
                                                            passwordForm.setData(
                                                                'password',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Enter new password"
                                                        className="bg-white/50 pr-10 dark:bg-white/5"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                                                        onClick={() =>
                                                            setShowNewPassword(
                                                                !showNewPassword,
                                                            )
                                                        }
                                                    >
                                                        {showNewPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {passwordForm.errors
                                                    .password && (
                                                    <p className="text-sm text-red-500">
                                                        {
                                                            passwordForm.errors
                                                                .password
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="password_confirmation">
                                                    Confirm New Password
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password_confirmation"
                                                        type={
                                                            showConfirmPassword
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        value={
                                                            passwordForm.data
                                                                .password_confirmation
                                                        }
                                                        onChange={(e) =>
                                                            passwordForm.setData(
                                                                'password_confirmation',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Confirm new password"
                                                        className="bg-white/50 pr-10 dark:bg-white/5"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                                                        onClick={() =>
                                                            setShowConfirmPassword(
                                                                !showConfirmPassword,
                                                            )
                                                        }
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {passwordForm.errors
                                                    .password_confirmation && (
                                                    <p className="text-sm text-red-500">
                                                        {
                                                            passwordForm.errors
                                                                .password_confirmation
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Password Submit Button */}
                                        <div className="flex justify-end gap-3 border-t pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    passwordForm.reset();
                                                    setShowPasswordForm(false);
                                                }}
                                                disabled={
                                                    passwordForm.processing
                                                }
                                                className="border-gray-300"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    passwordForm.processing
                                                }
                                                className="bg-gradient-to-r from-[#00447C] to-[#003d6f] hover:from-[#003d6f] hover:to-[#00284a]"
                                            >
                                                <Lock className="mr-2 h-4 w-4" />
                                                {passwordForm.processing
                                                    ? 'Updating...'
                                                    : 'Update Password'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Account Info Card */}
                    <Card className="mt-6 border-white/50 bg-white/90 backdrop-blur-sm dark:bg-white/10">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Account Details
                            </CardTitle>
                            <CardDescription>
                                Your account information and statistics
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Account Type
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900 capitalize dark:text-white">
                                        {authUser?.role || 'Retailer'}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        User ID
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                        #{user.id}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Member Since
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {new Date(
                                            user.created_at,
                                        ).getFullYear()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
