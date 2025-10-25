<?php

namespace App\Services;

use Illuminate\Http\Request;

class VnpayService
{
    protected $vnp_Url;
    protected $vnp_ReturnUrl;
    protected $vnp_TmnCode;
    protected $vnp_HashSecret;

    public function __construct()
    {
        $this->vnp_Url = env('VNPAY_URL');
        $this->vnp_ReturnUrl = env('VNPAY_RETURNURL');
        $this->vnp_TmnCode = env('VNPAY_TMNCODE');
        $this->vnp_HashSecret = env('VNPAY_HASHSECRET');
    }

    /**
     * Hàm chính: Tạo URL thanh toán
     */
    public function createPaymentUrl($order, Request $request)
    {
        // Tạo mảng dữ liệu
        $vnp_TxnRef = $order->id; // Mã đơn hàng. Phải unique
        $vnp_OrderInfo = "Thanh toan don hang #" . $order->id;
        $vnp_OrderType = 'billpayment'; // Loại hàng hóa
        $vnp_Amount = $order->total_amount * 100; // Số tiền (nhân 100)
        $vnp_Locale = 'vn'; // Ngôn ngữ
        $vnp_IpAddr = $request->ip(); // IP Khách
        $vnp_CreateDate = date('YmdHis'); // Thời gian tạo

        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $this->vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => $vnp_CreateDate,
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $this->vnp_ReturnUrl,
            "vnp_TxnRef" => $vnp_TxnRef,
        ];

        // Sắp xếp mảng theo key
        ksort($inputData);
        
        // Tạo chuỗi hash
        $query = "";
        $i = 0;
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $query .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $query .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        // Tạo chữ ký
        $vnp_SecureHash = hash_hmac('sha512', $query, $this->vnp_HashSecret);
        
        // Nối chữ ký vào URL
        $vnp_Url = $this->vnp_Url . "?" . $query . '&vnp_SecureHash=' . $vnp_SecureHash;

        return $vnp_Url; // Trả về URL thanh toán
    }

    /**
     * Hàm xác thực chữ ký khi VnPay gọi về (Callback/IPN)
     */
    public function verifyCallback(Request $request): bool
    {
        $inputData = $request->all();
        $vnp_SecureHash = $inputData['vnp_SecureHash'];
        
        // Xóa vnp_SecureHash ra khỏi mảng
        unset($inputData['vnp_SecureHash']); 
        
        // Sắp xếp
        ksort($inputData);

        // Tạo chuỗi hash
        $i = 0;
        $hashData = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData = $hashData . urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        // Tạo chữ ký
        $mySecureHash = hash_hmac('sha512', $hashData, $this->vnp_HashSecret);

        // So sánh chữ ký
        return $mySecureHash === $vnp_SecureHash;
    }
}