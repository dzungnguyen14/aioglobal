# Reels — Tài liệu tích hợp API với Backend

> Phạm vi: `src/components/home/reels/`  
> Mục đích: mô tả chính xác app **đang gọi backend như thế nào**, backend cần trả về gì, và những chỗ **còn thiếu / lệch** cần thống nhất.  
> Tài liệu contract phía server: [`REELS_API.md`](./REELS_API.md). File này bổ sung phần phía app + danh sách vấn đề cần xử lý.

---

## 1. Cấu trúc module

| File | Vai trò |
|------|---------|
| `index.js` | `ReelsPage` — state, phân trang, mở comment, upload, refresh |
| `reel-item.js` | 1 reel: player (native / YouTube), like, caption, follow (UI) |
| `comments.js` | Panel bình luận (list, load more, gửi comment) |
| `upload.js` | Modal đăng video (chọn video + mô tả + quyền riêng tư) |
| `fetcher.js` | **Toàn bộ lời gọi API** + mapper response → model của UI |
| `data.js` | `formatCount()` (đang dùng) + `SAMPLE_REELS` (mock, **không còn dùng**) |
| `style.js` | Style |

## 2. Cấu hình chung

- Base URL: `API_HOST = "https://aioglobal.com.vn"` — **hardcode riêng trong `fetcher.js`**, khác với `API_HOST` của `src/shared/constant.js` (`app.aioglobal.org/api/mobile`). Các endpoint reels dùng prefix `/api/...` trên domain `aioglobal.com.vn`.
- HTTP client: `makeRequest(method, url, data, token, timeout, isFormData)` trong `src/fetcher/api.js` (axios).
  - Có `token` → gửi header `Authorization: Bearer <token>`.
  - `isFormData=true` → `multipart/form-data`, timeout 120s.
  - **Lỗi mạng/HTTP không throw**, mà trả về `{ success: false, msg }` (`msg` lấy từ `error.response.data.msg`).
- Danh tính người dùng (từ `useGlobal().state.profile`): `profile.email`, `profile.token`. Các endpoint `*_app` nhận **cả** `email` (form field) **và** Bearer token.

## 3. Bảng endpoint đang được app gọi

| Chức năng | Hàm trong `fetcher.js` | Method + URL (đúng như code) | Auth gửi đi | Dùng ở |
|---|---|---|---|---|
| Danh sách reels | `fetchReels` | `GET /api/reels/public?page&limit[&sort&user_id&q]` | **Không gửi gì** | `index.js` `loadReels` |
| Danh sách comment | `fetchReelComments` | `POST /api/comments/:reelId/reels` (FormData) | Không | `index.js` `loadReelComments` |
| Tạo comment / reply | `createReelComment` | `POST /api/comments/create_app` (FormData) | email + Bearer | `index.js` `handleSendComment` |
| Replies của comment | `fetchReelReplies` | `POST /api/replies/:reelId/reels` (FormData) | Không | **chưa được gọi** |
| Like reel | `likeReel` | `POST /api/likes_app` (có email) hoặc `/api/likes` | email + Bearer | `reel-item.js` `handleLike` |
| Upload video (bước 1) | `uploadReelVideo` | `POST /api/reels/upload_app` (FormData) | email + Bearer | qua `publishReel` |
| Tạo/sửa metadata (bước 2) | `createReel` | `POST /api/reels/create_app` (FormData) | email + Bearer | qua `publishReel` |
| Xoá reel | `deleteReel` | `POST /api/reels/delete/:reelId` | email + Bearer | **chưa có UI** |
| Đăng reel (gộp 2 bước) | `publishReel` | upload → create | — | `upload.js` |

## 4. Chi tiết từng luồng

### 4.1 Tải danh sách reels

`ReelsPage` → `fetchReels(page, limit=10)`.

- Phân trang: `filter = { page: 1, limit: 10 }`. Khi người dùng vuốt tới item cách cuối ≤ 2 (`threshold = 2`) và `hasMore` → `page + 1`.
- `hasMore = reels.length < response.total`.
- Pull-to-refresh (nút refresh): reset list, quay về `page=1`.
- Item không có `videoUri` bị **lọc bỏ** (`filter(item => item.videoUri)`).
- Kiểm tra lỗi: `response.success === false` → chỉ `console.error`, không hiện UI lỗi.

**Response mong đợi** (`{ total, data: [...] }`), mỗi item được map bởi `mapApiReelToReel`:

| Field backend | Field UI | Ghi chú |
|---|---|---|
| `reel_id` | `id` (string) | bắt buộc |
| `video_location` | `videoUri` | path tương đối → ghép `API_HOST`; `http*` giữ nguyên |
| `code` | `videoUri` + `isYoutube` | fallback khi **không** có `video_location`: nhúng `youtube.com/embed/{code}` |
| `image` | `thumbnail` | tương đối → ghép `API_HOST` (hiện UI chưa dùng thumbnail) |
| `owner_id` | `user.id` | |
| `displayname` / `user_displayname` | `user.name` | |
| `username` / `user_username` | `user.username` (thêm `@`) | |
| `avtar` (sic) | `user.avatar` | giữ nếu chứa `http` hoặc `app.aioglobal.org`, còn lại ghép `API_HOST` |
| `follower_id` | `user.isFollowing` | truthy = đã follow |
| `title` | `title` | |
| `description` (fallback `title`) | `caption` | |
| `like_count` | `likes` | |
| `dislike_count` | `dislikes` | chưa hiển thị |
| `comment_count` | `commentCount` | |
| `view_count` | `viewCount` | chưa hiển thị |
| `like_dislike` | `isLiked` / `isDisliked` | `'like'` / `'dislike'` / `null` |

