import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";
import { sendEmail } from "./utils/mail.js";
dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// app.get("/github", (req, res) => {
//   res.send("This is my github page.");
// });

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.errror("MongoDB connection error", err);
    process.exit(1);
  });

app.post("/send-mail", async (req, res) => {
  await sendEmail({
    mail: req.body.email,
    subject: "Welcome",
    mailgenContent: {
      body: {
        name: req.body.name,
        intro: "Welcome to task manager.",
      },
    },
  });
});
