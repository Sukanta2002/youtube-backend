import mongoose, { Schema, isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  // steps to do it
  // check if the channel it is exist
  // get the user from the data base
  // check in the subscription model to check if the data exist
  // is exist the make is delete and if not then trun create a new documenr

  if (!channelId) {
    throw new ApiError(402, "Channel id is missing");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "user not exist");
  }

  const subscribe = await Subscription.findOne({
    $and: [{ subscriber: req.user?._id }, { channel: channel._id }],
  });

  if (!subscribe) {
    const newSubscriber = await Subscription.create({
      subscriber: req.user?._id,
      channel: channel._id,
    });

    return res
      .status(200)
      .json(
        new ApiResponce(200, newSubscriber, "Channel subscribed sucessfully")
      );
  } else {
    const deletedData = await Subscription.deleteOne({
      _id: subscribe._id,
    });

    return res
      .status(200)
      .json(
        new ApiResponce(200, deletedData, "Channel unsubscribed sucessfully")
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // steps to implement it
  // find the channel from the user model
  // check if the channel exist
  // write the aggrigation to find out the subscriber

  if (!channelId) {
    throw new ApiError(402, "channel id is missing");
  }

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "Channel is not exist");
  }

  const subscriberList = await Subscription.aggregate([
    {
      $match: {
        channel: channel._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscribers: "$subscribers",
      },
    },
  ]);

  if (subscriberList.length === 0) {
    throw new ApiError(404,"Channel not found")
  }

  return res
  .status(200)
  .json(
    new ApiResponce(200,subscriberList[0],"Subscribers fetched successfully")
  )
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