### 4.2 Comment

1. Bấm icon bình luận → `POST /api/comments/:reelId/reels` với FormData `{ page, approved: 'approved', search: 'newest' }`.
2. Response `{ pagging: bool, comments: [...] }`; `pagging=true` → còn trang kế (cuộn cuối list sẽ gọi trang `commentsPage + 1`).
3. Map bởi `mapApiCommentToComment`:

| Field backend | Field UI |
|---|---|
| `comment_id` | `id` (string) |
| `displayname` \|\| `username` | `name` (fallback `'User'`) |
| `avtar` | `avatar` |
| `message` \|\| `body` | `text` |
| `like_count` | `likes` |
| `created_at` | `time` (**in thẳng chuỗi**, không format) |
| `replies.reply` | `replies` (chưa render) |
| `replies.pagging` | `repliesHasMore` |

4. Gửi comment: cần `profile.email` (không có → Alert yêu cầu đăng nhập). FormData `{ email, id (reel_id), type: 'reels', message, parent_id? }` → `POST /api/comments/create_app`.
   - Thành công khi **không** có `success === false` và **không** có `error`.
   - Sau đó app **tải lại trang 1** của comment và tăng `commentCount` cục bộ `+1`.

### 4.3 Like

`handleLike` (optimistic update): đảo `liked`, ±1 `likeCount`, gọi `likeReel({ reelId, action: 'like', email }, token)`.

- Có `email` → `/api/likes_app`; không có → `/api/likes`.
- Body FormData: `{ type: 'reels', id, action: 'like', email? }`.
- Server **toggle** khi gọi lại cùng action. Response hiện là `{}`.
- Rollback nếu `success === false` hoặc có `error`, hoặc throw.
- Chưa có chức năng dislike trên UI (hàm hỗ trợ `action: 'dislike'`).

### 4.4 Đăng reel

`ReelUpload` → `publishReel({ video, title, description, isPrivate, email }, token)`:

1. **Upload**: `POST /api/reels/upload_app`, FormData `{ email, upload: { uri, type, name } }` (`name = <timestamp>_<fileName>`; `type` lấy từ `mimeType` của ImagePicker, fallback `video/<ext>`).  
   Cần response có `id` (reel_id). Nếu `error` hoặc `success === false` → trả luôn lỗi; nếu thiếu `id` → lỗi `"Upload thành công nhưng không nhận được reel_id"`.
2. **Create**: `POST /api/reels/create_app`, FormData `{ email, id, title, description, privacy, [duration], [fromEdit] }`.
   - `title` = nội dung caption (nếu rỗng → `profile.fullname` → `'Untitled'`).
   - `privacy` = `'onlyme'` nếu bật "Chỉ mình tôi", ngược lại `'everyone'`.
3. Thành công → `handleUploadSuccess(response)`: lấy `response.editItem ?? response`; nếu có `reel_id` và map ra `videoUri` → **chèn lên đầu list**; ngược lại gọi `refreshReels()`.
   - ⇒ `editItem` cần chứa đủ field như item của `/reels/public` (đặc biệt `video_location`, `owner_id`, `displayname`, `username`, `avtar`).

**Định dạng lỗi app đang xử lý** (`upload.js`):
- `{ error: [{ message }, ...] }` → hiển thị nối bằng `\n`.
- `{ success: false, msg }` → hiển thị `msg`.
- (Lỗi của `makeRequest` luôn ở dạng `{ success: false, msg }`.)

## 5. Việc cần backend xác nhận / bổ sung

Đây là các điểm **lệch giữa code app và `REELS_API.md`**, hoặc **chức năng app đã chuẩn bị nhưng backend chưa đủ**:

