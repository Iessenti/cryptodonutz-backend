const db = require('../db')

class DonationController {
    async createDonation(req, res) {

        const {creator_tron_token, backer_tron_token, sum} = req.body
        const date = (new Date()).toISOString()
        if (backer_tron_token && creator_tron_token) {
            const creator = await db.query('SELECT * FROM users WHERE tron_token = $1', [creator_tron_token])
            const backer = await db.query('SELECT * FROM users WHERE tron_token = $1', [backer_tron_token])
            const donation = await db.query(`INSERT INTO donations (username, creator_username, donation_date, backer_id, sum_donation, creator_id) values ($1, $2, $3, $4, $5, $6) RETURNING *`, [
                backer.rows[0].username,
                creator.rows[0].username,
                date,
                backer.rows[0].id,
                sum,
                creator.rows[0].id
            ])
            
            const supporter = await db.query(`SELECT * FROM supporters WHERE backer_id = $1`, [backer.rows[0].id])
            if (donation.rows[0]) {
                res.status(200).json({message: 'success'})
            }
            if (supporter.rows && supporter.rows.length>0) {
                await db.query('UPDATE supporters SET sum_donations = $1, amount_donations = $2 WHERE backer_id = $3', [
                    (parseFloat(supporter.rows[0].sum_donations)+parseFloat(sum)).toString(),
                    supporter.rows[0].amount_donations+1,
                    backer.rows[0].id,
                ])
            } else {
                await db.query(`INSERT INTO supporters (username, backer_id, sum_donations, creator_id, amount_donations ) values ($1, $2, $3, $4, $5) RETURNING * `, [
                    backer.rows[0].username,
                    backer.rows[0].id,
                    sum,
                    creator.rows[0].id,
                    1
                ])
            }


        }
    }

    async getSupporters(req, res) {
        const user_id = req.params.user_id
        const supporters = await db.query('SELECT * FROM supporters WHERE creator_id = $1', [user_id])
        const donations = await db.query('SELECT * FROM donations WHERE creator_id = $1', [user_id])
        res.status(200).json({
            supporters: supporters.rows,
            donations: donations.rows
        })
    }

    async getBackersInfo(req, res) {

        const sumRows = await db.query(`SELECT sum_donation FROM donations`)
        let sum = 0
        sumRows.rows.forEach( (summ) => sum += parseFloat(summ.sum_donation))

            
        const allDonations = await db.query(`SELECT * FROM donations`)
        const sums = allDonations.rows.map( (sum) => (parseFloat(sum.sum_donation))).sort(function(a, b) {
            return a - b;
          }).reverse().slice(0,6)

        let donationsObj = {}

        allDonations.rows.forEach( (donation, dnsIndex) => {

            if (sums.includes(parseFloat(donation.sum_donation))) {
                if (donationsObj[donation.sum_donation] && donationsObj[donation.sum_donation].length>0) {
                    donationsObj[donation.sum_donation].push(donation)
                } else {
                    donationsObj[donation.sum_donation] = [donation]
                }
            }
        })
        let donations = []
        Object.keys(donationsObj).forEach((elem) => (donations = [...donations, ...donationsObj[elem]]))

        const allSupporters = await db.query(`SELECT * FROM supporters`)
        const supportersSums = allSupporters.rows.map( (sum) => (parseFloat(sum.sum_donations))).sort(function(a, b) {
            return a - b;
        }).reverse()
        
        const badges = await db.query(`SELECT * FROM badges`)
        const supDonations = await db.query(`SELECT * FROM donations`)
        const follows = await db.query(`SELECT * FROM follows`)

        let supporters = []
        allSupporters.rows.map( async (supporter) => {
            if (supportersSums.includes(parseFloat(supporter.sum_donations))) {
                let bgs = []
                badges.rows.forEach( (badge) => {
                    if (badge.contributor_user_id_list.includes(supporter.id+' ')) {
                        bgs.push(badge)
                    }
                })
                let dns = []
                supDonations.rows.forEach( (donation) => {
                    if (donation.username === supporter.username) {
                        dns.push(donation)
                    }
                })
                let fls = []
                follows.rows.forEach( (follow) => {
                    console.log(follow)
                    if (parseInt(follow.backer_id) === supporter.id) {
                        fls.push(follow)
                    }
                })
                supporters.push({
                    ...supporter,
                    badges: bgs,
                    donations: dns,
                    follows: fls,
                })
            }
        })
        

        res.status(200).json({
            sum: sum,
            topDonations: donations.reverse(),
            supporters: supporters
        })
    }
}

module.exports = new DonationController()