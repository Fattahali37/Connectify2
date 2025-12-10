const { getUser, followHandle, getFollowings, getFollowers, notications, hasNotications, updateUser, search, getUserById, suggestions, changePassword, getAllUsers, resetPassword, checkResetToken, handleNewPassword, getUnreadNotificationCount, markNotificationsAsRead, getFollowRequests, acceptFollowRequest, rejectFollowRequest, getFollowRequestCount } = require('../controllers/user')
const { isAuthenticated } = require('../middlewares/auth')

const router = require('express').Router()

router.route('/').put(isAuthenticated, updateUser)

router.route('/allusers').get(isAuthenticated, getAllUsers)

router.route("/suggestions").get(isAuthenticated, suggestions)

router.route("/changepassword").put(isAuthenticated, changePassword)

router.route("/reset").post(resetPassword)

router.route('/newpassword').post(handleNewPassword)

router.route("/checkreset/:token").get(checkResetToken)

router.route('/get/:id').get(getUserById)

router.route("/handlefollow/:userId").get(isAuthenticated, followHandle)

router.route("/followings/:userId").get(isAuthenticated, getFollowings)

router.route("/followers/:userId").get(isAuthenticated, getFollowers)

router.route("/search/:text").get(isAuthenticated, search)

router.route("/view/notifications").get(isAuthenticated, notications)

router.route("/view/has-notifications").get(isAuthenticated, hasNotications)

router.route("/notifications/unread-count").get(isAuthenticated, getUnreadNotificationCount)

router.route("/notifications/mark-read").put(isAuthenticated, markNotificationsAsRead)

// Follow request routes
router.route("/follow-requests").get(isAuthenticated, getFollowRequests)

router.route("/follow-requests/count").get(isAuthenticated, getFollowRequestCount)

router.route("/follow-requests/accept/:userId").post(isAuthenticated, acceptFollowRequest)

router.route("/follow-requests/reject/:userId").post(isAuthenticated, rejectFollowRequest)

router.route('/:username').get(getUser)

module.exports = router