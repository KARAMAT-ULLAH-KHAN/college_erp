import express from "express";

export default function forgotPassword(db,bcrypt) {
  const router = express.Router();
  const saltround=5;

  router.get("/", (req, res) => {
    res.render("forgot-password.ejs");
  });

  router.post("/", async (req, res) => {
    const id = req.body.Faculty_ID;
    const username = req.body.username;
    const newpsw = req.body.new_password;
    console.log(id, username, newpsw);
    try {
      bcrypt.hash(newpsw, saltround, async (err, hash) => {
        const result = await db.query(
          "UPDATE faculty set password=$1 where faculty_id=$2 AND faculty_name=$3",
          [hash, id, username]
        );
        if (result.rowCount > 0) {
          res.send("Password updated successfully.");
        } else {
          res.send("No matching user found or password not updated.");
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  return router;
}