| # | Vấn đề | Chi tiết | Đề xuất |
|---|--------|----------|---------|
| 1 | ~~URL comment lệch~~ **Đã sửa** | Route thật (`aioglobal_social/server/routes/api/comment.js`): `POST /api/comments/:id/:type` và `POST /api/comments/create_app` (body `email`, `id`, `type`, `message`, `parent_id`). App từng gọi `/api/reels/comments/...` nên bị 404; đã đổi trong `fetcher.js`. | Cập nhật `REELS_API.md` bổ sung `comments/create_app`. |
| 2 | **Trạng thái like/follow không cá nhân hoá** | `fetchReels` gọi **không kèm token/email**, nên `like_dislike` và `follower_id` luôn `null` → mở lại app là mất trạng thái đã like. | Cho `/api/reels/public` nhận Bearer token và/hoặc `email` (tuỳ chọn) để trả `like_dislike`, `follower_id` đúng user. App sẽ sửa `fetchReels` truyền token/email. |
| 3 | **Follow chưa có API** | Bấm avatar chỉ `setFollowing` local, không gọi server, reload là mất. | Cung cấp endpoint follow/unfollow (mobile, email/Bearer) và quy ước toggle/response. |
| 4 | **Like comment chưa có API** | `CommentRow` chỉ đổi state local. | Endpoint like comment (có thể dùng `/likes_app` với `type=comments`? cần xác nhận) + trả `like_dislike` của user trong list comment. |
| 5 | **Reply comment chưa làm** | Nút "Reply" không có handler; `replies` được map nhưng không render; `fetchReelReplies` chưa được gọi. `createReelComment` đã hỗ trợ `parent_id`. | Xác nhận `parent_id` đúng tên field; app sẽ làm UI reply + load thêm (`page` bắt đầu `2`). |
| 6 | **Response like quá nghèo** | Trả `{}` → app không đồng bộ được số like thật, chỉ cộng/trừ cục bộ. | Nên trả `{ action: 'like'\|'dislike'\|null, like_count, dislike_count }`. |
| 7 | **Tăng view** | Không có API ghi nhận lượt xem; `view_count` được map nhưng chưa hiển thị. | Nếu cần: endpoint `POST /api/reels/view/:reelId` (gọi khi item active ≥ N giây). |
| 8 | **Chia sẻ** | `shares` luôn `0`, UI chưa có nút share. | Chốt có làm không; nếu có cần `share_count` + URL chia sẻ reel. |
| 9 | **Thumbnail / duration** | App không gửi `image` (thumbnail) và `duration` khi tạo reel dù API hỗ trợ. | Xác nhận server tự sinh thumbnail/duration từ video; nếu cần app sẽ gửi. |
| 10 | **Privacy** | UI chỉ có `everyone` / `onlyme`; API còn `private`, `friend`. | Giữ nguyên hoặc mở rộng UI nếu cần. |
| 11 | **Sửa / xoá reel** | `createReel({ fromEdit })` và `deleteReel` đã có trong `fetcher.js` nhưng **chưa có UI**. Endpoint delete trong tài liệu ghi "Login" (không có bản `_app` theo email). | Xác nhận `/reels/delete/:id` chấp nhận Bearer + `email` từ mobile. |
| 12 | **`total` và item bị lọc** | App loại item không có `videoUri` nhưng `hasMore` so với `total` từ server; nếu server trả item thiếu `video_location`/`code` thì app có thể gọi thêm 1 trang rỗng (không gây lỗi). | Đảm bảo `/reels/public` chỉ trả reel đã xử lý xong video. |
| 13 | **Định dạng thời gian comment** | `time = created_at` hiển thị nguyên chuỗi. | Trả chuỗi đã định dạng ("2h ago") hoặc ISO để app tự format. |
| 14 | **Hiển thị lỗi** | `fetchReels` / `fetchReelComments` lỗi chỉ log console. | Thống nhất 1 envelope lỗi: `{ success:false, msg }` (đang dùng) — tránh trộn với `{ error:[{message}] }`. |
| 15 | **Host khác nhau** | Reels dùng `aioglobal.com.vn/api`, phần còn lại của app dùng `app.aioglobal.org/api/mobile`. | Xác nhận đây là chủ ý; token Bearer của mobile có hợp lệ trên domain reels không. |

## 6. Việc phía app (đã ghi nhận)

- `fetchReels`: truyền `token`/`email` sau khi backend xử lý mục #2.
- Gắn API follow, like comment, reply sau khi backend chốt contract (#3–#5).
- Xoá `console.log(JSON.stringify({ reelId, message, email }))` còn sót trong `index.js` (`handleSendComment`).
- Dùng chung `API_HOST` thay vì hardcode trong `fetcher.js` (sau khi chốt #15).
- Xoá `SAMPLE_REELS` trong `data.js` nếu không dùng nữa (chỉ giữ `formatCount`).

## 7. Checklist test tích hợp

- [ ] `GET /api/reels/public?page=1&limit=10` trả `{ total, data }`; trang cuối trả `data: []`.
- [ ] Reel có `video_location` tương đối và tuyệt đối đều phát được; reel YouTube (`code`) phát được.
- [ ] Avatar tương đối / tuyệt đối / chứa `app.aioglobal.org` hiển thị đúng.
- [ ] Like → reload app → vẫn thấy đã like (cần #2).
- [ ] Mở comment: trang 1, cuộn tải trang 2 khi `pagging: true`, dừng khi `false`.
- [ ] Gửi comment khi chưa đăng nhập → Alert; đã đăng nhập → comment xuất hiện đầu list, `commentCount` +1.
- [ ] Upload video: bước 1 trả `id`; bước 2 trả `editItem` đủ field để chèn lên đầu list.
- [ ] Upload sai định dạng/quá lớn → hiện đúng thông báo lỗi (`error[]` hoặc `msg`).
- [ ] Privacy `onlyme`: reel không xuất hiện ở `/reels/public` của người khác.
