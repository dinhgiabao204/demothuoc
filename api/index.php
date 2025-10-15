<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';

$r = $_GET['r'] ?? '';

switch ($r) {
  case 'sanpham':   require __DIR__ . '/sanpham.php';   break;
  case 'danhmuc':   require __DIR__ . '/danhmuc.php';   break;
  case 'donvitinh': require __DIR__ . '/donvitinh.php'; break;
  case 'nhanvien':  require __DIR__ . '/nhanvien.php';  break;
  case 'donhang':   require __DIR__ . '/donhang.php';   break;

  // Mặc định: nếu không khớp route nào thì báo lỗi
  default:
    http_response_code(404);
    echo json_encode(['error' => 'Unknown route', 'r' => $r], JSON_UNESCAPED_UNICODE);
    exit;
}
