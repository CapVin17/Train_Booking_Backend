-- Start of with npm install to install all dependencies

To run this code the first step is to get yourself a local MYSQL instance and then open by cd src/query the query folder inside it go to db.js there add your HOST USER AND PASSWORD and then run  

-- Node db.js

-- After this you are all set

get out of query folder cd .. and run nodemon/node index.js

This project has 8 endpoints listed below

-- https://localhost:3000/api/v1/register_user

A post request to register a user, test it using the json data in the format 

{
  "FirstName": "Vineet",
  "LastName": "Singh",
  "UserName": "Capvin17",
  "Password": "Vineeet@43535"
}

-- https://localhost:3000/api/v1/login_user

A post request to login a user test it using the json data in the format and remember to save the token with yourself.

{
  "UserName": "Capvin17",
  "Password": "Vineeet@43535"
}

-- https://localhost:3000/api/v1/register_admin

A post request to register a admin, test it using the json data in the format 

{
  "FirstName": "Vineet",
  "LastName": "Singh",
  "UserName": "Capvin17",
  "Password": "Vineeet@43535"
}

-- https://localhost:3000/api/v1/login_admin

A post request to login a admin test it using the json data in the format and remember to save the token with yourself.

{
  "UserName": "Capvin17",
  "Password": "Vineeet@43535"
}

-- https://localhost:3000/api/v1/add_train

helps in adding a train

{
  "Name": "Express Train",
  "Source": "City A",
  "Destination": "City B",
  "Seats_Available": 2
}


-- https://localhost:3000/api/v1/api/v1/book_seat

{
  "Name": "Express Train",
  "Source": "City A",
  "Destination": "City B",
  "NumberOfSeats": 2
}

-- https://localhost:3000/api/v1/api/v1/booking_details 

this is a get request if you have made any booking then it will show you just keep the token handy with you

-- https://localhost:3000/api/v1/seat_availability

this is a get request tells the number of seats available in the train just keep the token handy with you


