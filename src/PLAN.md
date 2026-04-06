# Implementasi: Koneksikan Semua Menu & Editing

## Masalah yang Ditemukan

1. **MyProfile** — Hanya menampilkan data, tidak ada tombol edit per section
2. **ProfileView back-button** — Hardcoded `maxWidth: 430px` dan `translateX(-50%)`, rusak di desktop
3. **Discover** — Tidak ada state filter yang persistent
4. **Requests** — Ruang ta'aruf tidak terbuka otomatis setelah accept
5. **Rooms** — Tidak ada empty state yang bagus, profile null tidak di-handle
6. **TaarufRoom** — Perlu cek apakah room ada sebelum render
7. **SplashScreen** — Tidak mengarahkan ke discover jika sudah onboard
8. **Register** — `updateUser` tidak tersambung dengan benar
9. **AppContext** — `getNextStep` tidak digunakan konsisten di semua halaman

## Perbaikan Yang Akan Dilakukan

### 1. MyProfile — Inline Edit
- Tambah tombol ✏️ Edit di setiap section CV
- Modal edit per section (Personal, Ibadah, Kesehatan, Visi)
- Simpan langsung ke context via `updateCV`

### 2. SplashScreen — Smart Routing
- Cek status user di localStorage, redirect ke halaman yang sesuai
- Jika sudah lengkap → `/discover`, jika belum → `/register` atau step berikutnya

### 3. ProfileView — Desktop Fix
- Perbaiki posisi back button agar tidak hardcode `maxWidth: 430px`
- Gunakan `position: sticky` atau relative positioning

### 4. Requests — Room Navigation
- Setelah accept request, navigasi langsung ke room tab
- Tambah badge "Buka Ruang" yang lebih jelas

### 5. Register & Verify — Update Context
- Pastikan `email`, `name`, `gender` tersimpan ke context saat register

### 6. AppContext — Reset & Logout
- Tambah fungsi `logout()` dan `resetOnboarding()`
- Pastikan `getNextStep` konsisten

### 7. Navigation Flow — End-to-end
- SplashScreen → Onboarding → Register → Verify → Akad → Readiness → CVBuilder → Discover
- Setiap halaman punya tombol back yang benar
