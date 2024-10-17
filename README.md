# movie-management-project
Simple CRUD application for movie management using PHP and React JS

## For running the backend
Go to server folder, and run the following command :
* php -S localhost:8000

## For running the frontend
Go to client folder, and run these 2 command sequentially :
* npm run build
* npm run start

## API documentation

* **API Link** : (GET) http://localhost:8000/movies.php?page=1&limit=15
  * **Description** :
    * This is a GET Request
    * for pagination of movies data, "limit" parameter sets the limit of records to be sent from the api, and "page" defines the page number
    * default values for query parameters for page & limit are 1 & 15 respectively
   
* **API Link** : (POST) http://localhost:8000/movies.php
  * **Description** :
    * This is a POST Request, of headers Content-type JSON
    * **Request Body** :
      *  ```
         {
            "movie_name": "Joker", /*(Type : string, Validations : minimiun length = 2, maximum length = 255)*/
            "year_of_release": 2024, /*(Type: integer, Validations : minimiun value = 1000, maximum value = 2100)*/
            "genre": "Drama", /*(Type: string, Validations : minimiun length = 2, maximum length = 255)*/
            "image": "**base64 path**", /*(Type : Base64 Image, Validations : Maximum Acceptable File Size => 2MB, Acceptable Extensions => png,jpeg,jpg,svg,webp,jfif)*/
         }
         ```

* **API Link** : (PUT) http://localhost:8000/movies.php/{id}
  * **Description** :
    * This is a PUT Request, of headers Content-type JSON
    * The "id" path variable in the url represents the line number of the record, to be updated in csv file.
    * The "id" is fetched from the GET request of http://localhost:8000/movies.php
    * **Request Body** :
      *  ```
         {
            "movie_name": "Joker", /*(Type : string, Validations : minimiun length = 2, maximum length = 255)*/
            "year_of_release": 2024, /*(Type: integer, Validations : minimiun value = 1000, maximum value = 2100)*/
            "genre": "Drama", /*(Type: string, Validations : minimiun length = 2, maximum length = 255)*/
            "image": "**base64 path**", /*(Type : Base64 Image, Validations : Maximum Acceptable File Size => 2MB, Acceptable Extensions => png,jpeg,jpg,svg,webp,jfif)*/
         }
         ```

* **API Link** : (DELETE) http://localhost:8000/movies.php/{id}
  * **Description** :
    * This is a DELETE Request
    * The "id" path variable in the url represents the line number of the record, to be deleted in csv file.
    * The "id" is fetched from the GET request of http://localhost:8000/movies.php
