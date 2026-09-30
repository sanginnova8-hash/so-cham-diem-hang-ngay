import { Student, DisciplineLog, ClassConfig, StudentWeeklySummary, StudentMonthlySummary } from '../types';
import { formatVietnameseDate, formatVietnameseNumber } from './utils';

export type TemplateTarget = 'class_group' | 'individual_parent';
export type TemplatePeriod = 'week' | 'month' | 'semester' | 'custom';
export type TemplateCategory = 'weekly' | 'monthly' | 'discipline' | 'honors' | 'individual' | 'custom';

export interface TemplateOptions {
  includeStats: boolean;
  includeHonors: boolean;
  includeViolations: boolean;
  maskViolationNames: boolean; // Nếu true: chỉ hiển thị Mã HS hoặc tên viết tắt để bảo vệ sự riêng tư
  includeTeacherContact: boolean;
  includeNextWeekPlan: boolean;
  includeMiniScoreTable: boolean;
  customNextWeekPlan?: string;
  customTeacherNote?: string;
}

export interface ZaloMessageTemplate {
  id: string;
  title: string;
  description: string;
  target: TemplateTarget;
  period: TemplatePeriod;
  category: TemplateCategory;
  contentTemplate: string;
  defaultOptions: TemplateOptions;
  isCustom?: boolean;
}

export interface SmartTagInfo {
  tag: string;
  label: string;
  description: string;
  category: 'general' | 'stats' | 'lists' | 'student';
}

export const SMART_TAGS: SmartTagInfo[] = [
  // Thông tin chung
  { tag: '{ten_lop}', label: 'Tên lớp', description: 'Ví dụ: 10A8, Điện CN K45', category: 'general' },
  { tag: '{gvcn}', label: 'GVCN', description: 'Họ tên giáo viên chủ nhiệm', category: 'general' },
  { tag: '{sdt_gv}', label: 'SĐT GVCN', description: 'Số điện thoại của giáo viên', category: 'general' },
  { tag: '{ten_truong}', label: 'Tên trường', description: 'Trường học hoặc đơn vị', category: 'general' },
  { tag: '{nien_khoa}', label: 'Niên khóa', description: 'Ví dụ: 2025 - 2026', category: 'general' },
  { tag: '{tuan}', label: 'Số tuần', description: 'Tuần học hiện tại (vd: Tuần 3)', category: 'general' },
  { tag: '{thang}', label: 'Tháng', description: 'Tháng đánh giá (vd: Tháng 9)', category: 'general' },
  { tag: '{ngay_thang}', label: 'Ngày gửi tin', description: 'Ngày tháng hiện tại', category: 'general' },

  // Số liệu tổng hợp cả lớp
  { tag: '{si_so}', label: 'Sĩ số', description: 'Tổng số học sinh trong lớp', category: 'stats' },
  { tag: '{diem_tb_lop}', label: 'Điểm TB lớp', description: 'Điểm rèn luyện trung bình', category: 'stats' },
  { tag: '{so_xuat_sac}', label: 'Số Xuất sắc', description: 'Số học sinh xếp loại Xuất sắc', category: 'stats' },
  { tag: '{so_tot}', label: 'Số Tốt', description: 'Số học sinh xếp loại Tốt', category: 'stats' },
  { tag: '{so_tot_xuat_sac}', label: 'Tốt & Xuất sắc', description: 'Tổng học sinh Tốt + Xuất sắc', category: 'stats' },
  { tag: '{so_kha}', label: 'Số Khá', description: 'Số học sinh xếp loại Khá', category: 'stats' },
  { tag: '{so_trung_binh}', label: 'Số Trung bình', description: 'Số học sinh Trung bình', category: 'stats' },
  { tag: '{so_yeu}', label: 'Số Yếu', description: 'Số học sinh Yếu', category: 'stats' },
  { tag: '{ti_le_tot}', label: 'Tỉ lệ rèn luyện tốt (%)', description: 'Tỉ lệ % học sinh rèn luyện tốt', category: 'stats' },
  { tag: '{tong_luot_loi}', label: 'Tổng lượt vi phạm', description: 'Tổng số lượt vi phạm trong kỳ', category: 'stats' },
  { tag: '{tong_diem_cong}', label: 'Tổng điểm cộng', description: 'Tổng điểm biểu dương thi đua', category: 'stats' },

  // Khối danh sách tự sinh
  { tag: '{danh_sach_khen_thuong}', label: 'Danh sách khen thưởng', description: 'Tuyên dương học sinh điểm cao & việc tốt', category: 'lists' },
  { tag: '{danh_sach_nhac_nho}', label: 'Danh sách cần nhắc nhở', description: 'Học sinh vi phạm nề nếp cần phối hợp', category: 'lists' },
  { tag: '{bang_diem_top_10}', label: 'Bảng Top 10 điểm cao', description: '10 học sinh xuất sắc nhất', category: 'lists' },
  { tag: '{bang_diem_rut_gon}', label: 'Bảng điểm tóm tắt', description: 'Danh sách cả lớp dạng rút gọn', category: 'lists' },
  { tag: '{ke_hoach_tuan_toi}', label: 'Kế hoạch tuần tới', description: 'Dặn dò nhiệm vụ & nề nếp trọng tâm', category: 'lists' },

  // Thẻ cá nhân học sinh (chế độ gửi riêng)
  { tag: '{ho_ten_hs}', label: 'Họ tên HS', description: 'Tên học sinh được gửi', category: 'student' },
  { tag: '{ma_hs}', label: 'Mã HS', description: 'Mã định danh học sinh', category: 'student' },
  { tag: '{diem_hs}', label: 'Điểm rèn luyện', description: 'Điểm của học sinh', category: 'student' },
  { tag: '{xep_loai_hs}', label: 'Xếp loại HS', description: 'Xuất sắc / Tốt / Khá / TB / Yếu', category: 'student' },
  { tag: '{chi_tiet_loi}', label: 'Chi tiết vi phạm', description: 'Ngày vi phạm & nội dung lỗi của HS', category: 'student' },
  { tag: '{chi_tiet_khen_thuong}', label: 'Chi tiết khen thưởng', description: 'Điểm cộng & thành tích việc tốt', category: 'student' },
  { tag: '{loi_nhan_gv}', label: 'Lời dặn dò từ GV', description: 'Động viên, nhắc nhở riêng của GVCN', category: 'student' },
  { tag: '{sdt_phu_huynh}', label: 'SĐT Phụ huynh', description: 'Số điện thoại của gia đình', category: 'student' },
  { tag: '{ma_tra_cuu}', label: 'Mã tra cứu phụ huynh', description: 'Mã token bí mật để phụ huynh tự tra cứu', category: 'student' },
  { tag: '{link_tra_cuu}', label: 'Link tra cứu 1-chạm', description: 'Đường dẫn tra cứu kết quả rèn luyện trực tuyến', category: 'student' },
];

