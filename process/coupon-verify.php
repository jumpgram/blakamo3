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

function curl_post($url, $post = null){
    $ch = curl_init();
    $post = http_build_query($post);

    curl_setopt($ch, CURLOPT_URL, $url );
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
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
$customer_id = $_POST['customer_id'];

$s_resp = curl_get('https://jump-gram.chargebee.com/api/v2/coupons/' . $coupon_id);
//Check if coupon is error
$coupon_resp = json_decode($s_resp);
if(!isset($coupon_resp->api_error_code)){
    if(!empty($coupon_id)){
        $subs_resp = curl_post('https://jump-gram.chargebee.com/api/v2/customers/'.$customer_id.'/create_subscription_for_items_estimate',array(
            'coupon_ids' => array($coupon_id),
            'subscription_items' => array(
                'item_price_id' => array('Paid-plan-USD-Monthly'), //LIVE
                'quantity' => array(1)
                )
        ));
        //merge $c_resp and $subs_resp
        $subs_resp = json_decode($subs_resp);

        $s_resp = (object) array_merge((array) $coupon_resp, (array) $subs_resp);
        $s_resp = json_encode($s_resp);
    }
}

echo json_encode(json_decode($s_resp));