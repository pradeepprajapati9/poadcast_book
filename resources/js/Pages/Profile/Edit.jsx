import { Head, usePage } from '@inertiajs/react';
import AccountLayout from '@/Layouts/AccountLayout';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

/**
 * Settings row: description on the left, fields on the right.
 * Stacked full-width cards made every form look equally important and left a
 * lot of dead space beside short inputs.
 */
function Section({ title, description, children }) {
    return (
        <div className="grid gap-5 border-b theme-border py-7 first:pt-0 last:border-b-0 last:pb-0 md:grid-cols-[15rem_1fr] md:gap-10">
            <div>
                <h2 className="font-display text-base font-bold theme-heading">{title}</h2>
                <p className="mt-1 text-sm leading-6 theme-muted">{description}</p>
            </div>
            <div className="max-w-md">{children}</div>
        </div>
    );
}

export default function Edit({ mustVerifyEmail, status }) {
    // Readers sign in with an emailed code and never set a password, so the
    // password form would ask them for a "current password" they cannot know.
    const isAdmin = usePage().props.auth?.user?.is_admin;

    return (
        <AccountLayout active="profile" title="Profile" subtitle="Manage your account details.">
            <Head title="Profile — StoryVerse" />

            <div className="rounded-2xl border theme-border theme-card px-5 py-2 sm:px-7">
                <Section
                    title="Profile Information"
                    description="Your name and email address. This is how you appear on StoryVerse."
                >
                    <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                </Section>

                {isAdmin && (
                    <Section
                        title="Password"
                        description="Use a long, unique password to keep your account secure."
                    >
                        <UpdatePasswordForm />
                    </Section>
                )}
            </div>
        </AccountLayout>
    );
}
