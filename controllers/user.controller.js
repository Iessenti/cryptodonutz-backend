const db = require('../db')

const fs = require('fs')

const getImageName = () => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 32; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
    }
    return result
}

class UserController {
    async checkUsername(req, res) {
        const {username} = req.body
        const user = await db.query('SELECT * FROM users WHERE username = $1', [username])
        if (user.rows.length>0 && user.rows[0].username===username) {
            res.status(200).json({error: true})
        } else {
            res.status(200).json({error: false})
        }
    }

    async checkUserExist(req, res) {
        const { tron_token } = req.body
        const user = await db.query('SELECT * FROM users WHERE tron_token = $1', [tron_token])
        if (user.rows && user.rows.length === 0) {
            res.status(200).json({notExist: true})
        } else {
            res.status(200).json(user.rows[0])
        }
    }

    async createUser(req, res) {
        const {username, tron_token, role} = req.body
        const date = new Date()
        const newUser = await db.query(`INSERT INTO users (tron_token, username, roleplay) values ($1, $2, $3) RETURNING *;`, [tron_token, username.toLowerCase(), role])
        if (role === 'creators') {
            await db.query(`INSERT INTO creators (username, user_id, creation_date) values ($1, $2, $3) RETURNING *`, [username.toLowerCase(), newUser.rows[0].id, date])
            res.status(200).json({message: 'Creator created!'})
        } else {
            await db.query(`INSERT INTO backers (username, user_id, creation_date) values ($1, $2, $3) RETURNING *`, [username.toLowerCase(), newUser.rows[0].id, date])
            res.status(200).json({message: 'Backer created!'})
        }
    }

    async getUser(req, res) {
        const tron_token = req.params.tron_token
        const user = await db.query('SELECT * FROM users WHERE tron_token = $1', [tron_token])
        const role = await db.query(`SELECT * FROM ${user.rows[0].roleplay} WHERE user_id = $1`, [user.rows[0].id])
        res.status(200).json({...role.rows[0], ...user.rows[0]})
    }

    async getUsersByName(req, res) {
        const username = req.params.username
        if (username === 'all') {
            const users = await db.query(`SELECT * FROM creators`)
            res.status(200).json(users.rows)
        } else {
            const users = await db.query(`SELECT * FROM creators WHERE username LIKE '%${username.toLowerCase()}%'`)
            res.status(200).json(users.rows)
        }
    }

    async getCreatorByName(req, res) {
        const username = req.params.username
        const users = await db.query(`SELECT * FROM users WHERE roleplay = 'creators' AND username LIKE '%${username.toLowerCase()}%'`)
        const creator = await db.query(`SELECT * FROM creators WHERE username = $1`, [username.toLowerCase()])
        res.status(200).json({
            ...users.rows[0],
            ...creator.rows[0]
        })
    }

    async editUser(req, res) {
        const { tron_token, person_name, twitter, google, facebook, discord } = req.body
        const user = await db.query(`SELECT * FROM users WHERE tron_token = $1`, [tron_token])
        console.log(person_name)
        let table = 'backers'
        if (user.rows[0].roleplay === 'creators') {
            table = 'creators'
        }
        const editedUser = await db.query(`UPDATE ${table} SET person_name = $1, twitter = $2, google = $3, facebook = $4, discord = $5 WHERE user_id = $6 RETURNING *`, [person_name, twitter, google, facebook, discord, user.rows[0].id])
        res.json(editedUser)
    }

    async editUserImage(req,res) {
        const { tron_token } = req.body
        var data = req.body.data.replace(/^data:image\/\w+;base64,/, "");
        var buf = Buffer.from(data, 'base64');
        const newName = getImageName()
        fs.writeFileSync(`./images/${newName}.jpg`, buf, 'base64')
        const user = await db.query(`SELECT * FROM users WHERE tron_token = $1`, [tron_token])
        let table = 'backers'
        if (user.rows[0].roleplay === 'creators') {
            table = 'creators'
        }
        await db.query(`UPDATE ${table} SET avatarlink = $1 WHERE user_id = $2`, [newName+'.jpg', user.rows[0].id])
    }

    async editCreatorBackgroundImage(req, res) {
        const tron_token = req.params.tron_token
        const file = req.files.file;
        const filename = getImageName()
        file.mv(`images/${filename+file.name.slice(file.name.lastIndexOf('.'))}`, (err) => {})
        const user = await db.query(`SELECT * FROM users WHERE tron_token = $1`, [tron_token])
        let table = 'backers'
        if (user.rows[0].roleplay === 'creators') {
            table = 'creators'
        }
        console.log(file.name.slice(file.name.lastIndexOf('.')))
        await db.query(`UPDATE ${table} SET backgroundlink = $1 WHERE user_id = $2`, [filename+file.name.slice(file.name.lastIndexOf('.')), user.rows[0].id])
    }

    async editCreatorDescription(req, res) {
        const { tron_token, description } = req.body
        const user = await db.query(`SELECT * FROM users WHERE tron_token = $1`, [tron_token])
        const editedCreator = await db.query('UPDATE creators SET user_description = $1 WHERE user_id = $2 RETURNING *', [description, user.rows[0].id])
        if (editedCreator.rows[0].user_id === user.rows[0].id) {
            res.status(200).json({message: 'success'})
        }
    }

    async getPersonInfoSupporters(req, res) {
        const username = req.params.username
        const user = await db.query(`SELECT * FROM users WHERE username = $1`, [username])
        const supporters = await db.query(`SELECT * FROM supporters WHERE creator_id = $1 ORDER BY sum_donations DESC`, [user.rows[0].id])
        const lastdonations = await db.query(`SELECT * FROM donations WHERE creator_id = $1`, [user.rows[0].id])
        console.log(lastdonations)
        res.json({data: {
            supporters: supporters.rows.slice(0,5),
            donations: lastdonations.rows
        }})
    }

    async getPersonInfoNFT(req, res) {
        const username = req.params.username
        const user = await db.query(`SELECT * FROM users WHERE username = $1`, [username])
        const nfts = await db.query(`SELECT * FROM nft WHERE creator_id = $1`, [user.rows[0].id])
        res.json({data: nfts.rows})
    }
}

module.exports = new UserController()