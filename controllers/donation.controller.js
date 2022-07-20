const db = require('../db')

class DonationController {
    async createDonation(req, res) {

        const {creator_tron_token, backer_tron_token, sum} = req.body
        const date = (new Date()).toISOString()
        console.log(req.body)
        const creator = await db.query('SELECT * FROM users WHERE tron_token = $1', [creator_tron_token])
        const backer = await db.query('SELECT * FROM users WHERE tron_token = $1', [backer_tron_token])

        const donation = await db.query(`INSERT INTO donations (username, donation_date, backer_id, sum_donation, creator_id) values ($1, $2, $3, $4, $5) RETURNING *`, [
            backer.rows[0].username,
            date,
            backer.rows[0].id,
            sum,
            creator.rows[0].id,
        ])
        
        const supporter = await db.query(`SELECT * FROM supporters WHERE backer_id = $1`, [backer.rows[0].id])

        if (supporter.rows && supporter.rows.length>0) {
            await db.query('UPDATE supporters SET sum_donations = $1, amount_donations = $2 WHERE backer_id = $2', [
                (parseFloat(supporter.rows[0].sum_donations)+parseFloat(sum)).toString(),
                parseInt(supporter.rows[0].amount_donations)+1,
                backer.rows[0].id,
            ])
        } else {
            await db.query(`INSERT INTO supporters (username, backer_id, sum_donations, creator_id, amount_donations ) values ($1, $2, $3, $4) `, [
                backer.rows[0].username,
                backer.rows[0].id,
                sum,
                creator.rows[0].id,
                1
            ])
        }

        if (donation.rows[0]) {
            res.status(200).json({message: 'success'})
        }
    }

    async getSupporters(req, res) {
        const user_id = req.params.user_id
        console.log(user_id)
        const supporters = await db.query('SELECT * FROM supporters WHERE creator_id = $1', [user_id])
        const donations = await db.query('SELECT * FROM donations WHERE creator_id = $1', [user_id])
        console.log(supporters.rows)
        console.log(donations.rows)
        res.status(200).json({
            supporters: supporters.rows,
            donations: donations.rows
        })
    }
}

module.exports = new DonationController()