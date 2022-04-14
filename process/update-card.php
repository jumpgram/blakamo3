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

$delete_payment = curl_post('https://jump-gram.chargebee.com/api/v2/customers/' . $_POST['customer_id'] . '/delete_card', array());

if(!empty($delete_payment)){
    $payment_source = curl_post('https://jump-gram.chargebee.com/api/v2/payment_sources/create_using_token', array(
        'customer_id'=> $_POST['customer_id'],
        'token_id'  => $_POST['gw_token'],
    ));    
}
echo json_encode(json_decode($payment_source));