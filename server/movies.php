<?php 
require 'config.php';
require 'helpers/helper.php';

$filename = 'data/movies_db.csv';
$serverBaseUrl = "http://localhost:8000";
$maxSize = 2 * 1024 * 1000; // 2MB
$allowedExtensions = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'jfif'];

function validateBase64Image($base64String) {
    // Check if the string is a valid base64
    if (preg_match('/^data:image\/(?<extension>.+);base64,(?<data>.+)$/', $base64String, $matches)) {
        $extension = strtolower($matches['extension']);
        $data = $matches['data'];

        // Validate the extension
        if (!in_array($extension, $allowedExtensions)) {
            return ["valid" => false, "message" => "Invalid image extension"];
        }

        // Decode the base64 data
        $imageData = base64_decode($data);
        if ($imageData === false) {
            return ["valid" => false, "message" => "Base64 decoding failed."];
        }

        // Check the size
        $imageSize = strlen($imageData);
        if ($imageSize > $maxSize) {
            return ["valid" => false, "message" => "Image size exceeds maximum limit."];
        }

        return ["valid" => true, "message" => "Image is valid"];
    } else {
        return ["valid" => false, "message" => "Invalid base64 image."];
    }
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        removeEmptyLinesExceptLast($filename);
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 15;
        $offset = ($page - 1) * $limit;
        
        $data = [];
        
        if (($handle = fopen($filename, 'r')) !== FALSE) {
            $lineNumber = 2;
            // Get the header row
            $header = fgetcsv($handle);
            
            // Read the data rows
            while (($row = fgetcsv($handle)) !== FALSE) {
                // Convert header keys to camel case
                $camelCaseHeader = array_map('toCamelCase', $header);
                if (!filter_var($row[3], FILTER_VALIDATE_URL)) {
                    $row[3] = $serverBaseUrl . "/" . $row[3];
                }

                array_unshift($camelCaseHeader, 'id');
                array_unshift($row, $lineNumber);
                $data[] = array_combine($camelCaseHeader, $row);
                $lineNumber++;
            }
            fclose($handle);
        } else {
            sendErrorMessage("Error loading file in server.");
        }
        
        $data = array_reverse($data);
        
        $response = [
            'data' => array_slice($data, $offset, $limit),
            'page' => $page,
            'limit' => $limit,
            'has_more' => count(array_slice($data, $offset, $limit)) === $limit
        ];
        
        echo json_encode($response);
        break;

    case 'POST':
        $jsonData = file_get_contents('php://input');
        $data = json_decode($jsonData, true);
        $imagePath = "";

        if(strlen($data["movie_name"]) < 2 || strlen($data["movie_name"]) > 255) {
            sendErrorMessage("Movie Name must be between 2 to 255 characters", 400);
        }

        if(strlen($data["genre"]) < 2 || strlen($data["genre"]) > 255) {
            sendErrorMessage("Genre must be between 2 to 255 characters", 400);
        }

        if($data["year_of_release"] < 1000 || $data["year_of_release"] > 2100) {
            sendErrorMessage("Year of Release must be between 1000 and 2100", 400);
        }

        if($data["image"]) {
            $validateImageResponse = validateBase64Image($data["image"]);
            if($validateImageResponse->valid) {
                $imagePath = uploadBase64Image($data["image"]);
                $data['link_to_movie_image'] = $serverBaseUrl . "/" . $imagePath;
            } else {
                sendErrorMessage($validateImageResponse->message, 400);
            }
        } else {
            $imagePath = 'https://via.placeholder.com/150';
        }

        $newData = [$data['movie_name'], $data['genre'], $data['year_of_release'], $imagePath];

        if (($handle = fopen($filename, 'a')) !== false) {
            $csvLine = implode(',', $newData) . "\n";
            fwrite($handle, $csvLine);
            fclose($handle);
            echo json_encode([
                'message' => 'New Movie added successfully',
                'data' => $data
            ]);
        } else {
            sendErrorMessage("Error loading file in server.");
        }
        
        break;

    case 'PUT':
        if(count(explode('/', $_SERVER['REQUEST_URI'])) != 3) {
            sendErrorMessage("Bad Request", 400);
            return;
        }
        $lineToUpdate = explode('/', $_SERVER['REQUEST_URI'])[2];
        $jsonData = file_get_contents('php://input');
        $requestBodyData = json_decode($jsonData, true);

        if(strlen($requestBodyData["movie_name"]) < 2 || strlen($requestBodyData["movie_name"]) > 255) {
            sendErrorMessage("Movie Name must be between 2 to 255 characters", 400);
        }

        if(strlen($requestBodyData["genre"]) < 2 || strlen($requestBodyData["genre"]) > 255) {
            sendErrorMessage("Genre must be between 2 to 255 characters", 400);
        }

        if($requestBodyData["year_of_release"] < 1000 || $requestBodyData["year_of_release"] > 2100) {
            sendErrorMessage("Year of Release must be between 1000 and 2100", 400);
        }

        $imagePath = "";
        if($requestBodyData["image"]) {
            $validateImageResponse = validateBase64Image($requestBodyData["image"]);
            if($validateImageResponse->valid) {
                $imagePath = uploadBase64Image($requestBodyData["image"]);
            } else {
                sendErrorMessage($validateImageResponse->message, 400);
            }
        } else {
            $imagePath = null;
        }


        // New data for the specified line
        $newData = [$requestBodyData['movie_name'], $requestBodyData['genre'], $requestBodyData['year_of_release'], $imagePath];
        $updatedData = $requestBodyData;
        
        // Read the CSV file
        $data = [];
        if (($handle = fopen($filename, 'r')) !== false) {
            $lineNumber = 1; // Start counting lines from 1
            while (($row = fgetcsv($handle)) !== false) {
                // Update the specific line if it matches
                if ($lineNumber == $lineToUpdate) {
                    if(empty($imagePath)) {
                        $newData[3] = $row[3];
                    }
                    if(!empty($imagePath) && substr( $row[3], 0, 8 ) === "uploads/") {
                        unlink($row[3]);
                    }
                    $updatedData['link_to_movie_image'] = $newData[3];
                    $data[] = $newData; // Add new data instead of the old line
                } else {
                    $data[] = $row; // Keep the old line
                }
                $lineNumber++;
            }
            fclose($handle);
        }

        // Write the updated data back to the CSV file
        if (($handle = fopen($filename, 'w')) !== false) {
            foreach ($data as $row) {
                // Create a CSV line as a string without quotes
                $csvLine = implode(',', $row) . "\n";
                fwrite($handle, $csvLine); // Write the line to the file
            }
            fclose($handle);
            if (!filter_var($updatedData['link_to_movie_image'], FILTER_VALIDATE_URL)) {
                $updatedData['link_to_movie_image'] = $serverBaseUrl . "/" . $updatedData['link_to_movie_image'];
            }
            echo json_encode([
                'message' => 'Movie updated successfully',
                'data' => $updatedData
            ]);
        } else {
            sendErrorMessage("Error updating record in server.");
        }
        break;
        
    case 'DELETE':
        if(count(explode('/', $_SERVER['REQUEST_URI'])) != 3) {
            sendErrorMessage("Bad Request", 400);
            return;
        }
        $lineToDelete = explode('/', $_SERVER['REQUEST_URI'])[2];

        // Read the CSV file
        $data = [];
        $deletedId = 0;
        if (($handle = fopen($filename, 'r')) !== false) {
            $lineNumber = 1; // Start counting lines from 1
            while (($row = fgetcsv($handle)) !== false) {
                // Add the row to the data array if it is not the line to delete
                if ($lineNumber != $lineToDelete) {
                    $data[] = $row;
                } else {
                    $data[] = [];
                    $deletedId = $lineNumber;
                }
                $lineNumber++;
            }
            fclose($handle);
        }

        // Write the remaining data back to the CSV file
        if (($handle = fopen($filename, 'w')) !== false) {
            foreach ($data as $row) {
                // Create a CSV line as a string without quotes
                $csvLine = implode(',', $row) . "\n";
                fwrite($handle, $csvLine); // Write the line to the file
            }
            fclose($handle);
            echo json_encode([
                'message' => 'Movie deleted successfully',
                'data' => [
                    'id' => $deletedId
                ]
            ]);
        } else {
            sendErrorMessage("Error loading file in server.");
        }
        break;
    
    default:
        # code...
        break;
}

function toCamelCase($string) {
    return str_replace(' ', '_', strtolower($string));
}

function removeEmptyLinesExceptLast($filePath) {
    // Check if file exists
    if (!file_exists($filePath)) {
        die("File not found.");
    }

    // Read the CSV file into an array
    $file = fopen($filePath, 'r');
    $lines = [];

    while (($row = fgetcsv($file)) !== false) {
        $lines[] = $row; // Store all lines, including empty ones
    }
    fclose($file);

    // If there are no lines, exit
    if (empty($lines)) {
        sendErrorMessage("Error loading file in server.");
        return;
    }
    // Separate the last line
    // $lastLine = array_pop($lines); // Take the last line
    $filteredLines = [];

    // Filter out empty lines but keep the last line
    foreach ($lines as $line) {
        if ($line == count($lines) || !empty(array_filter($line))) {
            $filteredLines[] = $line; // Keep non-empty lines
        }
    }
    // Add the last line back, regardless of whether it's empty

    // $filteredLines[] = $lastLine;


    // Write the modified array back to the CSV file
    $file = fopen($filePath, 'w');
    foreach ($filteredLines as $line) {
        $csvLine = implode(',', $line) . "\n";
        fwrite($file, $csvLine);
    }
    fclose($file);

}