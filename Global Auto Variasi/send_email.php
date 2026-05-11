<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metode request tidak didukung.']);
    exit;
}

$adminEmail = 'globalvrs74@gmail.com';

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');

if (!$name || !$email || !$phone || !$service || !$message) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Semua field harus diisi.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Alamat email tidak valid.']);
    exit;
}

$subject = "Pesan Kontak dari $name";
$body = "Nama: $name\n";
$body .= "Email: $email\n";
$body .= "Telepon: $phone\n";
$body .= "Layanan: $service\n\n";
$body .= "Pesan:\n$message\n";

$headers = "From: Global Auto Variasi <no-reply@globalvrs74@gmail.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($adminEmail, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Pesan berhasil dikirim.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Gagal mengirim email. Periksa konfigurasi server email Anda.']);
}
