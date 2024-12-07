const express = require("express");
const bcrypt = require("bcrypt");
const executeQuery = require("./query/execution");
const z = require("zod");

const port = 3000;
const app = express();

const jwt = require("jsonwebtoken")

require('dotenv').config();

const authenticateToken = require("./middlewares/jwtmiddleware");

// Use express.json() instead of bodyParser
app.use(express.json());

const jwtsecret = process.env.JWT_SECRET;

const pool = require("./query/db");

const registeruser = z.object({
    FirstName: z.string().max(20),
    LastName: z.string().max(20),
    UserName: z.string().max(10),
    Password: z.string().min(8)
});

const loginuser = z.object({
    UserName: z.string(),
    Password: z.string()
});

const registeradmin = z.object({
    FirstName: z.string().max(20),
    LastName: z.string().max(20),
    UserName: z.string().max(10),
    Password: z.string().min(8)
});

const loginadmin = z.object({
    UserName: z.string(),
    Password: z.string()
});

app.post("/api/v1/register_user", async (req, res) => {
  try {
    const check = registeruser.safeParse(req.body);

    if (!check.success) {
      return res.status(400).json({
        message: "Invalid register user credentials",
        errors: check.error.errors,
      });
    }

    const { FirstName, LastName, UserName, Password } = req.body;

    const hashedpassword = await bcrypt.hash(Password, 10);

    const query = `INSERT INTO users (FirstName, LastName, UserName, Password) VALUES (?,?,?,?)`;
    const params = [FirstName, LastName, UserName, hashedpassword];

    const result = await executeQuery(query, params);

    if (!result) {
      return res.status(500).json({
        message: "User registration failed",
        error: "An error occurred while saving to the database",
      });
    }

    return res.status(201).json({
      message: "User registration was successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "An unexpected error occurred",
    });
  }
});


app.post("/api/v1/register_admin", async (req, res) => {
  try {
    const check = registeradmin.safeParse(req.body);

    if (!check.success) {
      return res.status(400).json({
        message: "Invalid register admin credentials",
        errors: check.error.errors,
      });
    }

    const { FirstName, LastName, UserName, Password } = req.body;

    const hashedpassword = await bcrypt.hash(Password, 10);

    const query = `INSERT INTO admins (FirstName, LastName, UserName, Password) VALUES (?,?,?,?)`;
    const params = [FirstName, LastName, UserName, hashedpassword];

    const result = await executeQuery(query, params);

    if (!result) {
      return res.status(500).json({
        message: "Admin registration failed",
        error: "An error occurred while saving to the database",
      });
    }

    return res.status(201).json({
      message: "Admin registration was successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message || "An unexpected error occurred",
    });
  }
});

app.post('/api/v1/login_user', async (req,res) => {

    try {
        const check = loginuser.safeParse(req.body);

        if(!check.success)
        {
            return res.status(404).json({
                message: "Invalid login credentials",
                error: check.error.errors
            });
        }

        const { UserName, Password } = req.body;

        const [user] = await executeQuery('SELECT * FROM users WHERE UserName = ?', [UserName]);

        if(!user || !(await bcrypt.compare(Password,user.Password)))
        {
            return res.status(404).json({
                message: "Invalid lgoin credentials"
            });
        }

        const token = jwt.sign({ id: user.id}, jwtsecret, {
        expiresIn: "1h",});

        res.json({ token: token});

    } catch (error) {
        return res.status(500).json({
            error: error.message,
        });
    }
});

app.post('/api/v1/admin_login', async(req,res) => {

    try {
        const check = loginadmin.safeParse(req.body);

        if(!check.success)
        {
            return res.status(404).json({
                message: "Invalid login credentials",
                error: check.error.errors
            });
        }

        const {UserName, Password } = req.body;

        const [admin] = await executeQuery('SELECT * FROM admins WHERE UserName = ?', [UserName]);

        if(!admin || !(await bcrypt.compare(Password, admin.Password)))
        {
            return res.status(401).json({
                message: "Invalid login credentials",
            });
        }

        const token = jwt.sign({id: admin.id}, jwtsecret, {expiresIn: "1h",});

        res.json({token: token});
    } catch (error) {
            return res.status(500).json({
            message: "Internal Server Error",
            error: error.message || "An unexpected error occurred",
        });
    }
});


app.post("/api/v1/add_train" , authenticateToken , async(req,res) => {
    try {
        const {Name, Source, Destination, Seats_Available} = req.body;

        if(!Name || !Source || !Destination || !Seats_Available)
        {
            return res.status(400).json({
                message: "NO proper inputs",
            });
        }

        const query = `INSERT INTO trains(Name, Source, Destination, Seats_Available) VALUES (?, ?, ?, ?)`;

        const params = [Name, Source, Destination, Seats_Available];

        const result = await executeQuery(query, params);

        if (!result)
        {
            return res.status(500).json({
                message: "Failed to add new train",
                error: "An error occurred while saving to the database",
            });
        }

        return res.status(200).json({
            message: "Train added successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message || "An unexpected error occurred",
        });
    }
});


