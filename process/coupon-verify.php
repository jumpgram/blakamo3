<?php 

header('Content-Type: application/json');

// curl get
function curl_get($url){
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url );
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERPWD, 'live_tingsUBvTvCOg4eqI5dEpc2kUFGsE8z2' . ':' . ''); // LIVE
    $headers = array();
    $headers[] = 'Content-Type: application/x-www-form-urlencoded';
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Error:' . curl_error($ch);
    }
    curl_close($ch);
    return $result;
}
$coupon_id = $_POST['coupon_id'];

$s_resp = curl_get('https://jump-gram.chargebee.com/api/v2/coupons/' . $coupon_id);


echo json_encode(json_decode($s_resp));