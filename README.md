
**Prerequisites**

    - Install composer ^2.0.
    - Install docker (latest version), docker-compose (latest version).

**Project setup**

1. At the root of the project, run the following command to pull docker images and set up containers

````
docker-compose up -d --build
````

2. Install project's dependencies:

````  
cd app
composer install
npm i
````

3. Set up DB and migrations:

- List all running containers

````
docker ps -a
````

- Find the container id of the calendar-app-php and replace the placeholder below with the found container id:   

````
docker exec -it {container_id} bash
````

- Once inside the container, run the following command to migrate DB schema:

````
./bin/console doctrine:migrations:migrate
````

4. Run the project:

````
cd app
npm run dev
````

5. Once done, go to the following URL to use the application: http://localhost:8082