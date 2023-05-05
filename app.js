const express = require("express");
const https = require("https")
const port = process.env.PORT || 5000
const mongoose = require("mongoose")
const dotenv = require('dotenv')

dotenv.config()
const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD

const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect(`mongodb+srv://${username}:${password}@daily-journal.ar5mtft.mongodb.net/?retryWrites=true&w=majority`)

// let posts = [];

const blogSchema = new mongoose.Schema({
  title: String,
  content: String
})

const Post = mongoose.model("Posts", blogSchema)

app.get("/", (req, res) => {

  const url = "https://zenquotes.io/api/today/[your_key]"

  https.get(url, (quoteResponse) => {
    // console.log(quoteResponse)

    quoteResponse.on("data", (data) => {
      const quoteData = JSON.parse(data)
      // console.log(quoteData)
      const quote = quoteData[0].h
      // console.log(quote)

      Post.find((err, foundPosts) => {
        if(!err){
          res.render('home', {homeQuote: quote, postList: foundPosts})
        }
      })

    })
  })
})

app.get("/posts/:postId", (req, res) => {
  // console.log(req.params.postName)
  const requestedPostId  = req.params.postId;
  Post.findOne({_id: requestedPostId}, (err, foundPost) => {
    if(!err){
      res.render('post', {title: foundPost.title, content: foundPost.content, deleteId: requestedPostId})
    }
  })
})

app.post("/delete", (req, res) => {
  const deleteId = req.body.deleteButton

  Post.findByIdAndDelete(deleteId, (err)=>{
    if(!err){
        res.redirect("/")
    }
})
})

app.get("/contact", (req, res) => {
  res.render('contact', {contact: contactContent})
})

app.get("/about", (req, res) => {
  res.render('about', {about: aboutContent})
})

app.get("/compose", (req, res) => {
  res.render('compose')
})

app.post("/compose", (req, res) => {
  
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postContent
  })

  post.save((err) => {
    if(!err){
      res.redirect("/");
    }
  })
})


app.listen(port, function() {
  console.log(`Server started on port ${port}`);
});
