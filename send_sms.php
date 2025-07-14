<?php
require_once 'vendor/autoload.php';
require_once 'db.php';

use AfricasTalking\SDK\AfricasTalking;

// Load .env
$env = parse_ini_file(__DIR__ . '/.env');
$username   = $env['AT_USERNAME'];
$apiKey     = $env['AT_API_KEY'];
$senderId   = $env['AT_SENDER_ID'];

// Get form data
$recipients = $_POST['phone'] ?? '';
$message    = $_POST['message'] ?? '';

if (!$recipients || !$message) {
    die("❌ Phone and message required.");
}

// Initialize SDK
$AT  = new AfricasTalking($username, $apiKey);
$sms = $AT->sms();

try {
    $result = $sms->send([
        'to'      => $recipients,
        'message' => $message,
        'from'    => $senderId
    ]);

    foreach ($result['data']->SMSMessageData->Recipients as $recipient) {
        $stmt = $pdo->prepare("INSERT INTO messages (phone, message, sender_id, message_id, status, cost, status_code) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $recipient->number,
            $message,
            $senderId,
            $recipient->messageId ?? null,
            $recipient->status ?? null,
            $recipient->cost ?? null,
            $recipient->statusCode ?? null
        ]);
    }

    echo "✅ SMS sent!<br><pre>" . print_r($result, true) . "</pre>";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>