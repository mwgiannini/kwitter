const express = require('express');
const db = require('./config/db')
const cors = require('cors')

const app = express();
const PORT = 10001;
app.use(cors());
app.use(express.json())

function fixTimesIn(kweetList){
    let fixTime = (time) => {
        let parse = JSON.stringify(time).split('T')
        return (parse[0] + " " + parse[1].split('.')[0]).substring(1)
    }
    for(const kweet of kweetList){
        if ('post_time' in kweet){
            kweet.post_time = fixTime(kweet.post_time)
        }
        if ('rekweet_time' in kweet){
            kweet.rekweet_time = fixTime(kweet.rekweet_time)
        }
    }
}

// --------------------------------------- //
// ------ ROUTES THAT RETURN KWEETS ------ //
// --------------------------------------- //

// Route to get a users timeline
app.get("/api/getTimeline/:username", (req,res)=>{
    let data = {status : Number, body : any=null}
    const username = req.params.username;
     db.query(`CALL get_following_posts('${username}')`, 
     (err1,result1)=>{
        if(err1) {
        console.log(err1)
        data.status = 400
        }
        else {
            db.query(`CALL get_following_rekweets('${username}')`, 
            (err2,result2)=>{
                if(err2) {
                    console.log(err2)
                    data.status = 400
                }
                else{
                    db.query(`SELECT * FROM kweet WHERE username = '${username}';`, 
                    (err3,result3)=>{
                        if(err3) {
                        console.log(err3)
                        data.status = 400
                        }
                        else { data.status = 200 }
                        
                        fixTimesIn(result1[0])
                        fixTimesIn(result2[0])
                        fixTimesIn(result3)
                        data.body = result1[0].concat(result2[0]).concat(result3)
                        res.send(data)
                    }) 
                }
            })
        }
    });   
});

// Route to get a users favorites
app.get("/api/getFavorites/:username", (req,res)=>{
    let data = {status : Number, body : any=null}
    const username = req.params.username;
    let query = 
    `SELECT username, post_time, message, favorite_username FROM favorite
    JOIN kweet
    ON
    kweet_username = username
    AND
    kweet_post_time = post_time
    AND favorite_username = '${username}';`
     db.query(query, 
     (err,result)=>{
        fixTimesIn(result)
        if(err) {
        console.log(err)
        data.status = 400
        }
        else { data.status = 200 }
        data.body = result
        res.send(data)
        });   
});

// Route to get a users kweets
app.get("/api/getUserKweets/:username", (req,res)=>{
    let data = {status : Number, body : any=null}
    const username = req.params.username;
    let query = 
    `SELECT * FROM kweet WHERE username = '${username}';`
     db.query(query, 
     (err,result)=>{
        fixTimesIn(result)
        if(err) {
        console.log(err)
        data.status = 400
        }
        else { data.status = 200 }
        data.body = result
        res.send(data)
    });  
});

// Route to get a users rekweets
app.get("/api/getRekweets/:username", (req,res)=>{
    let data = {status : Number, body : any=null}
    const username = req.params.username;
    let query = 
    `SELECT rekweet_username, kweet.username, kweet.post_time, message, rekweet_time FROM rekweet 
    JOIN
    kweet
    ON
    rekweet.username = kweet.username
    AND
    rekweet.post_time = kweet.post_time
    AND
    rekweet_username = '${username}';`  
    db.query(query, 
     (err,result)=>{
        fixTimesIn(result)
        if(err) {
        console.log(err)
        data.status = 400
        }
        else { data.status = 200 }
        data.body = result
        res.send(data)
        });   
});


// --------------------------------------- //
// ------ ROUTES THAT GET OTHER ---------- //
// --------------------------------------- //

// Route to search for a user
app.get("/api/searchUser/:username", (req,res)=>{
    let data = {status : Number, body : any=null}
    const username = req.params.username;
     db.query("SELECT username FROM user WHERE username=?", username, 
     (err,result)=>{
        if(err) {
        console.log(err)
        data.status = 400
        }
        else { data.status = 200 }
        data.body = result
        res.send(data)
        });   
});

// Route to get a users profile picture
app.get("/api/getProfilePicture/:username", (req,res)=>{
    let data = {status : Number, body : any=null}
    const username = req.params.username;
     db.query("SELECT profile_pic FROM user WHERE username=?", username, 
     (err,result)=>{
        if(err) {
        console.log(err)
        data.status = 400
        }
        else { data.status = 200 }
        data.body = result
        res.send(data)
        });   
});

