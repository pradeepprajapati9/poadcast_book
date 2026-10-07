<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$m = new App\Mail\OtpMail('482913', 10, 'SV-9MEG-M5FC-WRM2');
$m->to('test@example.com');
$rendered = $m->render();

echo "subject : ".$m->envelope()->subject."\n";
echo "html len: ".strlen($rendered)." bytes\n";
echo "code in html : ".(str_contains($rendered,'482913') ? 'yes' : 'NO')."\n";
echo "card in html : ".(str_contains($rendered,'SV-9MEG-M5FC-WRM2') ? 'yes' : 'NO')."\n";
echo "inline styles: ".(substr_count($rendered,'style="') )." (email clients need these)\n";
echo "<style> block: ".(str_contains($rendered,'<style') ? 'PRESENT (bad)' : 'none (good)')."\n";

// without a card
$m2 = new App\Mail\OtpMail('123456');
$m2->to('x@y.com');
$r2 = $m2->render();
echo "\nwithout card -> card block shown? ".(str_contains($r2,'will be added') ? 'YES (bad)' : 'no (good)')."\n";

file_put_contents(__DIR__.'/otp-preview.html', $rendered);
echo "\npreview saved: otp-preview.html\n";
