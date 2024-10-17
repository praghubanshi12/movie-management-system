<?php

function sendErrorMessage($message = "Something went wrong", $code = 500) {
    http_response_code($code);

    $response = [
        'message' => $message
    ];

    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

function uploadBase64Image($base64String) {
    // Extract the file type and the actual base64 data
    if (preg_match('/^data:image\/(\w+);base64,/', $base64String, $type)) {
        // Get the file type (e.g., png, jpg)
        $type = strtolower($type[1]); // Get the image type
        $validTypes = ['png', 'jpg', 'jpeg', 'jfif'];

        if (in_array($type, $validTypes)) {
            // Remove the base64 prefix
            $base64Data = substr($base64String, strpos($base64String, ',') + 1);

            // Decode the base64 string
            $base64Data = base64_decode($base64Data);

            // Check if decoding was successful
            if ($base64Data === false) {
                die('Base64 decode failed.');
            }
            $date = date_create();
            // Define the file path and name
            $fileName = 'uploads/movie_' . date_timestamp_get($date) . '.' . $type; // Change the path as needed

            // Save the file
            if (file_put_contents($fileName, $base64Data)) {
                $imagePath = $fileName;
            } else {
                // echo "Failed to save the file.";
                $imagePath = 'https://via.placeholder.com/150';
            }
        } else {
            // echo "Invalid file type.";
            $imagePath = 'https://via.placeholder.com/150';
        }
    } else {
        // echo "Invalid base64 string.";
        $imagePath = 'https://via.placeholder.com/150';
    }
    return $imagePath;
}

function imageUrlExists($imageUrl) {
    $headers = @get_headers($imageUrl);
    return $headers && strpos($headers[0], '200');
}