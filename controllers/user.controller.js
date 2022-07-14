const db = require('../db')

const fs = require('fs')
const { default: getImageName } = require('../functions/getImageName')

class UserController {
    async checkUserExist(req, res) {
        const { tron_token } = req.body
        const user = await db.query('SELECT * FROM users WHERE tron_token = $1', [tron_token])
        if (user.rows && user.rows.length === 0) {
            res.json({exist: false})
        } else {
            res.json(user.rows[0])
        }
    }

    async createUser(req, res) {
        const {username, tron_token, role} = req.body
        const newUser = await db.query(`INSERT INTO users (tron_token, username, roleplay) values ($1, $2, $3) RETURNING *;`, [tron_token, username.toLowerCase(), role])
        if (role === 'creators') {
            await db.query(`INSERT INTO creators (username, user_id) values ($1, $2) RETURNING *`, [username.toLowerCase(), newUser.rows[0].id])
            res.status(200).json({message: 'Creator created!'})
        } else {
            await db.query(`INSERT INTO backers (username, user_id) values ($1, $2) RETURNING *`, [username.toLowerCase(), newUser.rows[0].id])
            res.status(200).json({message: 'Backer created!'})
        }

    }

    async getUser(req, res) {
        const tron_token = req.params.tron_token
        const user = await db.query('SELECT * FROM users WHERE tron_token = $1', [tron_token])
        const creator = await db.query(`SELECT * FROM creators WHERE user_id = $1`, [user.rows[0].id])
        res.status(200).json(creator.rows[0])
    }

    async getUsersByName(req, res) {
        const username = req.params.username
        const users = await db.query(`SELECT * FROM users WHERE roleplay = 'creators' AND username LIKE '%${username.toLowerCase()}%'`)
        res.status(200).json(users.rows)
    }

    async editUser(req, res) {
        const { tron_token, person_name, twitter, google, facebook, discord } = req.body
        const user = await db.query(`SELECT * FROM users WHERE tron_token = $1`, [tron_token])
        let table = 'backers'
        if (user.rows[0].roleplay === 'creators') {
            table = 'creators'
        }
        const editedUser = await db.query(`UPDATE ${table} SET person_name = $1, twitter = $2, google = $3, facebook = $4, discord = $5 WHERE user_id = $6 RETURNING *`, [person_name, twitter, google, facebook, discord, user.rows[0].id])
        console.log(editedUser)
        res.json(editedUser)
    }

    async editUserImage(req,res) {
        const file = req.files.file;
        const filename = file.name
        const newName = getImageName()
        const user = await db.query(`SELECT * FROM users WHERE tron_token = $1`, [tron_token])
        let table = 'backers'
        if (user.rows[0].roleplay === 'creators') {
            table = 'creators'
        }
        // const editedUser = await db.query(`UPDATE ${table} SET person_name = $1, twitter = $2, google = $3, facebook = $4, discord = $5 WHERE user_id = $6 RETURNING *`, [person_name, twitter, google, facebook, discord, user.rows[0].id])
        // console.log(editedUser)
        // res.json(editedUser)
        fs.rename(filename, newName+filename.slice(filename.lastIndexOf('.')), () => {
            //const editedUser = await db.query(`UPDATE ${table} SET person_name = $1, twitter = $2, google = $3, facebook = $4, discord = $5 WHERE user_id = $6 RETURNING *`, [person_name, twitter, google, facebook, discord, user.rows[0].id])
        })
    }
}

module.exports = new UserController()