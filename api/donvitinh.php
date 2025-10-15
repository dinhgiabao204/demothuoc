<?php
require_once __DIR__.'/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method==='GET'){
  $res = $mysqli->query("SELECT * FROM donvitinh ORDER BY madv DESC")->fetch_all(MYSQLI_ASSOC);
  ok($res);
}

if ($method==='POST'){
  $d = body_json();
  $tendv = $d['tendv'] ?? null;
  if(!$tendv) fail('Thiếu tendv');
  $stmt=$mysqli->prepare("INSERT INTO donvitinh(tendv) VALUES (?)");
  $stmt->bind_param("s",$tendv);
  $stmt->execute();
  ok(['insert_id'=>$mysqli->insert_id],201);
}
