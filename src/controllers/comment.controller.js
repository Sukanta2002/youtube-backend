import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: testing required

  const { content, videoId } = req.body;

  if (!content && !videoId) {
    throw new ApiError(402, "Content and video is missing");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const comment = await Comment.create({
    content,
    video: video._id,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponce(200, comment, "Comment added sucesfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: testing required

  const { commentId, content } = req.body;

  if (!content) {
    throw new ApiError(402, "Content is missing");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content,
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponce(200, comment, "Comment updated sucessfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: testing required
  const commentId = req.body.commentId;

  if (!commentId) {
    throw new ApiError(402, "Error is missing");
  }

  const deletedData = await Comment.findByIdAndDelete(commentId, { new: true });

  return res
  .status(200)
  .json(
    new ApiResponce(200,deletedData,"Comment deleted sucessfully")
  )
});

export { getVideoComments, addComment, updateComment, deleteComment };
