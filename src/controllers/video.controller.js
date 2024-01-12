import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!title) {
    throw new ApiError(402, "No Titel present");
  }

  const videoLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  if (!videoLocalPath) {
    throw new ApiError(402, "Video not present");
  }

  const videoLink = await uploadOnCloudinary(videoLocalPath);
  let thumbnailLink;
  if (thumbnailLocalPath) {
    thumbnailLink = await uploadOnCloudinary(thumbnailLocalPath);
  }

  if (!videoLink) {
    throw new ApiError(401, "Error on uploading the video");
  }

  console.log(videoLink);
  const video = await Video.create({
    videoFile: videoLink.url,
    thumbnail: thumbnailLink?.url || "",
    title: title,
    description: description || "",
    duration: videoLink.duration,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(401, "Error in DB");
  }

  return res
    .status(200)
    .json(new ApiResponce(200, video, "Video uploaded sucessfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!videoId) {
    throw new ApiError(402, "Video id is missing");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video is not found");
  }

  return res
    .status(200)
    .json(new ApiResponce(200, video, "Video fetched Sucessfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!videoId) {
    throw new ApiError(402, "Video id is missing");
  }

  const video = await Video.findById({
    $ans: [{ _id: videoId }, { owner: req.user._id }],
  });

  if (!video) {
    throw new ApiError(404, "Video not present");
  }

  const videoLink = video.videoFile;
  const thumbnailLink = video.thumbnail;

  const deletedData = await Video.deleteOne({
    _id: video._id,
  });

  await deleteOnCloudinary(videoLink);
  await deleteOnCloudinary(thumbnailLink);

  return res
    .status(200)
    .json(new ApiResponce(200, deletedData, "Video deleted Sucessfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(402, "Video is is missing");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.isPublished) {
    video.isPublished = false;
  } else {
    video.isPublished = true;
  }

  const updatedVideo = await video.save();

  return res
    .status(200)
    .json(
      new ApiResponce(200, updatedVideo, "isPublished changed sucessfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
