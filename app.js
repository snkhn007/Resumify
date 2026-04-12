const express = require('express');
const app = express();
const path = require('path');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const pageRouter = require('./routes/pageRoutes');
const authRouter = require('./routes/authRoutes');

app.use('/user', pageRouter);
app.use('/api/auth', authRouter);

let PORT = 3000;
app.listen(PORT, ()=>{
    console.log("Working");
})