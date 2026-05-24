# Tech Stack — Fashion Ecommerce MVP

## Stack tổng quan

| Layer    | Công nghệ                              | Lý do chọn                            |
| -------- | -------------------------------------- | ------------------------------------- |
| Frontend | Next.js 14 (App Router)                | SSR + API Routes trong 1 repo         |
| Styling  | Tailwind CSS + TypeScript              | Tốc độ build UI nhanh, type-safe      |
| State    | Zustand + React Query                  | Nhẹ, đủ dùng cho MVP                  |
| AR / AI  | MediaPipe Pose + Three.js + Claude API | Chạy hoàn toàn trên browser           |
| Backend  | Next.js API Routes + Supabase          | Không cần server riêng                |
| Database | Supabase (PostgreSQL) + Prisma ORM     | Auth + DB + Storage đều có sẵn        |
| Payment  | COD                                    | Không cần chú trọng vào thanh toán    |
| Storage  | Cloudinary + Supabase Storage          | Ảnh sản phẩm + xóa background tự động |
| Deploy   | Vercel                                 | Zero-config, push-to-deploy           |
| CI       | GitHub Actions                         | Miễn phí, tích hợp sẵn với Vercel     |

---

## Chi tiết từng layer

### Frontend — Next.js 14 (App Router)

```
Next.js 14
Tailwind CSS
TypeScript
Zustand         # global state (cart, user session)
React Query     # server state, caching API calls
```

Next.js App Router đảm nhiệm cả frontend lẫn API routes — không cần tách repo BE riêng. Toàn bộ là JavaScript/TypeScript nên 1-2 người không phải context-switch giữa 2 ngôn ngữ.

### AR / AI Layer — Chạy hoàn toàn trên trình duyệt

```
MediaPipe Pose      # nhận diện tọa độ keypoint cơ thể
Canvas 2D API       # vẽ overlay 2D lên video stream
getUserMedia        # truy cập camera thiết bị
Three.js            # render 3D avatar/mannequin
TensorFlow.js       # hỗ trợ inference trên browser
Claude API          # AI gợi ý size (qua Next.js API Route)
```

### Backend — Next.js API Routes + Supabase

```
Supabase    # PostgreSQL + Auth + Realtime + Storage
Prisma ORM  # type-safe DB queries
```

Supabase thay thế cho cả một backend team riêng: auth, DB, realtime, storage đều có sẵn và miễn phí ở mức MVP.

### Storage

```
Cloudinary          # ảnh sản phẩm (có API xóa background tự động)
Supabase Storage    # assets khác (GLB models, overlays)
```

> **Lưu ý:** Ảnh overlay cho V-Style AR cần xử lý background removal. Cloudinary có sẵn API `e_background_removal` — không cần tự build.

### Deploy & Infra

```
Vercel              # hosting (zero-config với Next.js)
GitHub Actions      # CI pipeline
Vercel Analytics    # tracking cơ bản
```

---

## Mapping tính năng → công nghệ cụ thể

### V-Style AR (2D Real-time Style Check) — Khó nhất

**Công nghệ:**

- `MediaPipe Pose` → detect tọa độ 33 keypoints trên cơ thể
- `Canvas 2D API` → vẽ ảnh sản phẩm đè lên video stream theo tọa độ
- `getUserMedia` → truy cập camera
- `Cloudinary` → ảnh sản phẩm đã xóa background

**Rủi ro cần biết:**

Độ chính xác overlay phụ thuộc nhiều vào chất lượng ảnh sản phẩm. Nếu thời gian eo hẹp, có thể mock bằng cách chụp ảnh sản phẩm lên người mẫu thật rồi dùng CSS transform thô thay vì AR thực sự — vẫn đủ để demo.

### V-Fit 3D Avatar — Khó

**Công nghệ:**

- `Three.js` → render 3D mannequin trong browser
- `GLB/GLTF model` → body mesh base (lấy miễn phí từ ReadyPlayerMe hoặc Mixamo)
- Morph targets → biến đổi tỷ lệ cơ thể theo input người dùng (chiều cao, cân nặng)
- `OrbitControls` → xoay 360 độ

