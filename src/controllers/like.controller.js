import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: testing required

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not exist");
  }

  const like = await Like.findOne({
    $and: [{ likedBy: req.user._id }, { video: video._id }],
  });

  if (like) {
    const deletedData = await Like.deleteOne({ _id: like._id });

    return res
      .status(200)
      .json(new ApiResponce(200, deletedData, "Video unliked sucessfullu"));
  } else {
    const newLike = await Like.create({
      likedBy: req.user._id,
      video: video._id,
    });

    return res
      .status(200)
      .json(new ApiResponce(200, newLike, "Video liked sucessfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: testing required

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Video not exist");
  }

  const like = await Like.findOne({
    $and: [{ likedBy: req.user._id }, { comment: comment._id }],
  });

  if (like) {
    const deletedData = await Like.deleteOne({ _id: like._id });

    return res
      .status(200)
      .json(new ApiResponce(200, deletedData, "Comment unliked sucessfullu"));
  } else {
    const newLike = await Like.create({
      likedBy: req.user._id,
      video: comment._id,
    });

    return res
      .status(200)
      .json(new ApiResponce(200, newLike, "Comment liked sucessfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: testing required

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not exist");
  }

  const like = await Like.findOne({
    $and: [{ likedBy: req.user._id }, { tweet: tweet._id }],
  });

  if (like) {
    const deletedData = await Like.deleteOne({ _id: like._id });

    return res
      .status(200)
      .json(new ApiResponce(200, deletedData, "Tweet unliked sucessfullu"));
  } else {
    const newLike = await Like.create({
      likedBy: req.user._id,
      video: tweet._id,
    });

    return res
      .status(200)
      .json(new ApiResponce(200, newLike, "Tweet liked sucessfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {

  const allLikedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: req.user._id,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos",
        
      },
    },
    {
      $addFields: {
        videos: "$videos",
      },
    },
    {
      $project: {
        likedBy: 1,
        videos: 1,
      },
    },
  ]);


  return res
  .status(200)
  .json(
    new ApiResponce(200,allLikedVideos[0],"fetched all liked videos by user")
  )
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
