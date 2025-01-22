const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());
// Serve static files from the "public" folder
app.use(express.static('frontEnd'));

// Database setup
const db = new sqlite3.Database('./todo.db');

// Create tables if they don't exist
db.serialize(() => {
    //store user data, username password
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  // store task data for each user
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      task TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

// Basic test route
app.get('/', (req, res) => {
  res.send('BACKEND IS UP YAYYYY');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// LETS SIGN UP THE NEWBIES [signup route]
app.post('/signup', (req, res) => { //post request cuz frontend is sending data to backend
    const { username, password } = req.body;

    // runs data into database
    db.run(
        // put into 'users' table IN A SAFE WAY with ??
        `INSERT INTO users (username, password) VALUES (?, ?)`,
        [username, password],
        //error handling
        (err) => {
            if (err) {
              return res.status(400).json({ error: 'womp womp username taken'});
            }
            res.json({success: true, message: 'welecome to Taskie :)'});
        }
    );
});

// lets let the regulars get back in! [login route]
app.post('/login', (req, res) => {
    const {username, password} = req.body;

    // gets info from database
    db.get(
        // find a row in the USERS table where USERNAME and PASSWORD match the given values
        `SELECT * FROM users WHERE username = ? AND password = ?`,
        [username, password],

        //callback function to run after the query is done
        (err, user) => {
            // if there is a data base error (err) or no matching user (!user)
            if (err || !user) {
                // send to front end
                return res.status(400).json({ error: 'wrong username or password sorryyy!' });
            }
            // send to front end
            res.json({ success: true, userId: user.id });
        }
    );
});

// TASK HANDLING

/**
 * backend gets sent data from frontend
 */
app.post('/tasks', (req, res) => {
    // gets the inputed userid and task description from front end
    const { userId, task } = req.body;
  
    // runs that into SQL
    db.run(
        // fil the TASKS table
      `INSERT INTO tasks (user_id, task) VALUES (?, ?)`,
      [userId, task], // fill the ? and ?

      // callback when query is all done
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'womp womp cant add task!' });
        }
        res.json({ success: true, message: 'task added!' });
      }
    );
});

/**
 * backend sends data about the tasks to frontend
 * this includes its id and whose task it is
 */
app.get('/tasks/:userId', (req, res) => {
    // get userId from the parameters
    const { userId } = req.params;
  
    // query to return all rows with specified data
    db.all(
        // get all the rows from the TASKS table where the user_id matches the given userId
      `SELECT * FROM tasks WHERE user_id = ?`,
      [userId],

      // calback when query all done if error occurs
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch tasks!' });
        }
        //send to front end if no er
        res.json(rows);
      }
    );
});
  
/**
 * delete tasks from backend
 */
app.delete('/tasks/:taskId', (req, res) => {
    const { taskId } = req.params;

    db.run(
        'DELETE FROM tasks WHERE id = ?',
        [taskId],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'ahh i cant delete the task sowwy!' });
            }
            res.json({ success: true, message: 'all done ! good job !' });
        }
    );
});