app.get('/api/v1/seat_availability', authenticateToken , async (req, res) => {
    try {
        const {Source, Destination} = req.query;

        if(!Source || !Destination)
        {
            return res.status(404).json({
                message: "No valid inputs"
            })
        }

        const query = `SELECT Name, Source, Destination, Seats_Available FROM trains WHERE Source = ? AND Destination =  ? AND Seats_Available > 0`;

        const params = [Source, Destination];

        const result = await executeQuery(query, params);

        console.log(result);

        if(result.length == 0)
        {
            return res.status(404).json({
                message: "No trains available right now."
            });
        }

        return res.status(200).json({
            message: "Trains available",
            trains : result
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message || "An unexpected error occurred",
        });
    }
});


app.post('/api/v1/book_seat', authenticateToken, async (req, res) => {
    const { Name, Source, Destination, NumberOfSeats } = req.body;

    console.log("Request Body:", req.body);

    if (!Name || !Source || !NumberOfSeats || !Destination || NumberOfSeats <= 0) {
        return res.status(400).json({
            message: "Invalid inputs"
        });
    }

    const userId = req.UserId;

    // Check if userId is valid
    if (!userId) {
        return res.status(400).json({
            message: "User not authenticated, invalid token"
        });
    }

    const connection = await pool.promise().getConnection();

    try {
        await connection.beginTransaction();

        const trainquery = `SELECT id, Seats_Available FROM trains WHERE Name = ? AND Source = ? AND Destination = ? FOR UPDATE`;

        const trainParams = [Name, Source, Destination];
        const [trainResult] = await connection.query(trainquery, trainParams);

        if (trainResult.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Train not found",
            });
        }

        const train = trainResult[0];

        if (NumberOfSeats > train.Seats_Available) {
            const alternativeQuery = `SELECT Name, Seats_Available FROM trains WHERE Source = ? AND Destination = ? AND Seats_Available > 0`;

            const alternativeParams = [Source, Destination];

            const [alternativeTrains] = await connection.query(alternativeQuery, alternativeParams);

            return res.status(400).json({
                message: "Not enough seats available on the requested train",
                availableTrains: alternativeTrains,
            });
        }

        const updatedSeats = train.Seats_Available - NumberOfSeats;

        const updateTrainQuery = `UPDATE trains SET Seats_Available = ? WHERE id = ?`;

        const updateTrainParams = [updatedSeats, train.id];

        await connection.query(updateTrainQuery, updateTrainParams);

        const bookingquery = `INSERT INTO bookings (UserId, TrainId, Seats_Booked) VALUES (?, ?, ?)`;

        const bookingParams = [userId, train.id, NumberOfSeats];

        await connection.query(bookingquery, bookingParams);

        await connection.commit();

        return res.status(200).json({
            message: "Seats booked successfully",
            train: {
                id: train.id,
                Name,
                Source,
                Destination,
                Seats_Booked: NumberOfSeats,
                Remaining_Seats: updatedSeats,
            },
        });
    } catch (error) {
        await connection.rollback();
        return res.status(500).json({
            message: "Error internal server",
            error: error.message || "An unexpected error occurred",
        });
    } finally {
        connection.release();
    }
});

app.get('/api/v1/booking_details', authenticateToken, async(req,res) => {
    const userId = req.UserId;

    if(!userId)
    {
        return res.status(400).json({
            message: "User not authenticated, invalid token",
        });
    }

    const connection = await pool.promise().getConnection();

    try {
        const bookingsquery = `SELECT b.UserId, b.TrainId, b.Seats_Booked, b.Booking_Date, t.Name AS train_name, t.Source AS train_source, t.Destination AS train_destination, t.Seats_Available AS remaining_seats FROM bookings b JOIN trains t ON b.TrainId = t.id WHERE b.UserId = ?`;

        const [bookings] = await connection.query(bookingsquery,[userId]);

        if(bookings.length === 0)
        {
            return res.status(404).json({
                message: "No bookings found for this user"
            });
        }

        return res.status(200).json({
            message: "Booking found",
            bookings
        });
    } catch (error) {
        res.status(500).json({
            message: "Error of internal server",
            error: error.message || "An unexpected error occurred"
        });
    } finally{
        connection.release();
    }
});

app.listen(port, () => {
  console.log("Listening on port: " + port);
});
