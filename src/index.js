const express = require("express");
const path = require("path");
const { User, Item } = require("./config");
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    };

    const existingUser = await User.findOne({ name: data.name });

    if (existingUser) {
        res.send('User already exists. Please choose a different username.');
    } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword;
        const userdata = new User(data);
        await userdata.save();
        res.redirect("/");
    }
});

app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ name: req.body.username });
        if (!user) {
            res.send("User name not found");
            return;
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) {
            res.send("Wrong password");
            return;
        }

        const items = await Item.find({ userId: user._id });

        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const day = today.toLocaleDateString("en-US", options);

        res.render("home", { day: day, items: items, userId: user._id });
    } catch (error) {
        res.send("Wrong details");
    }
});

app.post("/addItem", async (req, res) => {
    const userId = req.body.userId;
    const newItem = req.body.newItem;
    const deadline = req.body.deadline;

    const item = new Item({
        name: newItem,
        userId: userId,
        deadline: new Date(deadline)
    });

    await item.save();
    res.redirect(`/home/${userId}`);
});

app.post("/deleteItem", async (req, res) => {
    const itemId = req.body.itemId;
    const userId = req.body.userId;

    await Item.findByIdAndRemove(itemId);
    res.redirect(`/home/${userId}`);
});

app.get("/home/:userId", async (req, res) => {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
        res.send("User not found");
        return;
    }

    const items = await Item.find({ userId: userId });

    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const day = today.toLocaleDateString("en-US", options);

    res.render("home", { day: day, items: items, userId: userId });
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
