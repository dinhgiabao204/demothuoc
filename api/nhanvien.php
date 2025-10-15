<?php
require_once __DIR__.'/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method==='GET'){
  $res = $mysqli->query("SELECT * FROM nhanvien ORDER BY manv DESC")->fetch_all(MYSQLI_ASSOC);
  ok($res);
}

if ($method==='POST'){
  $d = body_json();
  $hoten=$d['hoten']??null; $gt=$d['gt']??'Nam'; $ns=$d['ns']??null; $ngayvl=$d['ngayvl']??date('Y-m-d');
  if(!$hoten) fail('Thiếu hoten');
  $stmt=$mysqli->prepare("INSERT INTO nhanvien(hoten,gt,ns,ngayvl) VALUES (?,?,?,?)");
  $stmt->bind_param("ssss",$hoten,$gt,$ns,$ngayvl);
  $stmt->execute();
  ok(['insert_id'=>$mysqli->insert_id],201);
}
