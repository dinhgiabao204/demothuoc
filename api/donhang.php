<?php
require_once __DIR__.'/db.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method==='GET'){
  $id = $_GET['id'] ?? null;
  if ($id){
    $order = $mysqli->query("SELECT * FROM donhang WHERE sodh=".(int)$id)->fetch_assoc();
    $items = $mysqli->query("SELECT c.*, s.tensp
                             FROM chitietdh c JOIN sanpham s ON c.masp=s.masp
                             WHERE c.sodh=".(int)$id)->fetch_all(MYSQLI_ASSOC);
    ok(['order'=>$order,'items'=>$items]);
  } else {
    $sql = "SELECT d.*, COALESCE(SUM(c.sl*c.gia),0) AS tongtien 
            FROM donhang d LEFT JOIN chitietdh c ON d.sodh=c.sodh 
            GROUP BY d.sodh ORDER BY d.sodh DESC";
    $res = $mysqli->query($sql)->fetch_all(MYSQLI_ASSOC);
    ok($res);
  }
}

if ($method==='POST'){
  $d = body_json();
  $manv = $d['manv'] ?? null;
  $items = $d['items'] ?? []; // [{masp, sl, gia}]
  if(!$manv) fail('Thiếu manv');
  if(!$items || !is_array($items)) fail('Thiếu items');

  $mysqli->begin_transaction();
  try{
    $stmt=$mysqli->prepare("INSERT INTO donhang(manv,giatri) VALUES (?,0)");
    $stmt->bind_param("i",$manv);
    $stmt->execute();
    $sodh = $mysqli->insert_id;

    $sum = 0;
    $stmtItem=$mysqli->prepare("INSERT INTO chitietdh(sodh,masp,sl,gia) VALUES (?,?,?,?)");
    foreach($items as $it){
      $masp = (int)$it['masp']; $sl = (int)$it['sl']; $gia = (float)$it['gia'];
      $sum += $sl*$gia;
      $stmtItem->bind_param("iiid",$sodh,$masp,$sl,$gia);
      $stmtItem->execute();
    }
    $stmtUp=$mysqli->prepare("UPDATE donhang SET giatri=? WHERE sodh=?");
    $stmtUp->bind_param("di",$sum,$sodh);
    $stmtUp->execute();

    $mysqli->commit();
    ok(['sodh'=>$sodh,'giatri'=>$sum],201);
  } catch (Throwable $e){
    $mysqli->rollback();
    fail($e->getMessage(),500);
  }
}
    