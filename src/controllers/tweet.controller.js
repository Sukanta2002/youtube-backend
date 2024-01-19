import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: testing required
  const { content } = req.body;

  if (!content) {
    throw new ApiError(402, "Content is missing");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  if (!tweet) {
    throw new ApiError(400, "Some error occoured");
  }

  return req
    .status(200)
    .json(new ApiResponce(200, tweet, "Tweet created sucesfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: testing required

  const userId = req.params.userId;

  if (!userId) {
    throw new ApiError(402, "User is is missing");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const allTweet = await Tweet.find({ owner: user._id });

  if (allTweet.length) {
    throw new ApiError(404, "No tweet found");
  }

  return res
    .status(200)
    .json(new ApiResponce(200, allTweet, "all tweet fetched"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: testing required

  const { content } = req.body;
  const { tweetId } = req.params;

  if (!content && !tweetId) {
    throw new ApiError(402, "content and tweetId is missing");
  }
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content,
    },
    {
      new: true,
    }
  );

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponce(200, tweet, "Tweet updated sucesfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: testing required

  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(402,"Tweet id is missing")
  }

  const tweet = await Tweet.findById(tweetId)

  if (!tweet) {
    throw new ApiError(404,"Tweet not found")
  }

  const deletedData = await Tweet.deleteOne({_id:tweet._id})

  return res
  .status(200)
  .json(
    new ApiResponce(200,deletedData,"Tweet deleted sucesfully")
  )
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
