<?php
header('Content-Type: application/json');

// Include the DB connection
require_once 'db.php';

try {
    $stmt = $pdo->query("
        SELECT 
            created_at, 
            COUNT(phone) AS recipients, 
            status, 
            message 
        FROM messages 
        GROUP BY message, created_at, status 
        ORDER BY created_at DESC 
        LIMIT 100
    ");

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $results]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>