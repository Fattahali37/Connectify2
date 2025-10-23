const Chat = require('../models/Room')
const { v4: id } = require('uuid')
const Room = require('../models/Room')

exports.getRooms = async (req, res) => {
    try {
        const rooms = await Chat.find({ people: req.user._id })
        res.send(rooms)
    } catch (err) {
        res.send({
            success: false,
            message: err.message,
        });
    }
}

exports.createOrGetRoom = async (req, res) => {
    try {
        const have = await Chat.findOne({ people: { $all: [...req.body.people, req.user._id] } })
        if (have) {
            return res.send(have)
        }
        const newChat = new Chat({
            roomId: id(),
            people: [
                req.user._id, ...req.body.people
            ],
        })
        const room = await newChat.save()
        res.send(room)
    } catch (err) {
        console.log(err);
        res.send({
            success: false,
            message: err.message,
        });
    }
}


exports.findRoom = async (req, res) => {
    try {
        const result = await Chat.findOne({ roomId: req.params.roomId })
        res.send(result)
    } catch (err) {
        res.send({
            success: false,
            message: err.message,
        });
    }
}

exports.leaveChat = async (req, res) => {
    try {
        const roomId = req.body.roomId
        console.log(req.body);
        const room = await Chat.findOne({ roomId })
        if (!room) return res.status(400).send({ success: false, message: "Invalid roomid" })
        if (room.people > 2) {
            const edit = await Chat.updateOne({ roomId }, { $pull: { people: req.user._id } })
            res.send(edit)
        } else {
            const edit = await Chat.deleteOne({ roomId })
            res.send(edit)
        }
    } catch (err) {
        console.log(err);
        res.send({
            success: false,
            message: err.message,
        });
    }
}

// Update last seen timestamp when user views a room
exports.updateLastSeen = async (req, res) => {
    try {
        const { roomId } = req.body;
        const userId = req.user._id;
        
        const room = await Room.findOne({ roomId });
        if (!room) return res.status(404).send({ success: false, message: "Room not found" });
        
        // Update or add lastSeen for this user
        const lastSeenIndex = room.lastSeen.findIndex(ls => ls.userId.toString() === userId.toString());
        
        if (lastSeenIndex >= 0) {
            room.lastSeen[lastSeenIndex].timestamp = new Date();
        } else {
            room.lastSeen.push({ userId, timestamp: new Date() });
        }
        
        await room.save();
        res.send({ success: true });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err.message,
        });
    }
}

// Update last message timestamp when a message is sent
exports.updateLastMessage = async (req, res) => {
    try {
        const { roomId, timestamp } = req.body;
        const userId = req.user._id;
        
        await Room.updateOne(
            { roomId },
            { 
                $set: { 
                    lastMessage: {
                        timestamp: new Date(timestamp),
                        from: userId
                    }
                }
            }
        );
        
        res.send({ success: true });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err.message,
        });
    }
}

// Get count of rooms with unread messages
exports.getUnreadMessageCount = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get all rooms the user is part of
        const rooms = await Room.find({ people: userId });
        
        let unreadCount = 0;
        
        for (const room of rooms) {
            // Find when this user last saw this room
            const userLastSeen = room.lastSeen.find(ls => ls.userId.toString() === userId.toString());
            
            // If there's a last message and either:
            // 1. User has never seen the room, or
            // 2. Last message is newer than when user last saw
            // 3. Last message was not from the user themselves
            if (room.lastMessage && 
                room.lastMessage.from && 
                room.lastMessage.from.toString() !== userId.toString()) {
                
                if (!userLastSeen || 
                    (room.lastMessage.timestamp > userLastSeen.timestamp)) {
                    unreadCount++;
                }
            }
        }
        
        res.json({ success: true, count: unreadCount });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
        });
    }
}