<?php 

header('Content-Type: application/json');


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
$customer_id = $_POST['customer_id'];
$coupon_id = isset($_POST['coupon_id']) ? $_POST['coupon_id'] : '';
if(!empty($coupon_id)){
    $s_resp = curl_post('https://jump-gram.chargebee.com/api/v2/customers/' . $customer_id . '/subscription_for_items', array(
        'coupon_ids' => array($coupon_id),
        'subscription_items' => array(
            'item_price_id' => array('Paid-plan-USD-Monthly'), //LIVE
            'quantity' => array(1)
        )
        ));
}else{
    $s_resp = curl_post('https://jump-gram.chargebee.com/api/v2/customers/' . $customer_id . '/subscription_for_items', array(
        'subscription_items' => array(
            'item_price_id' => array('Paid-plan-USD-Monthly'), //LIVE
            'quantity' => array(1)
        )
        ));
}

echo json_encode(json_decode($s_resp));