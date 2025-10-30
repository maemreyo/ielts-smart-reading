
### Chiến lược Tích hợp Media (Hình ảnh/Video) với Ưu tiên "Hoàn toàn Miễn phí"

Sử dụng kết hợp **YouTube (Unlisted) cho video** và **Imgur cho ảnh** là chiến lược khả thi và đáng tin cậy nhất. Dữ liệu media sẽ được quản lý thông qua một file `media-manifest.json` riêng cho mỗi bài đọc.

---

### Checklist Chi tiết để Tích hợp Media

**Giai đoạn 1: Chuẩn bị và Lưu trữ Media (Công việc nội dung)**

1.  **Tạo Media:** Chuẩn bị các file hình ảnh (`.jpg`, `.png`) và video (`.mp4`) cho từng đoạn văn cần minh họa.
2.  **Upload Video lên YouTube:**
    *   Tạo kênh YouTube cho dự án.
    *   Upload video lên và đặt chế độ hiển thị là **"Không công khai" (Unlisted)**.
    *   Lấy link **nhúng (embed)** của từng video (ví dụ: `https://www.youtube.com/embed/your-video-id`).
3.  **Upload Hình ảnh lên Imgur:**
    *   Tạo tài khoản trên [Imgur](https://imgur.com/).
    *   Upload hình ảnh và lấy **link trực tiếp (Direct Link)** (ví dụ: `https://i.imgur.com/your-image-id.jpg`).

**Giai đoạn 2: Cập nhật Cấu trúc Dữ liệu**

1.  **Tạo file `media-manifest.json`:**
    *   Trong thư mục của bài đọc (ví dụ: `data/17/reading/test-3/`), tạo một file mới tên là `media-manifest.json`.
    *   File này sẽ ánh xạ chỉ số của đoạn văn (paragraph index) tới URL media tương ứng.
2.  **Điền dữ liệu vào file Manifest:**
    *   **Lưu ý:** File này tách biệt hoàn toàn với file `1__.json` (chứa lexical items).
    *   **Ví dụ cấu trúc:**
        ```json
        {
          "passage-1": {
            "0": { // Chỉ số của đoạn văn (bắt đầu từ 0)
              "image": "https://i.imgur.com/your-image-id-p1.jpg",
              "video": "https://www.youtube.com/embed/your-video-id-p1"
            },
            "1": {
              "video": "https://www.youtube.com/embed/your-video-id-p2"
            }
          }
        }
        ```

**Giai đoạn 3: Triển khai trên Frontend (Công việc Code)**

1.  **Cập nhật Logic Tải dữ liệu:**
    *   Trong trang hiển thị bài đọc, cập nhật logic để đọc thêm file `media-manifest.json`.
2.  **Truyền dữ liệu Media:**
    *   Truyền dữ liệu media đã đọc được xuống component `ReadingContent`.
3.  **Hiển thị Media trong `ReadingContent.tsx`:**
    *   Trong vòng lặp `map` qua các đoạn văn, kiểm tra xem có media cho `index` của đoạn văn hiện tại không.
    *   **Nếu có video:** Render thẻ `<iframe>` với URL nhúng từ YouTube.
        ```tsx
        <div className="video-container" style={{position: 'relative', paddingBottom: '56.25%', height: 0}}>
          <iframe
            src={media.video}
            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        ```
    *   **Nếu có hình ảnh:** Render thẻ `<img>`.
        ```tsx
        <img src={media.image} alt={`Illustration for paragraph ${index + 1}`} style={{width: '100%', height: 'auto', borderRadius: '8px'}} />
        ```
4.  **Thêm CSS:**
    *   Viết CSS để đảm bảo media hiển thị responsive và đẹp mắt. Đoạn code ví dụ trên đã bao gồm một số style inline cơ bản để giữ tỷ lệ khung hình cho video.