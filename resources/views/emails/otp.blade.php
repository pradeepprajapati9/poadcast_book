{{--
    OTP email.

    Table layout with inline styles on purpose — Gmail, Outlook and most Indian
    mail apps strip <style> blocks and ignore flexbox, so anything fancier
    collapses into unstyled text.
--}}
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Your StoryVerse code</title>
</head>
<body style="margin:0; padding:0; background:#f1f5f9; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">

    {{-- Preview line shown in the inbox list, hidden in the body --}}
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">
        {{ $code }} — valid for {{ $minutes }} minutes.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; padding:24px 12px;">
        <tr>
            <td align="center">

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                       style="max-width:460px; background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0;">

                    {{-- Header --}}
                    <tr>
                        <td style="background:#080b14; padding:24px 28px;">
                            <div style="font-size:17px; font-weight:700; color:#ffffff; letter-spacing:3px;">
                                STORYVERSE
                            </div>
                            <div style="font-size:10px; color:#d4af6a; letter-spacing:2px; margin-top:3px;">
                                DIGITAL LIBRARY
                            </div>
                        </td>
                    </tr>

                    {{-- Code --}}
                    <tr>
                        <td style="padding:32px 28px 8px;">
                            <p style="margin:0 0 6px; font-size:18px; font-weight:600; color:#0f172a;">
                                Your sign-in code
                            </p>
                            <p style="margin:0 0 24px; font-size:14px; line-height:22px; color:#475569;">
                                Enter this code to sign in. No password needed.
                            </p>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center"
                                        style="background:#fdf8ee; border:1px solid #e8cf94; border-radius:12px; padding:20px 12px;">
                                        <div style="font-size:34px; font-weight:700; letter-spacing:10px; color:#0f172a; font-family:'Courier New',Courier,monospace;">
                                            {{ $code }}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:16px 0 0; font-size:13px; color:#64748b;">
                                Valid for {{ $minutes }} minutes.
                            </p>

                            @if ($cardCode)
                                <p style="margin:16px 0 0; padding:12px 14px; background:#f8fafc; border-radius:10px; font-size:13px; line-height:20px; color:#334155;">
                                    Card <strong style="font-family:'Courier New',Courier,monospace;">{{ $cardCode }}</strong>
                                    will be added to your account once you sign in.
                                </p>
                            @endif
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="padding:24px 28px 28px;">
                            <div style="height:1px; background:#e2e8f0; margin-bottom:16px;"></div>
                            <p style="margin:0; font-size:12px; line-height:19px; color:#94a3b8;">
                                If you did not request this code, you can safely ignore this email —
                                nobody can sign in without it.
                            </p>
                        </td>
                    </tr>
                </table>

                <p style="margin:16px 0 0; font-size:11px; color:#94a3b8;">
                    &copy; {{ date('Y') }} StoryVerse
                </p>

            </td>
        </tr>
    </table>
</body>
</html>
