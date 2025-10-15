<?php
require_once __DIR__.'/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method==='GET'){
  $res = $mysqli->query("SELECT * FROM danhmuc ORDER BY madm DESC")->fetch_all(MYSQLI_ASSOC);
  ok($res);
}

if ($method==='POST'){
  $d = body_json();
  $tendm = $d['tendm'] ?? null;
  if(!$tendm) fail('Thiếu tendm');
  $stmt=$mysqli->prepare("INSERT INTO danhmuc(tendm) VALUES (?)");
  $stmt->bind_param("s",$tendm);
  $stmt->execute();
  ok(['insert_id'=>$mysqli->insert_id],201);
}

if ($method==='PUT'){
  $id = $_GET['id'] ?? null;
  $d = body_json();
  if(!$id || !isset($d['tendm'])) fail('Thiếu tham số');
  $stmt=$mysqli->prepare("UPDATE danhmuc SET tendm=? WHERE madm=?");
  $stmt->bind_param("si",$d['tendm'],$id);
  $stmt->execute();
  ok(['affected'=>$stmt->affected_rows]);
}

if ($method==='DELETE'){
  $id = $_GET['id'] ?? null;
  if(!$id) fail('Thiếu id');
  $stmt=$mysqli->prepare("DELETE FROM danhmuc WHERE madm=?");
  $stmt->bind_param("i",$id);
  $stmt->execute();
  ok(['deleted'=>true]);
}
