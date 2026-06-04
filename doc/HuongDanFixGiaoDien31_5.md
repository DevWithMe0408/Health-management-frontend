# Hướng dẫn fix giao diện (FE — nhánh `feature/UserTuDeXuat`)

Tài liệu này dành cho agent (Agent Code) thực hiện. Có 3 lỗi UI, đều là sửa nhỏ, **không rewrite**. Làm tuần tự theo từng task, sửa đúng vị trí, không động vào phần khác.

Repo FE: `Health-management-frontend`, nhánh `feature/UserTuDeXuat`.

---

## Lỗi 1 — Wizard onboarding khôi phục dữ liệu của user cũ

### Bối cảnh

State của onboarding wizard được persist vào `sessionStorage['onboarding-state']` (xem `src/contexts/OnboardingContext.tsx`) và chỉ bị xóa khi gọi `reset()`, mà `reset()` chỉ chạy đúng một nơi: `Step5Review` (khi hoàn thành toàn bộ wizard).

Khi user A điền dở rồi bỏ ngang, state ở lại trong `sessionStorage`. Lúc logout, `performLogout()` (trong `src/contexts/AuthContext.tsx`) hiện chỉ xóa token trong `localStorage`, **không đụng tới `sessionStorage`**. Do `sessionStorage` sống suốt vòng đời tab, nên khi user B đăng ký rồi vào wizard trong cùng tab, `OnboardingProvider` đọc lại state cũ → hiện dữ liệu của A.

### Cách fix: xóa toàn bộ cache (cả `localStorage` và `sessionStorage`) khi đăng xuất

> **QUAN TRỌNG:** `onboarding-state` nằm ở `sessionStorage`, KHÔNG phải `localStorage`. Bắt buộc clear cả hai, nếu chỉ clear `localStorage` thì lỗi vẫn còn.

**File:** `src/contexts/AuthContext.tsx` — hàm `performLogout`.

**Hiện tại:**

```tsx
const performLogout = () => {
  console.log("AuthProvider: Performing logout...");
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  setAccessToken(null);
  setRefreshToken(null);
  setIsAuthenticated(false);
  setUser(null);
};
```

**Sửa thành:**

```tsx
const performLogout = () => {
  console.log("AuthProvider: Performing logout...");
  // Xóa toàn bộ cache trình duyệt khi đăng xuất để tránh rò rỉ dữ liệu giữa các tài khoản.
  // sessionStorage chứa 'onboarding-state' (wizard dở dang) -> bắt buộc clear cả hai storage.
  localStorage.clear();
  sessionStorage.clear();
  // Reset React state (clear storage không tự reset state, phải giữ các dòng này).
  setAccessToken(null);
  setRefreshToken(null);
  setIsAuthenticated(false);
  setUser(null);
};
```

### Ràng buộc

- **Giữ nguyên** toàn bộ các dòng `setXxx(...)` — chúng reset React state, không liên quan tới storage.
- Không sửa `OnboardingContext.tsx`.
- Chấp nhận side-effect: `sidebarCollapsed` (preference thu gọn sidebar, lưu ở `localStorage`) sẽ bị reset về mặc định sau mỗi lần logout. Đây là hành vi mong muốn.

### Cách verify

1. Đăng ký tài khoản A → vào `/onboarding/wizard` → chọn vài lựa chọn ở các step nhưng **không** hoàn thành (không bấm submit ở Step 5).
2. Đăng xuất (KHÔNG đóng tab).
3. Đăng ký tài khoản B → vào lại `/onboarding/wizard`.
4. Kỳ vọng: wizard mở ở **Step 1 với form trống**, không còn lựa chọn nào của A.

---

## Lỗi 2 — Nút thu gọn sidebar & cụm username lệch, khoảng cách không cố định

### Bối cảnh

