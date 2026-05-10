import mongoose from "mongoose";
import User from "../models/userModel.js";
import Messages from "../models/messagesModel.js";

export const searchContacts = async (req, res, next) => {
  try {
    const { searchTerm } = req.body;
    if (searchTerm === undefined || searchTerm === null) {
      return res.status(400).send("Search Term is required");
    }
    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(sanitizedSearchTerm, "i");
    const contacts = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
      ],
    });
    return res.status(200).json({ contacts });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server Error");
  }
};

export const getContactsForDMList = async (req, res, next) => {
  try {
    let { userId } = req;
    userId = new mongoose.Types.ObjectId(userId);
    // This function builds the "recent chats" sidebar for a user
    // 
    // 1. $match — fetch all messages where this user is sender or recipient
    // 2. $sort — sort messages by timestamp descending (newest first)
    // 3. $group — collapse 100+ messages into unique contacts (one entry per conversation)
    //    - group key is the "other person": if I sent it → recipient, if I received it → sender
    //    - $first picks the most recent timestamp as lastMessageTime (works because we sorted first)
    // 4. $lookup — join Users collection to get name, email, image for each contact
    //    - returns an array by default
    // 5. $unwind — flatten the contactInfo array into a plain object
    // 6. $project — pick only the fields the frontend needs, flatten contactInfo.x → x
    // 7. $sort — sort contacts by lastMessageTime descending
    //    - needed again because $group does not preserve order
    const contacts = await Messages.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        $match: {
          _id: { $ne: null }, // Filter out null values where user was the recipient
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);
    return res.status(200).json({ contacts });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server Error");
  }
};

export const getAllContatcs = async (req, res, next) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId } },
      "firstName lastName _id email"
    );
    const contacts = users.map((user) => ({
      label:user.firstName ?`${user.firstName} ${user.lastName}`:user.email,
      value:user._id
    }));
    return res.status(200).json({ contacts });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server Error");
  }
};
