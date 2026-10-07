<?php

use App\Http\Controllers\Admin\AccessCodeController as AdminAccessCodeController;
use App\Http\Controllers\Admin\BookController as AdminBookController;
use App\Http\Controllers\Admin\ChapterController as AdminChapterController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\CardPlanController as AdminCardPlanController;
use App\Http\Controllers\Admin\CardQrController as AdminCardQrController;
use App\Http\Controllers\Admin\GenreController as AdminGenreController;
use App\Http\Controllers\Admin\MasterCardController as AdminMasterCardController;
use App\Http\Controllers\Admin\SlideController as AdminSlideController;
use App\Http\Controllers\Admin\TestimonialController as AdminTestimonialController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RazorpayController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\Auth\OtpLoginController;
use App\Http\Controllers\ReaderController;
use App\Http\Controllers\RedeemController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

/* Passwordless email-OTP login (readers) */
Route::middleware('guest')->group(function () {
    Route::get('/login/otp', [OtpLoginController::class, 'create'])->name('otp.create');
    Route::post('/login/otp', [OtpLoginController::class, 'store'])->name('otp.store');
    Route::get('/login/otp/verify', [OtpLoginController::class, 'showVerify'])->name('otp.verify');
    Route::post('/login/otp/verify', [OtpLoginController::class, 'verify'])->name('otp.verify.store');
});

Route::get('/library', [LibraryController::class, 'index'])->name('library');
Route::get('/books/{book}', [BookController::class, 'show'])->name('books.show');
Route::get('/books/{book}/read/{number}', [ReaderController::class, 'show'])
    ->whereNumber('number')->name('reader');
Route::get('/books/{book}/read/{number}/pdf', [ReaderController::class, 'pdf'])
    ->whereNumber('number')->name('reader.pdf');

/*
|--------------------------------------------------------------------------
| Authenticated reader
|--------------------------------------------------------------------------
*/
/* Physical card QR target — works signed out and can create the account. */
Route::get('/card/{code}', [CardController::class, 'fromQr'])->name('card.qr');
Route::post('/card/activate', [CardController::class, 'activate'])->name('card.activate');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/my-card', [CardController::class, 'show'])->name('card.show');
    Route::post('/my-card/claim', [CardController::class, 'claim'])->name('card.claim');
    Route::post('/my-card/digital', [CardController::class, 'createDigital'])->name('card.digital');
    Route::post('/my-card/recharge', [CardController::class, 'recharge'])->name('card.recharge');
    Route::post('/my-card/order', [CardController::class, 'order'])->name('card.order');
    Route::delete('/my-card/order/{order}', [CardController::class, 'cancelOrder'])->name('card.order.cancel');

    // Razorpay online checkout. verify() is declared first, and {order} is
    // number-only, so POST /pay/verify never binds as an order id.
    Route::post('/pay/verify', [RazorpayController::class, 'verify'])->name('pay.verify');
    Route::post('/pay/{order}', [RazorpayController::class, 'createOrder'])
        ->whereNumber('order')->name('pay.create');

    Route::get('/redeem', [RedeemController::class, 'create'])->name('redeem.create');
    Route::post('/redeem', [RedeemController::class, 'store'])->name('redeem.store');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    // Account self-deletion was removed from the product; the endpoint is gone
    // too, so it cannot be reached by a crafted request.
});

/*
|--------------------------------------------------------------------------
| Admin
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
    Route::put('users/{user}/admin', [AdminUserController::class, 'toggleAdmin'])->name('users.admin');

    Route::resource('books', AdminBookController::class)->except('show');
    Route::resource('books.chapters', AdminChapterController::class)->except('show');

    Route::get('genres', [AdminGenreController::class, 'index'])->name('genres.index');
    Route::post('genres', [AdminGenreController::class, 'store'])->name('genres.store');
    Route::put('genres/{genre}', [AdminGenreController::class, 'update'])->name('genres.update');
    Route::delete('genres/{genre}', [AdminGenreController::class, 'destroy'])->name('genres.destroy');

    // Codes are generated from the book form, so there is no create endpoint.
    Route::get('codes', [AdminAccessCodeController::class, 'index'])->name('codes.index');
    Route::delete('codes/{code}', [AdminAccessCodeController::class, 'destroy'])->name('codes.destroy');

    /* Master cards + recharge vouchers */
    Route::get('cards', [AdminMasterCardController::class, 'index'])->name('cards.index');
    Route::post('cards', [AdminMasterCardController::class, 'store'])->name('cards.store');
    Route::get('cards/{card}/qr', [AdminCardQrController::class, 'show'])->name('cards.qr');
    Route::put('cards/{card}/toggle', [AdminMasterCardController::class, 'toggle'])->name('cards.toggle');
    Route::put('cards/{card}/reset-devices', [AdminMasterCardController::class, 'resetDevices'])->name('cards.reset');
    Route::delete('cards/{card}', [AdminMasterCardController::class, 'destroy'])->name('cards.destroy');

    /* Pricing plans + purchase orders */
    Route::get('plans', [AdminCardPlanController::class, 'index'])->name('plans.index');
    Route::post('plans', [AdminCardPlanController::class, 'store'])->name('plans.store');
    Route::put('plans/{plan}', [AdminCardPlanController::class, 'update'])->name('plans.update');
    Route::delete('plans/{plan}', [AdminCardPlanController::class, 'destroy'])->name('plans.destroy');

    Route::get('orders', [AdminCardPlanController::class, 'orders'])->name('orders.index');
    Route::put('orders/{order}/approve', [AdminCardPlanController::class, 'approveOrder'])->name('orders.approve');
    Route::put('orders/{order}/cancel', [AdminCardPlanController::class, 'cancelOrder'])->name('orders.cancel');

    Route::get('vouchers', [AdminMasterCardController::class, 'vouchers'])->name('vouchers.index');
    Route::post('vouchers', [AdminMasterCardController::class, 'storeVouchers'])->name('vouchers.store');
    Route::delete('vouchers/{voucher}', [AdminMasterCardController::class, 'destroyVoucher'])->name('vouchers.destroy');

    Route::resource('slides', AdminSlideController::class)->except('show');

    Route::get('testimonials', [AdminTestimonialController::class, 'index'])->name('testimonials.index');
    Route::post('testimonials', [AdminTestimonialController::class, 'store'])->name('testimonials.store');
    Route::put('testimonials/{testimonial}', [AdminTestimonialController::class, 'update'])->name('testimonials.update');
    Route::delete('testimonials/{testimonial}', [AdminTestimonialController::class, 'destroy'])->name('testimonials.destroy');
});

require __DIR__.'/auth.php';