export const DEFAULT_ZALO_TEMPLATES: ZaloMessageTemplate[] = [
  // 1. Mẫu Tuần - Gửi Nhóm Zalo Lớp
  {
    id: 'weekly_class_group',
    title: 'Báo cáo nề nếp & điểm thi đua Tuần (Gửi nhóm Zalo lớp)',
    description: 'Báo cáo tuần toàn diện, lịch sự: thống kê điểm trung bình, tuyên dương việc tốt, nhắc nhở vi phạm và kế hoạch tuần mới.',
    target: 'class_group',
    period: 'week',
    category: 'weekly',
    defaultOptions: {
      includeStats: true,
      includeHonors: true,
      includeViolations: true,
      maskViolationNames: false,
      includeTeacherContact: true,
      includeNextWeekPlan: true,
      includeMiniScoreTable: false,
      customNextWeekPlan: 'Nhiệm vụ tuần tới: Toàn lớp chấp hành nghiêm chỉnh đồng phục, mang phù hiệu, tác phong đúng quy định; đi học đúng giờ; bảo quản tốt trang thiết bị xưởng thực hành và phòng học; tích cực xung kích trong các hoạt động phong trào.',
    },
    contentTemplate: `KÍNH GỬI QUÝ PHỤ HUYNH LỚP {ten_lop} - {ten_truong}
Thông báo tổng kết rèn luyện nề nếp & thi đua Tuần {tuan} (Tháng {thang})
--------------------------------------------

Kính thưa Quý Phụ huynh,
Giáo viên chủ nhiệm xin gửi tới Quý phụ huynh tình hình học tập và rèn luyện nề nếp của các em học sinh lớp {ten_lop} trong Tuần {tuan} vừa qua:

SỐ LIỆU TỔNG QUAN NỀ NẾP TUẦN:
• Sĩ số lớp: {si_so} học sinh
• Điểm rèn luyện trung bình cả lớp: {diem_tb_lop} / 10.0 điểm
• Học sinh rèn luyện Xuất sắc & Tốt: {so_tot_xuat_sac} em ({ti_le_tot}%)
• Số học sinh cần cố gắng: {so_trung_binh} em Trung bình, {so_yeu} em Yếu
• Tổng số lượt ghi nhận vi phạm nề nếp: {tong_luot_loi} lượt

DANH SÁCH BIỂU DƯƠNG - KHEN THƯỞNG:
{danh_sach_khen_thuong}

DANH SÁCH CẦN LƯU Ý & PHỐI HỢP NHẮC NHỞ:
{danh_sach_nhac_nho}

KẾ HOẠCH & DẶN DÒ TRỌNG TÂM TUẦN TỚI:
{ke_hoach_tuan_toi}

Kính mong Quý Phụ huynh luôn đồng hành, thường xuyên đôn đốc các em giữ vững nề nếp tác phong chuẩn mực. Kính chúc Quý gia đình một tuần mới an vui và mạnh khỏe!

Trân trọng,
GVCN: {gvcn} • Lớp {ten_lop}
Hotline liên hệ: {sdt_gv}`,
  },

  // 2. Mẫu Tháng - Gửi Nhóm Zalo Lớp
  {
    id: 'monthly_class_group',
    title: 'Tổng kết điểm rèn luyện & xếp loại Tháng (Gửi nhóm Zalo)',
    description: 'Báo cáo tổng kết tháng kèm kết quả xếp loại thi đua, vinh danh học sinh tiêu biểu và định hướng tháng tiếp theo.',
    target: 'class_group',
    period: 'month',
    category: 'monthly',
    defaultOptions: {
      includeStats: true,
      includeHonors: true,
      includeViolations: true,
      maskViolationNames: false,
      includeTeacherContact: true,
      includeNextWeekPlan: true,
      includeMiniScoreTable: true,
      customNextWeekPlan: 'Nhiệm vụ tháng mới: Tiếp tục đẩy mạnh phong trào thi đua dạy tốt - học tốt; tăng cường rèn luyện kỷ luật, chấp hành tuyệt đối an toàn giao thông và quy chế nhà trường.',
    },
    contentTemplate: `THÔNG BÁO TỔNG KẾT RÈN LUYỆN THÁNG {thang}
Lớp {ten_lop} • Năm học {nien_khoa}
Trường: {ten_truong}
--------------------------------------------

Kính gửi Quý Phụ huynh lớp {ten_lop},
Thầy/Cô {gvcn} xin thông báo kết quả đánh giá điểm rèn luyện và xếp loại thi đua tháng {thang} của tập thể lớp như sau:

KẾT QUẢ XẾP LOẠI TOÀN DIỆN THÁNG {thang}:
• Tổng số học sinh: {si_so} em
• Điểm trung bình cả tháng: {diem_tb_lop} điểm
• Xếp loại Xuất sắc: {so_xuat_sac} em
• Xếp loại Tốt: {so_tot} em
• Xếp loại Khá: {so_kha} em
• Xếp loại Trung bình: {so_trung_binh} em
• Xếp loại Yếu: {so_yeu} em

VINH DANH HỌC SINH TIÊU BIỂU THÁNG {thang}:
{danh_sach_khen_thuong}

MỘT SỐ NỘI DUNG NỀ NẾP CẦN GIA ĐÌNH CÙNG LƯU TÂM:
{danh_sach_nhac_nho}

ĐỊNH HƯỚNG THÁNG TIẾP THEO:
{ke_hoach_tuan_toi}

Chân thành cảm ơn sự phối hợp nhiệt tình, trách nhiệm của Quý Phụ huynh trong suốt tháng qua!

Trân trọng thông báo,
GVCN: {gvcn} • SĐT: {sdt_gv}`,
  },

  // 3. Mẫu Tin Nhắn Cá Nhân - Gửi Riêng Từng Phụ Huynh (1-on-1)
  {
    id: 'individual_parent_report',
    title: 'Báo cáo điểm rèn luyện cá nhân học sinh (Gửi riêng phụ huynh)',
    description: 'Tin nhắn riêng tư, ấm áp, trang trọng gửi đến từng phụ huynh về điểm số, chi tiết lỗi/điểm cộng và lời khuyên cụ thể.',
    target: 'individual_parent',
    period: 'week',
    category: 'individual',
    defaultOptions: {
      includeStats: false,
      includeHonors: true,
      includeViolations: true,
      maskViolationNames: false,
      includeTeacherContact: true,
      includeNextWeekPlan: false,
      includeMiniScoreTable: false,
    },
    contentTemplate: `Kính gửi Quý phụ huynh học sinh {ho_ten_hs},

Thầy/Cô {gvcn} - GVCN lớp {ten_lop}, {ten_truong} xin trân trọng thông báo kết quả rèn luyện nề nếp của em trong Tuần {tuan} (Tháng {thang}):

THÔNG TIN RÈN LUYỆN:
• Học sinh: {ho_ten_hs} (Mã HS: {ma_hs})
• Điểm rèn luyện đạt được: {diem_hs} / 10.0 điểm
• Xếp loại thi đua: {xep_loai_hs}

CHI TIẾT ĐIỂM CỘNG & KHEN THƯỞNG:
{chi_tiet_khen_thuong}

NỘI DUNG CẦN LƯU Ý / ĐIỂM TRỪ:
{chi_tiet_loi}

LỜI NHẮN TỪ GIÁO VIÊN CHỦ NHIỆM:
{loi_nhan_gv}

Kính mong Quý gia đình tiếp tục đồng hành, động viên và nhắc nhở em duy trì tốt nề nếp học tập. Nếu gia đình cần trao đổi thêm thông tin, xin vui lòng liên hệ trực tiếp với GVCN.

Trân trọng cảm ơn Quý phụ huynh!
GVCN: {gvcn} • SĐT: {sdt_gv}`,
  },

  // 4. Mẫu Trường Nghề & Kỷ Luật Quân Sự (CĐ Nghề 01 - BQP)
  {
    id: 'vocational_discipline_military',
    title: 'Đôn đốc kỷ luật, tác phong xưởng nghề & chuyên cần (CĐ Nghề 01 - BQP)',
    description: 'Nhấn mạnh nề nếp quân sự, an toàn vệ sinh lao động thực hành xưởng, tác phong giờ giấc và chuyên cần trường nghề.',
    target: 'class_group',
    period: 'week',
    category: 'discipline',
    defaultOptions: {
      includeStats: true,
      includeHonors: true,
      includeViolations: true,
      maskViolationNames: false,
      includeTeacherContact: true,
      includeNextWeekPlan: true,
      includeMiniScoreTable: false,
      customNextWeekPlan: 'Yêu cầu 100% học viên: 1. Có mặt tại giảng đường/xưởng thực hành trước 15 phút để chuẩn bị nề nếp; 2. Mang đầy đủ trang phục bảo hộ lao động theo đúng chuyên ngành; 3. Thực hiện nghiêm túc chế độ bảo quản, bàn giao trang thiết bị kỹ thuật; 4. Nghiêm cấm hút thuốc lá, sử dụng điện thoại sai quy định.',
    },
    contentTemplate: `THÔNG BÁO QUẢN LÝ NỀ NẾP & KỶ LUẬT QUÂN SỰ - CHUYÊN MÔN
Lớp: {ten_lop} • Trường: {ten_truong}
Tuần huấn luyện & học tập số: {tuan} (Tháng {thang})
--------------------------------------------

Kính gửi Quý Phụ huynh và các đồng chí học viên lớp {ten_lop},
Nhằm duy trì nghiêm kỷ luật quân đội và an toàn thực hành nghề, Ban chủ nhiệm xin thông báo tình hình rèn luyện nề nếp Tuần {tuan}:

SỐ LIỆU NỀ NẾP CHUYÊN CẦN:
• Quân số lớp: {si_so} học viên
• Điểm rèn luyện bình quân: {diem_tb_lop} điểm
• Số học viên đạt tiêu chuẩn rèn luyện Tốt & Xuất sắc: {so_tot_xuat_sac} đồng chí ({ti_le_tot}%)
• Số lượt nhắc nhở về tác phong/giờ giấc: {tong_luot_loi} lượt

BIỂU DƯƠNG HỌC VIÊN CÓ Ý THỨC NỀ NẾP CAO:
{danh_sach_khen_thuong}

CÁC TRƯỜNG HỢP CẦN CHẤN CHỈNH KỶ LUẬT & NỘI VỤ:
{danh_sach_nhac_nho}

QUY ĐỊNH TRỌNG TÂM TUẦN TIẾP THEO:
{ke_hoach_tuan_toi}

Đề nghị Quý gia đình nắm bắt, phối hợp chặt chẽ cùng Nhà trường quản lý giờ giấc, nhắc nhở con em mình rèn luyện bản lĩnh, tác phong người lính - người thợ tay nghề cao.

Chỉ huy / GVCN: {gvcn}
Điện thoại liên hệ: {sdt_gv}`,
  },

  // 5. Mẫu Bảng Vàng Vinh Danh - Top Học Sinh Tiêu Biểu
  {
    id: 'honors_top_students',
    title: 'Bảng vàng vinh danh Top học sinh rèn luyện tiêu biểu',
    description: 'Mẫu tin nhắn chúc mừng, vinh danh các cá nhân có điểm rèn luyện xuất sắc nhất tuần hoặc tháng, tạo động lực thi đua.',
    target: 'class_group',
    period: 'week',
    category: 'honors',
    defaultOptions: {
      includeStats: true,
      includeHonors: true,
      includeViolations: false,
      maskViolationNames: false,
      includeTeacherContact: true,
      includeNextWeekPlan: false,
      includeMiniScoreTable: false,
    },
    contentTemplate: `BẢNG VÀNG TUYÊN DƯƠNG HỌC SINH TIÊU BIỂU TUẦN {tuan}
Lớp {ten_lop} • {ten_truong}
--------------------------------------------

Thầy/Cô chủ nhiệm trân trọng chúc mừng các em học sinh có thành tích rèn luyện đạo đức, tác phong và ý thức thi đua xuất sắc nhất trong Tuần {tuan} vừa qua:

DANH SÁCH HỌC SINH XUẤT SẮC ĐẠT ĐIỂM CAO & ĐƯỢC KHEN THƯỞNG:
{bang_diem_top_10}

Tuyên dương các việc tốt và tinh thần tự giác tiêu biểu:
{danh_sach_khen_thuong}

Thầy/Cô và tập thể lớp nhiệt liệt biểu dương tinh thần phấn đấu gương mẫu của các em! Mong rằng tuần tới toàn lớp sẽ có thêm thật nhiều bạn ghi tên vào Bảng Vàng rèn luyện!

Trân trọng chúc mừng các em và Quý gia đình!
GVCN: {gvcn} • Lớp {ten_lop}`,
  },

  // 6. Mẫu Nhắc Nhở Khẩn Chuyên Cần & Đi Học Muộn
  {
    id: 'urgent_attendance_alert',
    title: 'Nhắc nhở khẩn: Chuyên cần, đi học muộn & vi phạm nề nếp',
    description: 'Mẫu thông báo tập trung chấn chỉnh tình trạng đi học muộn, vắng tiết, trang phục không chuẩn mực.',
    target: 'class_group',
    period: 'week',
    category: 'discipline',
    defaultOptions: {
      includeStats: true,
      includeHonors: false,
      includeViolations: true,
      maskViolationNames: false,
      includeTeacherContact: true,
      includeNextWeekPlan: true,
      includeMiniScoreTable: false,
      customNextWeekPlan: 'Kể từ đầu tuần tới, Ban cán sự lớp phối hợp Sao đỏ và Đoàn trường kiểm tra gắt gao tại cổng trường và cửa lớp: 1. Có mặt trước 7h00 sáng; 2. Trang phục sơ vin, thẻ học sinh/phù hiệu đầy đủ; 3. Trường hợp ốm đau gia đình phải gọi điện xin phép GVCN trước giờ truy bài.',
    },
    contentTemplate: `THÔNG BÁO QUAN TRỌNG VỀ NỀ NẾP & CHUYÊN CẦN
Lớp {ten_lop} • Tuần {tuan} (Tháng {thang})
--------------------------------------------

Kính gửi Quý Phụ huynh lớp {ten_lop},
Trong tuần vừa qua, qua theo dõi và sổ ghi nhận thi đua, lớp chúng ta vẫn còn một số vi phạm về giờ giấc và nề nếp tác phong cần chấn chỉnh gấp:

DANH SÁCH CÁC HỌC SINH CẦN GIA ĐÌNH ĐÔN ĐỐC NGAY:
{danh_sach_nhac_nho}

QUY ĐỊNH BẮT BUỘC ĐỐI VỚI HỌC SINH TỪ TUẦN TỚI:
{ke_hoach_tuan_toi}

Kính đề nghị Quý Phụ huynh hỗ trợ quản lý giờ giấc đi học của con em, tránh để các lỗi lặp lại làm ảnh hưởng đến thi đua chung và kết quả rèn luyện cuối kỳ của các em.

Xin trân trọng cảm ơn!
GVCN: {gvcn} • SĐT: {sdt_gv}`,
  },
];