### V-Fit AI Suggestion — Dễ nhất, demo ấn tượng nhất

**Công nghệ:**

- `Claude/OpenAI/Gemini API` → nhận size chart sản phẩm + số đo người dùng → trả về gợi ý size + % fit score
- `Next.js API Route` → proxy che giấu API key
- Structured JSON response → hiển thị "Size M — Độ vừa vặn: 95%"

**Prompt mẫu:**

```
Bạn là AI tư vấn size thời trang. Dựa trên:
- Thông số người dùng: chiều cao {height}cm, cân nặng {weight}kg, số đo vòng ngực {chest}cm
- Size chart sản phẩm: {sizeChart}
- Phom dáng: {fit} (slim-fit / regular / oversized)

Hãy trả về JSON với: recommended_size, fit_percentage, advice
```

### Ecommerce Core — Vừa

**Công nghệ:**

- `Supabase` → bảng products, orders, users, cart
- `Stripe` → checkout, webhook xử lý đơn hàng
- `Next.js` → SSR cho trang catalog (SEO-friendly)

---

## Thứ tự build — MVP 8 tuần

```
Tuần 1–2   Ecommerce core (catalog, cart, auth, Stripe)
Tuần 3–4   V-Fit AI Suggestion (ROI cao, ít rủi ro nhất)
Tuần 5–6   V-Fit 3D Avatar (Three.js + GLB model)
Tuần 7–8   V-Style AR + polish UI + bug fix
```

> Nếu AR không xong kịp trong tuần 7-8, hai tính năng còn lại vẫn đủ để demo ấn tượng cho nhà đầu tư hoặc khách hàng đầu tiên.

---

## Lý do không dùng các lựa chọn khác

| Bỏ qua                 | Lý do                                                       |
| ---------------------- | ----------------------------------------------------------- |
| React Native / Flutter | Web-first là đủ cho MVP; mobile app tốn thêm 2-3 tuần setup |
| Express / NestJS riêng | Next.js API Routes đủ dùng, tránh quản lý 2 repo            |
| AWS / GCP              | Vercel + Supabase đơn giản hơn nhiều cho team nhỏ           |
| Redux                  | Zustand nhẹ hơn, ít boilerplate hơn cho MVP                 |
| MongoDB                | Supabase PostgreSQL đủ mạnh và có built-in auth             |

---

_Stack này có thể scale lên sau khi MVP thành công: tách API sang NestJS, chuyển infra sang AWS, thêm Redis cache cho catalog._

Act as a senior frontend developer. Build a fully responsive pixel-perfect React component with Tailwind CSS based on this UI description
Phong cách chủ đạo là Hiện đại (Modern), Tối giản (Minimalist), Sạch sẽ (Clean layout) với rất nhiều khoảng trắng (generous whitespace). Khung hình tỷ lệ dài theo chiều dọc hiển thị toàn bộ trang web.

