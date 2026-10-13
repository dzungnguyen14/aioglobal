# Reels API Documentation

> Base URL: `https://aioglobal.com.vn/api`  
> Cập nhật: 2026-07-11

## Tổng quan

| API | Method | Auth | Mô tả |
|-----|--------|------|-------|
| `/reels/public` | GET, POST | Không | Danh sách reels (phân trang) |
| `/comments/:id/reels` | POST | Không | Lấy comments của reel |
| `/replies/:id/reels` | POST | Không | Lấy replies của comment |
| `/likes` | POST | Login (session/Bearer) | Like/dislike reel |
| `/likes_app` | POST | Email | Like/dislike reel (mobile app) |
| `/reels/upload` | POST | Login | Upload video reel (bước 1) |
| `/reels/upload_app` | POST | Email | Upload video reel (mobile app) |
| `/reels/create` | POST | Login | Tạo/sửa reel metadata (bước 2) |
| `/reels/create_app` | POST | Email | Tạo/sửa reel metadata (mobile app) |
| `/reels/delete/:reel_id` | POST | Login | Xóa reel |

---

## 1. Listing Reels (Public)

**GET hoặc POST** `/api/reels/public`

Không cần đăng nhập.

### Request

| Param | Type | Default | Mô tả |
|-------|------|---------|-------|
| `page` | number | `1` | Trang (bắt đầu từ 1) |
| `limit` | number | `20` | Số item/trang (tối đa 100) |
| `user_id` | number | — | Lọc theo owner |
| `q` | string | — | Tìm theo title |
| `sort` | string | `latest` | `latest`, `view`, `like`, `dislike`, `commented` |

### Response

```json
{
  "total": 150,
  "data": [
    {
      "reel_id": 42,
      "title": "My Reel",
      "description": "Caption here",
      "video_location": "/upload/reels/video/abc.mp4",
      "image": "/upload/images/reels/video/thumb.jpg",
      "owner_id": 5,
      "displayname": "John Doe",
      "username": "johndoe",
      "avtar": "/upload/images/avatar.jpg",
      "like_count": 120,
      "dislike_count": 2,
      "comment_count": 45,
      "view_count": 1500,
      "like_dislike": null,
      "follower_id": null
    }
  ]
}
```

### Ví dụ

```bash
GET /api/reels/public?page=1&limit=10
GET /api/reels/public?page=2&limit=20&sort=view
GET /api/reels/public?user_id=5&page=1&limit=10
```

---

## 2. Comments của Reel (Public)

**POST** `/api/comments/:reel_id/reels`

- `:reel_id` — ID của reel
- `:type` — phải là `reels`

Không cần đăng nhập.

### Request body (FormData)

| Field | Type | Default | Mô tả |
|-------|------|---------|-------|
| `page` | number | `1` | Trang |
| `search` | string | `newest` | `newest`, `oldest`, `liked`, `replied`, `disliked` |
| `approved` | string | `approved` | Lọc comment đã duyệt |

### Response

```json
{
  "pagging": true,
  "comments": [
    {
      "comment_id": 123,
      "body": "Great reel!",
      "displayname": "Jane",
      "username": "jane",
      "avtar": "/upload/images/avatar.jpg",
      "like_count": 5,
      "replies": {
        "pagging": false,
        "reply": []
      }
    }
  ]
}
```

> Mỗi trang trả về tối đa **6** comments. `pagging: true` nghĩa là còn trang tiếp theo.

### Load thêm replies

**POST** `/api/replies/:reel_id/reels`

| Field | Mô tả |
|-------|-------|
| `comment_id` | ID comment cha |
| `page` | Trang (bắt đầu từ `2` cho replies thêm) |

---

## 3. Like / Dislike Reel

### Web (session login)

**POST** `/api/likes`

| Field | Type | Mô tả |
|-------|------|-------|
| `type` | string | `reels` |
| `id` | number | `reel_id` |
| `action` | string | `like` hoặc `dislike` |

### Mobile app (email auth)

**POST** `/api/likes_app`

| Field | Type | Mô tả |
|-------|------|-------|
| `email` | string | Email user đã đăng ký |
| `type` | string | `reels` |
| `id` | number | `reel_id` |
| `action` | string | `like` hoặc `dislike` |

### Response

```json
{}
```

> Gọi lại cùng `action` sẽ **toggle** (bỏ like/dislike).

---

## 4. Tạo Reel (2 bước)

### Bước 1: Upload video

**POST** `/api/reels/upload` (login) hoặc `/api/reels/upload_app` (email)

| Field | Type | Mô tả |
|-------|------|-------|
| `upload` | file | File video (mp4, mov, webm, ...) |
| `email` | string | *(chỉ `_app`)* Email user |

### Response bước 1

```json
{
  "id": 99,
  "videoWidth": 1080,
  "videoHeight": 1920,
  "images": ["https://aioglobal.com.vn/upload/images/reels/video/thumb.jpg"],
  "name": "video_filename"
}
```

### Bước 2: Tạo metadata

**POST** `/api/reels/create` (login) hoặc `/api/reels/create_app` (email)

| Field | Type | Bắt buộc | Mô tả |
|-------|------|----------|-------|
| `id` | number | Có (sau upload) | `reel_id` từ bước 1 |
| `title` | string | Có | Tiêu đề |
| `description` | string | Không | Mô tả/caption |
| `privacy` | string | Không | `everyone` (default), `private`, `friend`, `onlyme` |
| `duration` | string | Không | Thời lượng `HH:MM:SS` |
| `image` | file | Không | Thumbnail tùy chọn |
| `email` | string | *(chỉ `_app`)* | Email user |

### Response bước 2

```json
{
  "reel_id": 99,
  "message": "Your reel has been created successfully.",
  "editItem": { /* reel object */ },
  "title": "My Reel",
  "image": "/upload/images/reels/video/thumb.jpg"
}
```

---

## 5. Sửa Reel (Edit)

Dùng cùng endpoint **POST** `/api/reels/create` hoặc `/api/reels/create_app`.

| Field | Mô tả |
|-------|-------|
| `id` | `reel_id` cần sửa |
| `fromEdit` | `1` — đánh dấu đang edit (không re-process video) |
| `title` | Tiêu đề mới |
| `description` | Mô tả mới |
| `privacy` | Quyền riêng tư mới |
| `image` | Thumbnail mới (optional) |

### Response

```json
{
  "reel_id": 99,
  "message": "Your reel has been edited successfully.",
  "editItem": { /* reel object đã cập nhật */ }
}
```

---

## Luồng tạo reel (Mobile)

```
1. POST /api/reels/upload_app  (video file + email)
   → nhận reel_id (field "id")

2. POST /api/reels/create_app  (id + title + description + privacy + email)
   → reel published
```

Helper trong app: `publishReel()` trong `src/components/home/reels/fetcher.js` gộp 2 bước trên.

---

## Files đã thay đổi

| File | Thay đổi |
|------|----------|
| `server/routes/api/reels.js` | Thêm `/reels/public`, `/reels/create_app`, `/reels/upload_app` |
| `server/controllers/api/reels.js` | Thêm `publicList` handler |
| `server/models/reels.js` | Thêm `countITEM`, `orderby`, sửa likes JOIN |
| `app_aioglobal/.../fetcher.js` | API helpers: fetch, comments, like, create, publish |
