
**Prerequisites**

    - Install composer ^2.0.
    - Install docker (latest version), docker-compose (latest version).

**Project setup**

1. Copy .env.example to .env

2. At the root of the project, run the following command to pull docker images and set up containers

````
docker-compose up -d --build
````

3. Install project's dependencies:

````  
cd app
composer install
npm i
````

4. Set up DB and migrations:

- List all running containers

````
docker ps -a
````

- Find the container id and replace the placeholder with the found value   

````
docker exec -it {container_id} bash
````

- Once inside the container, run the following command:

````
./bin/console doctrine:migrations:migrate
````

5. Run the project:

````
cd app
npm run dev
````

6. Once done, go to the following URL to use the application: http://localhost:8082