<?php
$host = '127.0.0.1';
$port = '5432';
$user = 'postgres';
$pass = 'postgres';

try {
    $pdo = new PDO("pgsql:host=$host;port=$port", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE DATABASE casagest_testing");
    echo "Database created successfully\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'already exists') !== false) {
        echo "Database already exists\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
