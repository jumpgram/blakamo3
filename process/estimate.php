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

$estimates = curl_post('https://jump-gram.chargebee.com/api/v2/estimates/create_subscription_for_items', array(
    'subscription_items' => array(
        'item_price_id' => array('Paid-plan-USD-Monthly'),
        'quantity' => array(1)
    )
));

echo json_encode(json_decode($estimates));