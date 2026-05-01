import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Store, Building2, User } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const [selectedRole, setSelectedRole] = useState<
        'retailer' | 'distributor'
    >('retailer');

    return (
        <AuthLayout
            title="Create an account"
            description="Select your account type and enter your details"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            {/* Role Selection */}
                            <div className="grid gap-3">
                                <Label>I am a</Label>
                                <RadioGroup
                                    value={selectedRole}
                                    onValueChange={(value) =>
                                        setSelectedRole(
                                            value as 'retailer' | 'distributor',
                                        )
                                    }
                                    className="grid grid-cols-2 gap-3"
                                >
                                    <input
                                        type="hidden"
                                        name="role"
                                        value={selectedRole}
                                    />
                                    <div>
                                        <RadioGroupItem
                                            value="retailer"
                                            id="retailer"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="retailer"
                                            className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                                        >
                                            <Store className="mb-2 h-6 w-6" />
                                            <span className="font-medium">
                                                Retailer
                                            </span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem
                                            value="distributor"
                                            id="distributor"
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor="distributor"
                                            className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                                        >
                                            <Building2 className="mb-2 h-6 w-6" />
                                            <span className="font-medium">
                                                Distributor
                                            </span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                                <InputError message={errors.role} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="John Doe"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Retailer Fields */}
                            {selectedRole === 'retailer' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="shop_name">
                                            Shop Name
                                        </Label>
                                        <Input
                                            id="shop_name"
                                            type="text"
                                            required
                                            name="shop_name"
                                            placeholder="Your shop name"
                                        />
                                        <InputError
                                            message={errors.shop_name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="shop_address">
                                            Shop Address
                                        </Label>
                                        <Input
                                            id="shop_address"
                                            type="text"
                                            required
                                            name="shop_address"
                                            placeholder="Street address"
                                        />
                                        <InputError
                                            message={errors.shop_address}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="shop_city">
                                                City
                                            </Label>
                                            <Input
                                                id="shop_city"
                                                type="text"
                                                required
                                                name="shop_city"
                                                placeholder="City"
                                            />
                                            <InputError
                                                message={errors.shop_city}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="shop_phone">
                                                Phone
                                            </Label>
                                            <Input
                                                id="shop_phone"
                                                type="tel"
                                                required
                                                pattern="[0-9]{10}"
                                                name="shop_phone"
                                                placeholder="10 digit phone number"
                                            />
                                            <InputError
                                                message={errors.shop_phone}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Distributor Fields */}
                            {selectedRole === 'distributor' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="company_name">
                                            Company Name
                                        </Label>
                                        <Input
                                            id="company_name"
                                            type="text"
                                            required
                                            name="company_name"
                                            placeholder="Your company name"
                                        />
                                        <InputError
                                            message={errors.company_name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="company_address">
                                            Company Address
                                        </Label>
                                        <Input
                                            id="company_address"
                                            type="text"
                                            required
                                            name="company_address"
                                            placeholder="Street address"
                                        />
                                        <InputError
                                            message={errors.company_address}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="company_city">
                                                City
                                            </Label>
                                            <Input
                                                id="company_city"
                                                type="text"
                                                required
                                                name="company_city"
                                                placeholder="City"
                                            />
                                            <InputError
                                                message={errors.company_city}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="company_phone">
                                                Phone
                                            </Label>
                                            <Input
                                                id="company_phone"
                                                type="tel"
                                                required
                                                pattern="[0-9]{10}"
                                                name="company_phone"
                                                placeholder="10 digit phone number"
                                            />
                                            <InputError
                                                message={errors.company_phone}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm Password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create Account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
