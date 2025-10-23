const { getRooms, findRoom, createOrGetRoom, leaveChat, updateLastSeen, updateLastMessage, getUnreadMessageCount } = require('../controllers/chat')
const { isAuthenticated } = require('../middlewares/auth')

const router = require('express').Router()

router.route("/getrooms").get(isAuthenticated, getRooms)
router.route("/handshake").post(isAuthenticated, createOrGetRoom)
router.route('/delete').put(isAuthenticated, leaveChat)
router.route("/update-last-seen").put(isAuthenticated, updateLastSeen)
router.route("/update-last-message").put(isAuthenticated, updateLastMessage)
router.route("/unread-count").get(isAuthenticated, getUnreadMessageCount)
router.route("/:roomId").get(isAuthenticated, findRoom)

module.exports = router