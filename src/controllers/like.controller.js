import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not exist");
  }

  const like = await Like.find({
    $and: [{ likedBy: req.user._id }, { video: video._id }],
  });

  if (like) {
    const deletedData = await Like.deleteOne({ _id: like._id });

    return res
      .status(200)
      .json(new ApiResponce(200, deletedData, "Video unliked sucessfullu"));
  } else {
    const newLike = Like.create({
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
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