1.  Color Palette & Typography (Bảng màu và Chữ)

    Colors: Nền trắng tinh khiết (#FFFFFF), chữ màu đen tuyền (#000000) mang lại độ tương phản cao. Các nút phụ sử dụng màu xám nhạt thanh lịch. Các banner lớn đan xen sử dụng hình ảnh thực tế với tone màu tự nhiên (xanh lá cây của rừng, màu cát/đất đá của hoang mạc, màu xanh dương của biển).

    Typography: Sử dụng font chữ Sans-serif hiện đại, gọn gàng, độ dày nét vừa phải (Medium/Bold cho tiêu đề, Regular cho phần văn bản). Tất cả các tiêu đề danh mục đều viết hoa (UPPERCASE).

2.  Layout Structure & Components (Cấu trúc giao diện)

    Header / Navigation Bar: Thanh điều hướng mỏng cố định ở trên cùng. Bên trái là logo chữ "blue banana" viết thường, tối giản. Ở giữa là menu: Mid Season, Men, Women, Kids, Athletics, Explore. Bên phải bao gồm lựa chọn ngôn ngữ "EN", biểu tượng Tìm kiếm (Search), Tài khoản (Profile), Yêu thích (Wishlist - hình trái tim), và Giỏ hàng (Cart).

    Hero Section: Banner tràn viền (Full-width) cực lớn hiển thị ảnh người mẫu ngoài trời sống động. Ở giữa banner có dòng chữ lớn nổi bật "UP TO 30% OFF - MID SEASON SALE" kèm 3 nút CTA hình bo góc bầu dục (pill-shaped buttons) màu trắng: "MEN", "WOMEN", "KIDS".

    Featured Categories Grid: Tiêu đề "FEATURED CATEGORIES". Lưới gồm 4 ảnh dọc liền kề nhau tương ứng với các danh mục: T-SHIRTS, HOODIES, SWEATSHIRTS, JACKETS. Chữ danh mục màu trắng nằm đè ngay giữa mỗi bức ảnh. Bên phải tiêu đề có cụm nút chuyển đổi nhanh "SEE MEN'S" (nền đen chữ trắng) và "SEE WOMEN'S" (nền xám chữ trắng).

    Full-Width Lookbook Banners: Các banner phong cảnh đan xen giữa các hàng sản phẩm để ngắt nhịp thiết kế (ví dụ: ảnh người mẫu nam mặc áo sweater xanh rêu bên bờ biển góc đá, ảnh một em bé ngồi giữa rừng cây xanh mướt "Kids Best Sellers", và một người đàn ông chạy trên hoang mạc cát "Athletics").

    Product Carousel / Grid Layout: Các khối sản phẩm (như "CLASSIC & ICONIC", "BLUE BANANA BEST SELLERS") được sắp xếp theo dạng lưới 5 cột bằng nhau. Mỗi thẻ sản phẩm (Product Card) bao gồm:

        Ảnh vuông hoặc ảnh dọc tỉ lệ 3:4 của người mẫu mặc đồ, nền ảnh chụp studio tối giản có màu xám nhạt đồng bộ.

        Góc trên bên phải ảnh có icon trái tim nhỏ để lưu sản phẩm.

        Phía dưới ảnh là các chấm tròn nhỏ (Color swatches) đại diện cho các phiên bản màu sắc có sẵn.

        Tên sản phẩm viết hoa, font chữ nhỏ mảnh.

        Giá tiền kèm phần trăm giảm giá hiển thị dạng tag màu đen chữ trắng (Ví dụ: -20%, -30%).

        Icon túi mua sắm nhỏ nằm ở góc dưới bên phải mỗi thẻ sản phẩm.

    Membership / Club Section: Khối banner ngang chủ đề "ADVENTURE PASS, THE BLUE BANANA CLUB" sử dụng hình ảnh flycam chụp một ngọn núi đá màu cam đất lúc hoàng hôn. Text mô tả căn giữa, có nút CTA nổi bật màu trắng bo tròn góc ghi "DISCOVER THE BENEFITS".

    Newsletter Section: Khu vực đăng ký nhận tin đơn giản với tiêu đề "NEWSLETTER", dòng mô tả ngắn, một ô input nhập email viền đen mỏng mảnh và nút "SUBSCRIBE" hình chữ nhật vuông vức màu đen hoàn toàn.

    Footer Section: Cấu trúc 4 cột rõ ràng bao gồm các liên kết: ATTENDANCE, INFORMACIÓN, SOCIALS, TERMS AND POLICY. Font chữ nhỏ, tinh giản. Dưới cùng là logo chứng nhận hình tròn "B Corp Certified", thông tin bản quyền "© 2026 Blue Banana Brand" và các icon phương thức thanh toán phổ biến (Apple Pay, PayPal, Visa, Mastercard).

3.  UX UI Details (Chi tiết trải nghiệm)

    Thiết kế sử dụng các đường bo góc cực nhẹ trên các nút bấm lớn nhưng giữ nguyên góc vuông phẳng cho các thẻ sản phẩm và ô nhập liệu tạo cảm giác rất "high-fashion".

    Phía góc phải màn hình có các nút chức năng thả nổi (Floating action buttons) hình tròn màu vàng (Tài khoản) và màu trắng (Chat hỗ trợ).

    Style Keywords: High-end e-commerce, Minimalist fashion web design, clean grid, lookbook style, responsive web interface, premium clothing brand, aesthetic UI, figma inspiration.