`Header` đã nằm trong content area có `md:ml-64` (lề trái bám theo sidebar). Nhưng bên trong header lại bọc thêm `container mx-auto`, làm nội dung header bị giới hạn chiều rộng tối đa và **căn giữa** thay vì trải full width. Hệ quả: nút thu gọn (trái) và cụm username (phải) đều bị đẩy vào trong, khoảng cách tới mép **thay đổi theo độ rộng màn hình** thay vì cố định.

### Cách fix: bỏ `container mx-auto`, dùng padding cố định

**File:** `src/components/layout/Header.tsx`

**Hiện tại** (dòng wrapper ngay trong `<header>`):

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
```

**Sửa thành:**

```tsx
<div className="px-4 sm:px-6">
```

Sau khi sửa, `flex justify-between` bên trong sẽ trải full content area: nút toggle cách mép trái 16px (`px-4`) cố định, cụm username cách mép phải 16px cố định, không đổi theo viewport.

### Ràng buộc

- Chỉ sửa đúng className của `<div>` wrapper này. **Không** sửa cấu trúc flex bên trong, không đụng nút toggle hay user menu.
- `AdminHeader` (`src/components/admin/AdminHeader.tsx`) là component **riêng**, KHÔNG sửa trong task này.

### Cách verify

Vào bất kỳ trang nào dùng `MainLayout` (vd `/dashboard`, `/nutrition-plan`), thử ở nhiều độ rộng màn hình desktop:
- Nút thu gọn sidebar luôn cách mép trái một khoảng cố định (16px), không "trôi" khi đổi kích thước cửa sổ.
- Cụm icon + username luôn sát mép phải một khoảng cố định (16px).

---

## Lỗi 3 — TDEE hiển thị dư phần thập phân

### Bối cảnh

`tdee` từ backend là số thực (vd `2207.563`). Chỗ render dùng `tdee.toLocaleString('vi-VN')` không giới hạn số chữ số thập phân, nên ra `2.207,563 kcal` (dấu chấm = nghìn, dấu phẩy = thập phân) → dài và rối.

### Cách fix: làm tròn về số nguyên khi format

**File:** `src/components/meal/InfoStrip.tsx` (dòng render TDEE)

**Hiện tại:**

```tsx
<InfoItem icon={BoltIcon} label="TDEE" value={`${tdee.toLocaleString('vi-VN')} kcal`} />
```

**Sửa thành:**

```tsx
<InfoItem icon={BoltIcon} label="TDEE" value={`${tdee.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} kcal`} />
```

### Ràng buộc

- Chỉ sửa đúng dòng TDEE. Không đụng các `InfoItem` khác (Mục tiêu, Thể trạng, ngày).
- Lưu ý: đây là **làm tròn**, nên `2207.563` sẽ hiển thị `2.208` (không phải `2.207`). Đây là hành vi đúng cho kcal.

### Cách verify

Vào `/nutrition-plan` với user có TDEE lẻ. Kỳ vọng: `TDEE: 2.208 kcal` (số nguyên, không có dấu phẩy thập phân).

---

## Checklist cuối

- [ ] Lỗi 1: `performLogout` clear cả `localStorage` và `sessionStorage`, giữ nguyên các `setXxx`.
- [ ] Lỗi 2: wrapper trong `Header.tsx` đổi `container mx-auto px-4 sm:px-6 lg:px-8` → `px-4 sm:px-6`.
- [ ] Lỗi 3: dòng TDEE trong `InfoStrip.tsx` thêm `{ maximumFractionDigits: 0 }`.
- [ ] Chạy `npm run dev`, kiểm tra không có lỗi TypeScript/ESLint mới.
- [ ] Test lại 3 luồng verify ở trên.

Commit message gợi ý (tiếng Anh, theo convention dự án):

```
fix(ui): clear all browser cache on logout, fix header spacing, round TDEE display

- clear localStorage + sessionStorage on logout to prevent onboarding state leaking across accounts
- replace container mx-auto with fixed padding in Header for consistent toggle/username spacing
- round TDEE to integer in InfoStrip
```