// Route to get following/followers
app.get("/api/getFollow/:info", (req,res)=>{
    let data = {status : Number, body : any=null}
    const request = JSON.parse(req.params.info);
    let query;
    if (request.request == 'follower'){
        query = `SELECT follower FROM follow WHERE following = '${request.user}';`
    }
    else {
        query = `SELECT following FROM follow WHERE follower = '${request.user}';`
    }
     db.query(query,
     (err,result)=>{
        if(err) {
        console.log(err)
        data.status = 400;
        data.body = {message:'network error'}
        }
        else {
            data.status = 200;
            data.body = {result}
        }
        res.send(JSON.stringify(data))
        });   
});

// Route to login
app.get("/api/login/:info", (req,res)=>{
    let data = {status : Number, body : any=null}
    const request = JSON.parse(req.params.info);
     db.query(`SELECT password FROM user WHERE username = '${request.username}';`,
     (err,result)=>{
        if(err) {
        console.log(err)
        data.status = 400;
        data.body = {loggedIn: false, message:'network error'}
        }
        if (result[0].password === request.password){
            console.log(`${request.username} has logged in`)
            data.status = 200
            data.body = {loggedIn: true, message:''}
        }
        else {
            data.status = 200;
            data.body = {loggedIn: false, message:'wrong password'}
        }
        res.send(JSON.stringify(data))
        });   
});

// Route to check following status
app.get("/api/checkFollow/:info", (req,res)=>{
    let data = {status : Number, body : any=null}
    const request = JSON.parse(req.params.info);
     db.query(`SELECT * FROM follow WHERE follower='${request.user}' AND following='${request.target}';`,
     (err,result)=>{
        if(err) {
        console.log(err)
        data.status = 400;
        data.body = {loggedIn: false, message:'network error'}
        } 
        if (result[0]){
            data.status = 200
            data.body = {following: true}
        }
        else {
            data.status = 200;
            data.body = {following: false}
        }
        res.send(JSON.stringify(data))
        });   
});


// --------------------------------------- //
// ------ ROUTES THAT UPDATE DB ---------- //
// --------------------------------------- //

// Route to sign up
app.get("/api/signUp/:info", (req,res)=>{
    let data = {status : Number, body : any=null}
    const request = JSON.parse(req.params.info);
    db.query(`INSERT INTO user (username, password) VALUES('${request.username}','${request.password}');`,
     (err,result)=>{
        if(err) {
        console.log(err)
        data.status = 400;
        data.body = {message:err.sqlMessage}
        }
        else {
            data.status = 200;
        }
        res.send(JSON.stringify(data))
        });   
});

// Route to favorite/unfavorite a post
app.get("/api/favorite/:info", (req,res)=>{
    let data = {status : Number, body : any=null}
    const props = JSON.parse(req.params.info);
     db.query(`CALL toggle_favorite('${props.username}', '${props.post_time}', '${props.favorite_username}')`, 
     (err,result)=>{
        if(err) {
        console.log(err)
        data.status = 400
        }
        else { data.status = 200 }
        data.body = result
        res.send(data)
        });   
});

// Route to rekweet/unrekweet a kweet
app.get("/api/rekweet/:info", (req,res)=>{
    let data = {status : Number, body : any=null}
    const props = JSON.parse(req.params.info);
     db.query(`CALL rekweet('${props.username}','${props.rekweet_username}','${props.post_time}')`, 
     (err,result)=>{
        if(err) {
        console.log(err)
        data.status = 400
        }
        else { data.status = 200 }
        data.body = result
        res.send(data)
    });   
});

// Route to post kweet
app.get("/api/postKweet/:info", (req,res)=>{
    let data = {status : Number, body : any=null}
    const request = JSON.parse(req.params.info);
     db.query(`CALL post_kweet('${request.username}','${request.message}');`,
     (err,result)=>{
        if(err) {
        console.log(err)
        data.status = 400;
        data.body = {message:err.sqlMessage}
        }
        else {
            data.status = 200;
        }
        res.send(JSON.stringify(data))
        });   
});

// Route to delete a kweet
app.get("/api/deleteKweet/:info", (req,res)=>{
    let data = {status : Number, body : any=null}
    const props = JSON.parse(req.params.info);
     db.query(`CALL delete_kweet('${props.username}', '${props.post_time}')`, 
     (err,result)=>{
        if(err) {
        console.log(err)
        data.status = 400
        }
        else { data.status = 200 }
        data.body = result
        res.send(data)
        });   
});

// Route to delete a follow/unfollow
app.get("/api/toggleFollow/:info", (req,res)=>{
    let data = {status : Number, body : any=null}
    const props = JSON.parse(req.params.info);
     db.query(`CALL toggle_follow('${props.target}', '${props.user}')`, 
     (err,result)=>{
        if(err) {
        console.log(err)
        data.status = 400
        }
        else { data.status = 200 }
        data.body = result
        res.send(data)
        });   
});

app.listen(PORT, ()=>{
    console.log(`Server is running on ${PORT}`)
})