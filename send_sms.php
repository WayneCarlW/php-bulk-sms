<?php
require_once 'vendor/autoload.php';
require_once 'db.php';

use AfricasTalking\SDK\AfricasTalking;

// Set content type for proper response
header('Content-Type: text/html; charset=UTF-8');

// Load .env
$env = parse_ini_file(__DIR__ . '/.env');
$username = $env['AT_USERNAME'] ?? '';
$apiKey = $env['AT_API_KEY'] ?? '';

// Validate environment variables
if (!$username || !$apiKey) {
    die("❌ Error: Missing API credentials. Please check your .env file.");
}

// Get and validate form data
$recipientsString = $_POST['phone'] ?? '';
$message = $_POST['message'] ?? '';

if (!$recipientsString || !$message) {
    die("❌ Error: Phone numbers and message are required.");
}

// Convert comma-separated string to array and clean up
$recipients = array_filter(array_map('trim', explode(',', $recipientsString)));

if (empty($recipients)) {
    die("❌ Error: No valid phone numbers provided.");
}

// Validate message length
if (strlen($message) > 160) {
    die("❌ Error: Message is too long. Maximum 160 characters allowed.");
}

// Initialize Africa's Talking SDK
try {
    $AT = new AfricasTalking($username, $apiKey);
    $sms = $AT->sms();
} catch (Exception $e) {
    die("❌ Error: Failed to initialize SMS service. " . $e->getMessage());
}

// Send SMS
try {
    $result = $sms->send([
        'to' => $recipients, // Pass array of recipients
        'message' => $message
    ]);

    // Check if we got a valid response
    if (!isset($result['data']->SMSMessageData->Recipients)) {
        die("❌ Error: Invalid response from SMS service.");
    }

    $recipients_data = $result['data']->SMSMessageData->Recipients;
    $total_recipients = count($recipients_data);
    $successful_sends = 0;
    $failed_sends = 0;

    // Process each recipient and log to database
    foreach ($recipients_data as $recipient) {
        $phone = $recipient->number ?? '';
        $status = $recipient->status ?? 'Unknown';
        $messageId = $recipient->messageId ?? null;
        $cost = $recipient->cost ?? null;
        $statusCode = $recipient->statusCode ?? null;

        // Determine if send was successful
        if ($statusCode == 101 || $status == 'Success') {
            $successful_sends++;
        } else {
            $failed_sends++;
        }

        // Log to database
        try {
            $stmt = $pdo->prepare("INSERT INTO messages (phone, message, message_id, status, cost, status_code, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([
                $phone,
                $message,
                $messageId,
                $status,
                $cost,
                $statusCode
            ]);
        } catch (PDOException $e) {
            // Log database error but don't stop execution
            error_log("Database error: " . $e->getMessage());
        }
    }

    // Display success message with statistics
    echo "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; background: #f0f9f0; border: 1px solid #4caf50;'>";
    echo "<h2 style='color: #2e7d32; margin-bottom: 20px;'>✅ SMS Sending Complete!</h2>";
    echo "<div style='background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;'>";
    echo "<h3 style='color: #333; margin-bottom: 10px;'>Summary:</h3>";
    echo "<p><strong>Total Recipients:</strong> {$total_recipients}</p>";
    echo "<p><strong>Successful:</strong> <span style='color: #4caf50;'>{$successful_sends}</span></p>";
    echo "<p><strong>Failed:</strong> <span style='color: #f44336;'>{$failed_sends}</span></p>";
    echo "<p><strong>Message:</strong> " . htmlspecialchars($message) . "</p>";
    echo "</div>";

    // Show detailed results
    echo "<h3 style='color: #333; margin-bottom: 10px;'>Detailed Results:</h3>";
    echo "<div style='background: white; padding: 15px; border-radius: 8px; max-height: 300px; overflow-y: auto;'>";
    
    foreach ($recipients_data as $recipient) {
        $phone = $recipient->number ?? '';
        $status = $recipient->status ?? 'Unknown';
        $statusCode = $recipient->statusCode ?? '';
        $cost = $recipient->cost ?? 'N/A';
        
        $statusColor = ($statusCode == 101 || $status == 'Success') ? '#4caf50' : '#f44336';
        
        echo "<div style='border-bottom: 1px solid #eee; padding: 10px 0;'>";
        echo "<strong>{$phone}</strong> - ";
        echo "<span style='color: {$statusColor};'>{$status}</span>";
        if ($cost !== 'N/A') {
            echo " (Cost: {$cost})";
        }
        echo "</div>";
    }
    
    echo "</div>";
    echo "<div style='margin-top: 20px; text-align: center;'>";
    echo "<a href='index.html' style='background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>← Back to SMS Manager</a>";
    echo "</div>";
    echo "</div>";

} catch (Exception $e) {
    // Log the error
    error_log("SMS Error: " . $e->getMessage());
    
    // Display user-friendly error message
    echo "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; background: #ffebee; border: 1px solid #f44336;'>";
    echo "<h2 style='color: #c62828;'>❌ SMS Sending Failed</h2>";
    echo "<p style='color: #333; margin-bottom: 15px;'>There was an error sending your SMS:</p>";
    echo "<div style='background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #f44336;'>";
    echo "<code style='color: #c62828;'>" . htmlspecialchars($e->getMessage()) . "</code>";
    echo "</div>";
    echo "<div style='margin-top: 20px; text-align: center;'>";
    echo "<a href='index.html' style='background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>← Back to SMS Manager</a>";
    echo "</div>";
    echo "</div>";
}