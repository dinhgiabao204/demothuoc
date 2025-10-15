<?php
// api/sanpham.php
require_once __DIR__.'/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
  $id = $_GET['id'] ?? null;
  $kw = $_GET['q'] ?? '';
  if ($id) {
    $stmt = $mysqli->prepare("SELECT * FROM sanpham WHERE masp=?");
    $stmt->bind_param("i",$id);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    ok($res ?: []);
  } else {
    if ($kw) {
      $kw = "%$kw%";
      $stmt = $mysqli->prepare("SELECT * FROM sanpham WHERE tensp LIKE ? ORDER BY masp DESC");
      $stmt->bind_param("s",$kw);
      $stmt->execute();
      ok($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
    } else {
      $res = $mysqli->query("SELECT * FROM sanpham ORDER BY masp DESC")->fetch_all(MYSQLI_ASSOC);
      ok($res);
    }
  }
}

if ($method === 'POST') {
  $d = body_json();
  $tensp=$d['tensp']??null; 
  $giaban=$d['giaban']??0; 
  $gianhap=$d['gianhap']??0;
  $hinhanh=$d['hinhanh']??null; 
  $congdung=$d['congdung']??null; 
  $xuatxu=$d['xuatxu']??null;
  $cachdung=$d['cachdung']??null; 
  $madm=$d['madm']??null; 
  $madv=$d['madv']??null;

  if(!$tensp) fail('Thiếu tên sản phẩm');
  $stmt=$mysqli->prepare("INSERT INTO sanpham(tensp,giaban,gianhap,hinhanh,congdung,xuatxu,cachdung,madm,madv) 
  VALUES (?,?,?,?,?,?,?,?,?)");
  $stmt->bind_param("sddssssii",$tensp,$giaban,$gianhap,$hinhanh,$congdung,$xuatxu,$cachdung,$madm,$madv);
  if(!$stmt->execute()) fail($stmt->error,500);
  ok(['insert_id'=>$mysqli->insert_id],201);
}

if ($method === 'PUT') {
  $id = $_GET['id'] ?? null;
  if(!$id) fail('Thiếu id sản phẩm');
  $d = body_json();
  $fields = ['tensp','giaban','gianhap','hinhanh','congdung','xuatxu','cachdung','madm','madv'];
  $set = []; $types=''; $vals=[];
  foreach($fields as $f){
    if(isset($d[$f])){
      $set[]="$f=?";
      $vals[]=$d[$f];
      $types .= in_array($f,['giaban','gianhap'])?'d':(in_array($f,['madm','madv'])?'i':'s');
    }
  }
  if(!$set) fail('Không có gì để cập nhật');
  $types .= 'i'; $vals[]=$id;
  $sql = "UPDATE sanpham SET ".implode(',',$set)." WHERE masp=?";
  $stmt = $mysqli->prepare($sql);
  $stmt->bind_param($types, ...$vals);
  if(!$stmt->execute()) fail($stmt->error,500);
  ok(['affected'=>$stmt->affected_rows]);
}

if ($method === 'DELETE') {
  $id = $_GET['id'] ?? null;
  if(!$id) fail('Thiếu id');
  $stmt=$mysqli->prepare("DELETE FROM sanpham WHERE masp=?");
  $stmt->bind_param("i",$id);
  if(!$stmt->execute()) fail($stmt->error,500);
  ok(['deleted'=>true]);
}
