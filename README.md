# Sổ chấm điểm hàng ngày

Ứng dụng React/Vite cho nhiều giáo viên trong **một trường**, dùng Firebase Authentication, Cloud Firestore và Firebase Hosting.

- Website: https://qsangtnl-4226a.web.app
- Firebase project: `qsangtnl-4226a`.
- Database: `(default)`, khu vực `asia-southeast1` (Singapore), đã bật bảo vệ xóa database.

## Đăng nhập và sử dụng

Giáo viên đăng nhập Google hoặc đăng ký bằng email/mật khẩu và tên lớp. Mỗi tài khoản có dữ liệu riêng; tài khoản mới không được tự cấp quyền quản trị và không được đưa học sinh/nhật ký mẫu lên database.

Quản trị viên xem tài khoản và lớp toàn trường, tạo tài khoản giáo viên, khóa tài khoản và khóa kỳ chấm điểm. Giáo viên tạo tài khoản lớp trưởng bằng email thực và mật khẩu ban đầu. Mật khẩu chỉ hiển thị khi cấp tài khoản, không lưu trong Firestore hoặc bộ nhớ tài khoản trên máy. Email đặt lại mật khẩu được Firebase Authentication xử lý.

Lớp trưởng chỉ truy cập dữ liệu của giáo viên được gán, ghi điểm theo quyền được cấp và sửa các nhật ký do mình tạo. Không được quản lý học sinh hoặc danh mục. Quyền được kiểm tra tại Firestore; việc sửa giao diện hoặc localStorage không vượt qua được phân quyền. Khóa tuần, tháng và học kỳ được kiểm tra khi ghi nhật ký.

Các thay đổi trên Firestore được cập nhật qua listener thời gian thực. Đăng xuất hoặc đổi tài khoản xóa dữ liệu phiên trước khỏi giao diện. Khi một hồ sơ bị khóa, ứng dụng đăng xuất và rules từ chối truy cập dữ liệu.

## Chạy tại máy

Yêu cầu Node.js 24. Cấu hình Web Firebase trong `firebase-applet-config.json` là cấu hình công khai; không chứa khóa quản trị.

```sh
npm ci
npm run dev
```

## Kiểm tra và triển khai

Kiểm thử rules yêu cầu Java 21. Emulator dùng project giả lập `demo-so-cham-diem`, không dùng database thật.

```sh
npm run lint
npm run build
npm run test:backup
npm run test:rules
npx firebase login
npx firebase deploy --only firestore:rules,hosting --project qsangtnl-4226a
```

Trên Windows, nếu Java không đọc được đường dẫn tiếng Việt, chạy emulator từ thư mục tạm có tên không dấu, với bản sao của `firestore.rules` và `firebase.emulators.json`. GitHub Actions chạy trên Linux nên không gặp giới hạn này.

`.github/workflows/check.yml` kiểm tra TypeScript, build, nhập bản sao lưu và phân quyền. `.github/workflows/deploy.yml` chạy các kiểm tra tương tự rồi triển khai khi cập nhật `main`, hoặc khi chạy thủ công trong Actions.

GitHub Actions xác thực bằng Workload Identity Federation, **không cần lưu service account key hoặc Firebase token trong repository/secrets**. Chỉ repository `sanginnova8-hash/so-cham-diem-hang-ngay`, workflow `deploy.yml` trên `main` được dùng tài khoản dịch vụ `github-so-cham-diem@qsangtnl-4226a.iam.gserviceaccount.com`. Tài khoản này được cấp quyền triển khai Hosting/rules, xem Firebase/Firestore và sử dụng API. Các workflow từ PR không có quyền triển khai.

## Dữ liệu và quản trị

Các collection hiện tại được giữ nguyên: `users`, `classes`, `classConfigs`, `students`, `behaviorCategories`, `disciplineLogs`, `periodLocks`. Dữ liệu lớp gắn với `teacherId` bằng Firebase Auth UID. Hồ sơ lớp trưởng có `teacherId` trỏ tới giáo viên của mình. Hiện hỗ trợ một lớp làm việc chính cho mỗi giáo viên; mô hình nhiều trường và nhiều giáo viên đồng quản lý một lớp cần một đợt chuyển đổi riêng.

Quản trị viên đầu tiên được cấp qua Firebase Console/Admin API: tạo hoặc đăng nhập tài khoản Auth, lấy UID và đặt `users/{UID}.role` thành `admin` hoặc `owner`, `isActive` thành `true`. Thao tác này chỉ dành cho người có quyền quản trị Firebase project. Không dùng tên email để tự cấp quyền trong trình duyệt.

Bản sao lưu JSON được nhập theo cách bổ sung: ID học sinh/danh mục/nhật ký được gắn tiền tố UID người nhận, tham chiếu học sinh được đổi tương ứng. Có thể thử lại cùng tệp nếu kết nối gián đoạn; ứng dụng không tự xóa dữ liệu đã có. Dữ liệu project cũ chưa được chuyển sang project mới.

Tra cứu phụ huynh công khai và hệ thống phân cấp v2 chưa được triển khai cho dữ liệu thật. Collection riêng tư không cho khách truy cập; cần xây luồng chia sẻ báo cáo có token và phạm vi riêng trước khi dùng tra cứu công khai. Cách thu hồi tài khoản hiện tại là khóa hồ sơ, giữ lịch sử lớp và UID để không cho tài khoản tự tạo lại hồ sơ nhằm vượt qua khóa.
