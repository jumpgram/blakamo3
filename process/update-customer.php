<?php

header('Content-Type: application/json');


function curl_post($url, $post = null){
    $ch = curl_init();
    $post = http_build_query($post);

    curl_setopt($ch, CURLOPT_URL, $url );
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    curl_setopt($ch, CURLOPT_USERPWD, 'live_tingsUBvTvCOg4eqI5dEpc2kUFGsE8z2' . ':' . '');

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

$customer_id = $_POST['id'];
$action = $_POST['action'];
$post_fields = array();
$c_resp = array();
//get payment source
if($action == 'account'){
    $post_fields = array(
        'first_name' => $_POST['first_name'],
        'last_name' => $_POST['last_name'],
        'email' => $_POST['email'],
        'phone' => $_POST['phone'],
        'cf_instagram_username' => $_POST['instagram_user']
    );
    
    $c_resp = curl_post('https://jump-gram.chargebee.com/api/v2/customers/'. $customer_id, $post_fields);
    curl_post('https://jump-gram.chargebee.com/api/v2/customers/'. $customer_id .'/update_billing_info', array(
        'billing_address'=> array(
            'first_name' => $_POST['first_name'],
            'last_name' => $_POST['last_name'],
            'line1' => $_POST['billing_address_1'],
            'line2' => $_POST['billing_address_2'],
            'city' => $_POST['billing_city'],
            'state' => $_POST['billing_state'],
            'zip' => $_POST['billing_zip'],
            'country' => $_POST['billing_country'],
    )));
}else if($action == 'billing'){
    $post_fields = array(
    'billing_address'=> array(
        'first_name' => $_POST['first_name'],
        'last_name' => $_POST['last_name'],
        'line1' => $_POST['billing_address_1'],
        'line2' => $_POST['billing_address_2'],
        'city' => $_POST['billing_city'],
        'state' => $_POST['billing_state'],
        'zip' => $_POST['billing_zip'],
        'country' => $_POST['billing_country'],
    )
    );
$c_resp = curl_post('https://jump-gram.chargebee.com/api/v2/customers/'. $customer_id .'/update_billing_info', $post_fields);

}

$c_resp = json_decode($c_resp);

if(!empty($c_resp->customer->id)){
    $result = array(
        'status' => 'success',
        'customer_id' => $c_resp->customer->id,
        'billing' => $action
    );
}else{
    $result = array(
        'status' => 'error',
        'message' => $c_resp->message,
    );
}

echo json_encode($result);