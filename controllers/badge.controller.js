const db = require('../db')

class BadgeController {
    async createBadge(req, res) {
        const { token, badge_name, badge_desc, link, quantity  } = req.body
        const user = await db.query('SELECT * FROM users WHERE token = $1', [token])
        const newBadge = await db.query(`INSERT INTO badges (owner_user_id, badge_name, badge_desc, link, quantity) values ($1, $2, $3, $4, $5)  RETURNING *`, [user.rows[0].id, badge_name, badge_desc, link, quantity])
        res.json(newBadge)
    }
    
    async assignBadge(req, res) {
        const { badge_id, quantity, owners_quantity, contributor_user_id_list, contributor_id } = req.body
        if (owners_quantity < quantity) {
            const assignedBadge = await db.query('UPDATE badges SET quantity = $1, contributor_user_id_list = $2 WHERE id = $3', [quantity+1, contributor_user_id_list+contributor_id+' ',badge_id])
            res.json(assignedBadge)
        } else {
            res.json({success: false})
        }
    }

    async getBadgesByBacker(req, res) {
        const { token } = req.body
        const user = await db.query('SELECT * FROM users WHERE token = $1', [token]) 
        const badges = await db.query(`SELECT * FROM badges WHERE contributor_user_id_list LIKE ' %${user.rows[0]}% '`)
        res.json(badges)
    }

    async getBadgesByCreator(req, res) {
        const { token } = req.body
        const user = await db.query('SELECT * FROM users WHERE token = $1', [token]) 
        const badges = await db.query('SELECT * FROM badges WHERE owner_user_id = $1', [user.rows[0].id])
        res.json(badges)
    }
}
module.exports = new BadgeController()