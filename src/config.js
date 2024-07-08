const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/Login-tut", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
 
})
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((err) => {
    console.error("MongoDB connection error: ", err);
    process.exit();
});

// Create Schema for Users
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

// Create Schema for Items
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    deadline: {
        type: Date,
        required: true
    }
});

const User = mongoose.model("users", userSchema);
const Item = mongoose.model("items", itemSchema);

module.exports = { mongoose, User, Item };
