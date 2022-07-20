const db = require('../db')

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


class BadgeController {
    async createBadge(req, res) {
        const { tron_token, badge_name, badge_desc, link, quantity } = req.body
        
        const creator = await db.query('SELECT * FROM users WHERE tron_token = $1', [tron_token])
        const newBadge = await db.query(`INSERT INTO badges (owner_user_id, badge_name, badge_desc, link, quantity) values ($1, $2, $3, $4, $5) RETURNING *`, [creator.rows[0].id, badge_name, badge_desc, link, quantity])
        res.status(200).json({badge: newBadge.rows[0]})
    }

    async createBadgeImage(req, res) {
        const badge_id = req.params.badge_id
        const file = req.files.file;
        const filename = getImageName()
        file.mv(`images/${filename+file.name.slice(file.name.lastIndexOf('.'))}`, (err) => {})
        await db.query(`UPDATE badges SET badge_image = $1 WHERE id = $2`, [filename+file.name.slice(file.name.lastIndexOf('.')), badge_id])
        res.status(200).json({message: 'success'})
    }

    async assignBadge(req, res) {
        const { badge_id, quantity, owners_quantity, contributor_user_id_list, contributor_id } = req.body
        if (owners_quantity < quantity) {
            const assignedBadge = await db.query('UPDATE badges SET owners_quantity = $1, contributor_user_id_list = $2 WHERE id = $3', [owners_quantity+1, contributor_user_id_list+contributor_id+' ',badge_id])
            res.json(assignedBadge)
        } else {
            res.json({success: false})
        }
    }

    async getBadgesByBacker(req, res) {
        const { tron_token } = req.params.tron_token
        const user = await db.query('SELECT * FROM users WHERE tron_token = $1', [tron_token]) 
        const badges = await db.query(`SELECT * FROM badges WHERE contributor_user_id_list LIKE ' %${user.rows[0]}% '`)
        res.json(badges)
    }

    async getBadgesByCreator(req, res) { 
        const user_id = req.params.user_id

        const badges = await db.query('SELECT * FROM badges WHERE owner_user_id = $1', [parseInt(user_id)])
        //console.log(badges)
        res.status(200).json({badges: badges.rows})
    }
}
module.exports = new BadgeController()