const LOCAL_STORAGE_CUSTOM_TEMPLATES_KEY = 'so_cham_diem_custom_zalo_templates_v1';

export function getStoredCustomTemplates(): ZaloMessageTemplate[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOM_TEMPLATES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading custom templates:', e);
    return [];
  }
}

export function saveStoredCustomTemplates(templates: ZaloMessageTemplate[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Error saving custom templates:', e);
  }
}

/**
 * Resolves all smart tags into actual text based on current context
 */
export function resolveTemplateTags(params: {
  templateText: string;
  options: TemplateOptions;
  classConfig: ClassConfig;
  students: Student[];
  disciplineLogs: DisciplineLog[];
  weeklySummaries?: StudentWeeklySummary[];
  monthlySummaries?: StudentMonthlySummary[];
  selectedWeek: number;
  selectedMonth: number;
  periodMode: 'week' | 'month';
  selectedStudent?: Student | null;
}): string {
  const {
    templateText,
    options,
    classConfig,
    students,
    disciplineLogs,
    weeklySummaries = [],
    monthlySummaries = [],
    selectedWeek,
    selectedMonth,
    periodMode,
    selectedStudent,
  } = params;

  // Active student list
  const activeStudents = students.filter((s) => s.status === 'active');
  const totalCount = activeStudents.length || students.length;

  // Summaries based on period
  const currentSummaries = periodMode === 'week' ? weeklySummaries : monthlySummaries;

  // Compute stats
  const scores = currentSummaries.map((s) => s.finalScore);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 10;

  const xuatSacCount = currentSummaries.filter((s) => s.rank === 'Xuất sắc').length;
  const totCount = currentSummaries.filter((s) => s.rank === 'Tốt').length;
  const khaCount = currentSummaries.filter((s) => s.rank === 'Khá').length;
  const trungBinhCount = currentSummaries.filter((s) => s.rank === 'Trung bình').length;
  const yeuCount = currentSummaries.filter((s) => s.rank === 'Yếu').length;

  const totXuatSacCount = xuatSacCount + totCount;
  const tiLeTot = totalCount > 0 ? Math.round((totXuatSacCount / totalCount) * 100) : 0;

  const totalViolations = currentSummaries.reduce((acc, curr) => acc + (curr.violationCount || 0), 0);
  const totalBonus = currentSummaries.reduce((acc, curr) => acc + (curr.totalBonus || 0), 0);

  // Period-specific logs
  const periodLogs = disciplineLogs.filter((l) => {
    if (periodMode === 'week') {
      return l.weekNumber === selectedWeek;
    }
    return l.month === selectedMonth;
  });

  // 1. Generate Danh Sách Khen Thưởng ({danh_sach_khen_thuong})
  let danhSachKhenThuongText = '';
  if (!options.includeHonors) {
    danhSachKhenThuongText = '(Không bao gồm danh sách khen thưởng theo tùy chọn)';
  } else {
    // Filter students with score >= 9.0 or with bonus points
    const topStudents = [...currentSummaries]
      .filter((s) => s.finalScore >= 9.0 || (s.totalBonus && s.totalBonus > 0) || (s.bonusCount && s.bonusCount > 0))
      .sort((a, b) => b.finalScore - a.finalScore || (b.totalBonus || 0) - (a.totalBonus || 0));

    if (topStudents.length === 0) {
      danhSachKhenThuongText = 'Tuần này cả lớp duy trì rèn luyện ổn định, chưa có cá nhân đạt điểm đột phá.';
    } else {
      const lines: string[] = [];
      topStudents.slice(0, 15).forEach((item, index) => {
        const bonusDesc = item.achievements && item.achievements.length > 0 ? ` (${item.achievements.join(', ')})` : '';
        const bonusPoint = item.totalBonus && item.totalBonus > 0 ? ` [Điểm thưởng: +${formatVietnameseNumber(item.totalBonus)}đ]` : '';
        lines.push(`${index + 1}. ${item.fullName} - ${formatVietnameseNumber(item.finalScore)}đ (${item.rank})${bonusPoint}${bonusDesc}`);
      });
      if (topStudents.length > 15) {
        lines.push(`... cùng ${topStudents.length - 15} em học sinh khác có ý thức rèn luyện rất tốt.`);
      }
      danhSachKhenThuongText = lines.join('\n');
    }
  }

  // 2. Generate Danh Sách Nhắc Nhở Vi Phạm ({danh_sach_nhac_nho})
  let danhSachNhacNhoText = '';
  if (!options.includeViolations) {
    danhSachNhacNhoText = '(Không bao gồm danh sách nhắc nhở theo tùy chọn)';
  } else {
    const studentsWithViolations = [...currentSummaries]
      .filter((s) => s.totalDeduct > 0 || (s.violationCount && s.violationCount > 0) || s.finalScore < 8.0)
      .sort((a, b) => (b.totalDeduct || 0) - (a.totalDeduct || 0) || a.finalScore - b.finalScore);

    if (studentsWithViolations.length === 0) {
      danhSachNhacNhoText = 'Tập thể lớp chấp hành xuất sắc mọi quy định, không có học sinh vi phạm nề nếp!';
    } else {
      const lines: string[] = [];
      studentsWithViolations.forEach((item, index) => {
        // Collect specific error details
        const studentLogs = periodLogs.filter((l) => l.studentId === item.studentId && l.type === 'deduct');
        const errorSummaries = studentLogs.map((l) => `${l.behaviorDescription} (-${formatVietnameseNumber(l.totalScore)}đ)`).slice(0, 3);
        const errorText = errorSummaries.length > 0 ? `: ${errorSummaries.join(', ')}` : '';

        // Check if masked
        let displayName = item.fullName;
        if (options.maskViolationNames) {
          // Masking: "Nguyễn V. A. (Mã: 250101)"
          const parts = item.fullName.split(' ');
          if (parts.length > 2) {
            displayName = `${parts[0]} ${parts.slice(1, -1).map(p => p[0] + '.').join(' ')} ${parts[parts.length - 1]} (Mã: ${item.studentCode})`;
          } else {
            displayName = `${item.fullName} (Mã: ${item.studentCode})`;
          }
        }

        lines.push(`• ${index + 1}. ${displayName} (Điểm: ${formatVietnameseNumber(item.finalScore)}đ, Trừ: -${formatVietnameseNumber(item.totalDeduct)}đ)${errorText}`);
      });
      danhSachNhacNhoText = lines.join('\n');
    }
  }

  // 3. Generate Top 10 Bảng Điểm ({bang_diem_top_10})
  const top10List = [...currentSummaries]
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 10);
  const bangDiemTop10Text = top10List
    .map((s, idx) => `${idx + 1}. ${s.fullName} (${s.studentCode}): ${formatVietnameseNumber(s.finalScore)}đ - ${s.rank}`)
    .join('\n');

  // 4. Generate Bảng Điểm Rút Gọn Cả Lớp ({bang_diem_rut_gon})
  const bangDiemRutGonText = [...currentSummaries]
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'))
    .map((s, idx) => `${idx + 1}. ${s.fullName}: ${formatVietnameseNumber(s.finalScore)}đ [${s.rank}]`)
    .join('\n');

  // 5. Generate Kế hoạch tuần tới ({ke_hoach_tuan_toi})
  const keHoachTuanToiText = options.customNextWeekPlan?.trim() || options.customTeacherNote?.trim() || classConfig.defaultTeacherNote?.trim() ||
    'Duy trì nghiêm nề nếp chuyên cần, đồng phục, chuẩn bị bài chu đáo trước khi tới trường, thực hiện tốt nội quy lớp học.';

  // 6. Individual Student Specific Tags
  let studentFullName = '';
  let studentCode = '';
  let studentScore = '';
  let studentRank = '';
  let studentViolationsDetail = '';
  let studentBonusDetail = '';
  let studentTeacherAdvice = '';
  let studentParentPhone = '';

  if (selectedStudent) {
    studentFullName = selectedStudent.fullName;
    studentCode = selectedStudent.studentCode;
    studentParentPhone = selectedStudent.parentPhone || 'Chưa cập nhật';

    const studSummary = currentSummaries.find((s) => s.studentId === selectedStudent.id);
    if (studSummary) {
      studentScore = formatVietnameseNumber(studSummary.finalScore);
      studentRank = studSummary.rank;
    } else {
      studentScore = '10.0';
      studentRank = 'Xuất sắc';
    }

    const studLogs = periodLogs.filter((l) => l.studentId === selectedStudent.id);
    const studViolations = studLogs.filter((l) => l.type === 'deduct');
    const studBonuses = studLogs.filter((l) => l.type === 'bonus');

    if (studViolations.length > 0) {
      studentViolationsDetail = studViolations
        .map((v) => `• ${formatVietnameseDate(v.date)}: ${v.behaviorDescription} (-${formatVietnameseNumber(v.totalScore)}đ)`)
        .join('\n');
    } else {
      studentViolationsDetail = 'Em không có bất kỳ vi phạm nào trong suốt thời gian qua (Đạt chuẩn 100%).';
    }

    if (studBonuses.length > 0) {
      studentBonusDetail = studBonuses
        .map((b) => `• ${formatVietnameseDate(b.date)}: ${b.behaviorDescription} (+${formatVietnameseNumber(b.totalScore)}đ)`)
        .join('\n');
    } else {
      studentBonusDetail = 'Chưa có ghi nhận điểm cộng thi đua.';
    }

    // Personalized teacher advice
    if (options.customTeacherNote?.trim()) {
      studentTeacherAdvice = options.customTeacherNote.trim();
    } else if (studSummary) {
      if (studSummary.totalDeduct === 0 && studSummary.totalBonus > 0) {
        studentTeacherAdvice = `Em ${selectedStudent.firstName} có ý thức rèn luyện rất tích cực, chủ động và gương mẫu. Thầy/Cô rất khen ngợi tinh thần của em và mong gia đình tiếp tục khích lệ con!`;
      } else if (studSummary.totalDeduct === 0) {
        studentTeacherAdvice = `Em ${selectedStudent.firstName} duy trì nề nếp ổn định, nghiêm túc chấp hành tốt mọi nội quy trường lớp. Kính chúc gia đình và em luôn nhiều sức khỏe, niềm vui!`;
      } else if (studSummary.finalScore >= 8.0) {
        studentTeacherAdvice = `Về cơ bản em ${selectedStudent.firstName} ngoan và có ý thức tốt. Gia đình lưu ý nhắc nhở thêm em chú ý một số lỗi nhỏ nêu trên để tuần tới em đạt kết quả rèn luyện xuất sắc hơn.`;
      } else {
        studentTeacherAdvice = `Thầy/Cô kính nhờ Quý Phụ huynh cùng đồng hành, sát sao nhắc nhở và đôn đốc em ${selectedStudent.firstName} khắc phục dứt điểm các lỗi vi phạm nêu trên để kịp thời tiến bộ trong tuần tới.`;
      }
    }
  }

  // Current Date string formatted in Vietnamese
  const today = new Date();
  const dateString = `Thứ ${today.getDay() === 0 ? 'Chủ Nhật' : today.getDay() + 1}, ngày ${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  // Replace map
  const replacements: Record<string, string> = {
    '{ten_lop}': classConfig.className || '10A8',
    '{gvcn}': classConfig.homeroomTeacher || 'Giáo viên chủ nhiệm',
    '{sdt_gv}': classConfig.teacherPhone || 'Chưa cập nhật SĐT',
    '{ten_truong}': classConfig.schoolName || 'Trường Cao đẳng nghề 01 - BQP',
    '{nien_khoa}': classConfig.schoolYear || '2025 - 2026',
    '{tuan}': String(selectedWeek),
    '{thang}': String(selectedMonth),
    '{ngay_thang}': dateString,

    '{si_so}': String(totalCount),
    '{diem_tb_lop}': formatVietnameseNumber(Math.round(avgScore * 10) / 10),
    '{so_xuat_sac}': String(xuatSacCount),
    '{so_tot}': String(totCount),
    '{so_tot_xuat_sac}': String(totXuatSacCount),
    '{so_kha}': String(khaCount),
    '{so_trung_binh}': String(trungBinhCount),
    '{so_yeu}': String(yeuCount),
    '{ti_le_tot}': String(tiLeTot),
    '{tong_luot_loi}': String(totalViolations),
    '{tong_diem_cong}': formatVietnameseNumber(totalBonus),

    '{danh_sach_khen_thuong}': danhSachKhenThuongText,
    '{danh_sach_nhac_nho}': danhSachNhacNhoText,
    '{bang_diem_top_10}': bangDiemTop10Text,
    '{bang_diem_rut_gon}': bangDiemRutGonText,
    '{ke_hoach_tuan_toi}': keHoachTuanToiText,

    '{ho_ten_hs}': studentFullName,
    '{ma_hs}': studentCode,
    '{diem_hs}': studentScore,
    '{xep_loai_hs}': studentRank,
    '{chi_tiet_loi}': studentViolationsDetail,
    '{chi_tiet_khen_thuong}': studentBonusDetail,
    '{loi_nhan_gv}': studentTeacherAdvice,
    '{sdt_phu_huynh}': studentParentPhone,
    '{ma_tra_cuu}': selectedStudent?.parentLookupToken || selectedStudent?.studentCode || 'Chưa cấp',
    '{link_tra_cuu}': typeof window !== 'undefined'
      ? `${window.location.origin}/?token=${selectedStudent?.parentLookupToken || selectedStudent?.studentCode || ''}`
      : `/?token=${selectedStudent?.parentLookupToken || selectedStudent?.studentCode || ''}`,
  };

  let result = templateText;
  Object.keys(replacements).forEach((tag) => {
    // Replace all instances of tag
    result = result.split(tag).join(replacements[tag]);
  });

  return result;
}
